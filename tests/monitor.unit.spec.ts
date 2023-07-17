import { ChatCompletionRequestMessageRoleEnum, OpenAIApi } from 'openai';

import { monitorOpenAI } from '../src';
import {
  getSentEvent,
  sendEventMock,
} from './__mocks__/@newrelic/telemetry-sdk';
import { TestEnvironment } from './testEnvironment';

const model = 'gpt-4';
const question = 'Are you alive?';
const answer = 'No, I am a machine';
const newRelicApiKey = 'NEW_RELIC_LICENSE_KEY';
const applicationName = 'Test';
const temperature = 1;

const createDelayedResponse =
  (result: any): ((...args: any[]) => Promise<any>) =>
  () =>
    new Promise((resolve) => setTimeout(() => resolve(result), 1));

describe('monitorOpenAI', () => {
  //@ts-ignore
  let openai: OpenAIApi;

  beforeEach(() => {
    openai = {
      configuration: {
        apiKey: 'test',
      },
    } as unknown as OpenAIApi;

    sendEventMock.mockClear();
  });

  it('when monitoring createCompletion should send LlmCompletion event', async () => {
    const choices = [
      {
        text: answer,
      },
    ];

    jest
      .spyOn(OpenAIApi.prototype, 'createCompletion')
      .mockImplementation(createDelayedResponse({ data: { choices } }));

    monitorOpenAI(openai, {
      newRelicApiKey,
      applicationName,
    });

    await OpenAIApi.prototype.createCompletion({
      prompt: question,
      model,
    });

    expect(getSentEvent(0)).toEqual({
      eventType: 'LlmCompletion',
      attributes: {
        model,
        applicationName,
        prompt: question,
        response_time: expect.any(Number),
        'choices.0.text': choices[0].text,
      },
    });
  });

  describe('when monitoring createChatCompletion', () => {
    const choices = [
      {
        message: {
          content: answer,
          role: ChatCompletionRequestMessageRoleEnum.Assistant,
        },
        finish_reason: 'stop',
      },
    ];

    const object = { key: 'objectKey' };
    const array = [{ key: 'arrayKey' }];

    beforeEach(async () => {
      jest
        .spyOn(OpenAIApi.prototype, 'createChatCompletion')
        .mockImplementation(
          createDelayedResponse({
            data: { choices, object, array, model },
            headers: {},
          }),
        );

      monitorOpenAI(openai, {
        newRelicApiKey,
        applicationName,
      });

      const messages = [
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: question,
        },
      ];

      await OpenAIApi.prototype.createChatCompletion({
        messages,
        temperature,
        model,
      });
    });

    it('should send LlmChatCompletionMessage events', async () => {
      expect(getSentEvent(0)).toEqual({
        eventType: 'LlmChatCompletionMessage',
        attributes: {
          model,
          applicationName,
          sequence: 0,
          completion_id: expect.any(String),
          content: question,
          id: expect.any(String),
          role: ChatCompletionRequestMessageRoleEnum.User,
          vendor: 'openAI',
        },
      });

      expect(getSentEvent(1)).toEqual({
        eventType: 'LlmChatCompletionMessage',
        attributes: {
          model,
          applicationName,
          sequence: 1,
          completion_id: expect.any(String),
          content: choices[0].message.content,
          id: expect.any(String),
          role: choices[0].message.role,
          vendor: 'openAI',
        },
      });
    });

    it('should send LlmChatCompletionSummary event', async () => {
      expect(getSentEvent(2)).toEqual({
        eventType: 'LlmChatCompletionSummary',
        attributes: {
          'request.model': model,
          'response.model': model,
          applicationName,
          temperature,
          id: expect.any(String),
          timestamp: expect.any(Number),
          vendor: 'openAI',
          finish_reason: choices[0].finish_reason,
          response_time: expect.any(Number),
          number_of_messages: 2,
          api_key_last_four_digits: expect.any(String),
          'array.0.key': array[0].key,
          'object.key': object.key,
        },
      });
    });
  });
});
