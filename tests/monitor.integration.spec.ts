import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai';

import { monitorOpenAI } from '../src';
import {
  getSentEvent,
  sendEventMock,
} from './__mocks__/@newrelic/telemetry-sdk';
import { TestEnvironment } from './testEnvironment';

const question = 'Are you alive?';
const applicationName = 'Test';

jest.setTimeout(30 * 1000);

describe('monitorOpenAI', () => {
  let openAIApi: OpenAIApi;

  beforeEach(() => {
    openAIApi = new OpenAIApi(
      new Configuration({
        apiKey: TestEnvironment.openaiApiKey,
      }),
    );

    monitorOpenAI(openAIApi, {
      applicationName,
      newRelicApiKey: TestEnvironment.newRelicApiKey,
      host: TestEnvironment.newRelicHost,
    });

    sendEventMock.mockClear();
  });

  it('should send LlmCompletion event when monitoring createCompletion ', async () => {
    const model = 'text-davinci-003';

    await openAIApi.createCompletion({
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
        'usage.completion_tokens': 9,
        'usage.prompt_tokens': 4,
        'usage.total_tokens': 13,
        'choices.0.text': expect.any(String),
        object: 'text_completion',
        'choices.0.finish_reason': 'stop',
        'choices.0.index': 0,
        created: expect.any(Number),
        id: expect.any(String),
      },
    });
  });

  describe('when monitoring createChatCompletion', () => {
    const model = 'gpt-4';
    const temperature = 1;
    const messages = [
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: question,
      },
    ];

    it('should send LlmChatCompletionMessage events', async () => {
      await openAIApi.createChatCompletion({
        messages,
        model,
        temperature,
      });

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
          content: expect.any(String),
          id: expect.any(String),
          role: ChatCompletionRequestMessageRoleEnum.Assistant,
          vendor: 'openAI',
        },
      });
    });

    it('should send LlmChatCompletionSummary event', async () => {
      await openAIApi.createChatCompletion({
        messages,
        model,
        temperature,
      });

      expect(getSentEvent(2)).toEqual({
        eventType: 'LlmChatCompletionSummary',
        attributes: {
          'request.model': model,
          'response.model': expect.any(String),
          temperature,
          applicationName,
          id: expect.any(String),
          timestamp: expect.any(Number),
          created: expect.any(Number),
          vendor: 'openAI',
          finish_reason: 'stop',
          response_time: expect.any(Number),
          number_of_messages: 2,
          object: 'chat.completion',
          api_key_last_four_digits: expect.any(String),
          'usage.prompt_tokens': 11,
          'usage.total_tokens': expect.any(Number),
          'usage.completion_tokens': expect.any(Number),
          ratelimit_limit_requests: expect.any(Number),
          ratelimit_limit_tokens: expect.any(Number),
          ratelimit_remaining_requests: expect.any(Number),
          ratelimit_remaining_tokens: expect.any(Number),
          ratelimit_reset_requests: expect.any(String),
          ratelimit_reset_tokens: expect.any(String),
          organization: expect.any(String),
          api_version: '2020-10-01',
          ingestion_source: expect.any(String),
        },
      });
    });

    it('should send LlmChatCompletionSummary event with error parameters ', async () => {
      const apiKey = 'BAD_KEY';
      openAIApi = new OpenAIApi(
        new Configuration({
          apiKey,
        }),
      );
      monitorOpenAI(openAIApi, {
        applicationName,
        newRelicApiKey: TestEnvironment.newRelicApiKey,
        host: TestEnvironment.newRelicHost,
      });

      try {
        await openAIApi.createChatCompletion({
          messages,
          model,
          temperature,
        });
      } catch (error: any) {
        expect(getSentEvent(1)).toEqual({
          eventType: 'LlmChatCompletionSummary',
          attributes: {
            'request.model': model,
            temperature,
            applicationName,
            id: expect.any(String),
            timestamp: expect.any(Number),
            vendor: 'openAI',
            response_time: expect.any(Number),
            number_of_messages: 1,
            api_key_last_four_digits: expect.any(String),
            error_code: 'invalid_api_key',
            error_message:
              'Incorrect API key provided: BAD_KEY. You can find your API key at https://platform.openai.com/account/api-keys.',
            error_status: 401,
            error_type: 'invalid_request_error',
            ingestion_source: expect.any(String),
          },
        });
      }
    });
  });

  it('should send LlmEmbedding event when monitoring createEmbedding ', async () => {
    const model = 'text-embedding-ada-002';

    await openAIApi.createEmbedding({
      input: question,
      model,
    });

    expect(getSentEvent(0)).toEqual({
      eventType: 'LlmEmbedding',
      attributes: {
        id: expect.any(String),
        applicationName,
        input: question,
        response_time: expect.any(Number),
        'request.model': 'text-embedding-ada-002',
        'response.model': 'text-embedding-ada-002-v2',
        'usage.prompt_tokens': 4,
        'usage.total_tokens': expect.any(Number),
        api_key_last_four_digits: expect.any(String),
        ratelimit_limit_requests: expect.any(Number),
        ratelimit_limit_tokens: expect.any(Number),
        ratelimit_remaining_requests: expect.any(Number),
        ratelimit_remaining_tokens: expect.any(Number),
        ratelimit_reset_requests: expect.any(String),
        ratelimit_reset_tokens: expect.any(String),
        organization: expect.any(String),
        timestamp: expect.any(Number),
        vendor: 'openAI',
        object: 'list',
        api_version: '2020-10-01',
        ingestion_source: expect.any(String),
      },
    });
  });
});
