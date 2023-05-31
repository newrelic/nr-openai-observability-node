import { ChatCompletionRequestMessageRoleEnum, OpenAIApi } from 'openai';

import { monitorOpenAI } from '../src';
import { sendEventMock } from './__mocks__/@newrelic/telemetry-sdk';

const model = 'gpt-4';
const question = 'Are you alive?';
const answer = 'No, I am a machine';
const newRelicApiKey = 'NEW_RELIC_API_KEY';

const createDelayedResponse =
  (result: any): ((...args: any[]) => Promise<any>) =>
  () =>
    new Promise((resolve) => setTimeout(() => resolve(result), 1));

describe('monitorOpenAI', () => {
  let openai: OpenAIApi;

  beforeEach(() => {
    openai = {
      createCompletion: () => {},
      createChatCompletion: () => {},
    } as unknown as OpenAIApi;

    sendEventMock.mockImplementation();
  });

  it('when monitoring createCompletion should send OpenAICompletion event', async () => {
    const choices = [
      {
        text: answer,
      },
    ];

    jest
      .spyOn(openai, 'createCompletion')
      .mockImplementation(createDelayedResponse({ data: { choices } }));

    monitorOpenAI(openai, {
      newRelicApiKey,
    });

    await openai.createCompletion({
      prompt: question,
      model,
    });

    expect(sendEventMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        {
          eventType: 'LlmCompletion',
          attributes: {
            model,
            prompt: question,
            response_time: expect.any(Number),
            'choices.0.text': choices[0].text,
          },
        },
      ]),
    );
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

    const usage = {
      prompt_tokens: 1,
      total_tokens: 2,
      completion_tokens: 3,
    };

    const object = { key: 'objectKey' };
    const array = [{ key: 'arrayKey' }];

    beforeEach(async () => {
      jest.spyOn(openai, 'createChatCompletion').mockImplementation(
        createDelayedResponse({
          data: { choices, usage, object, array },
        }),
      );

      monitorOpenAI(openai, {
        newRelicApiKey,
      });

      const messages = [
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: question,
        },
      ];

      await openai.createChatCompletion({
        messages,
        model,
      });
    });

    it('should send ChatCompletionMessage events', async () => {
      expect(sendEventMock).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            eventType: 'LlmChatCompletionMessage',
            attributes: {
              model,
              sequence: 0,
              completion_id: expect.any(String),
              content: question,
              id: expect.any(String),
              role: ChatCompletionRequestMessageRoleEnum.User,
              vendor: 'openAI',
            },
          },
          {
            eventType: 'LlmChatCompletionMessage',
            attributes: {
              model,
              sequence: 1,
              completion_id: expect.any(String),
              content: choices[0].message.content,
              id: expect.any(String),
              role: choices[0].message.role,
              vendor: 'openAI',
            },
          },
        ]),
      );
    });

    it('should send ChatCompletionSummary event', async () => {
      expect(sendEventMock).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            eventType: 'LlmChatCompletionSummary',
            attributes: expect.objectContaining({
              model,
              id: expect.any(String),
              timestamp: expect.any(Number),
              vendor: 'openAI',
              finish_reason: choices[0].finish_reason,
              response_time: expect.any(Number),
              number_of_messages: 2,
              prompt_tokens: usage?.prompt_tokens,
              total_tokens: usage?.total_tokens,
              usage_completion_tokens: usage?.completion_tokens,
              'array.0.key': array[0].key,
              'object.key': object.key,
            }),
          },
        ]),
      );
    });
  });
});
