import { ChatCompletionRequestMessageRoleEnum, OpenAIApi } from 'openai';

import { creteMonitor } from '../src/monitor';
import { OpenAIEventClient } from '../src/eventsClient';

const model = 'gpt-4';
const question = 'Are you alive?';
const answer = 'No, I am a machine';

const createDelayedResponse =
  (result: any): ((...args: any[]) => Promise<any>) =>
  () =>
    new Promise((resolve) => setTimeout(() => resolve(result), 1));

describe('Monitor', () => {
  let openai: OpenAIApi;
  let eventClient: OpenAIEventClient;

  beforeEach(() => {
    openai = {
      createCompletion: jest.fn(),
      createChatCompletion: jest.fn(),
    } as unknown as OpenAIApi;

    eventClient = {
      send: jest.fn(),
    } as unknown as OpenAIEventClient;
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

    const monitor = creteMonitor(openai, eventClient);
    monitor.start();

    await openai.createCompletion({
      prompt: question,
      model,
    });

    expect(eventClient.send).toHaveBeenCalledWith([
      {
        eventType: 'OpenAICompletion',
        attributes: {
          model,
          prompt: question,
          response_time: expect.any(Number),
          'choices.0.text': choices[0].text,
        },
      },
    ]);
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
        })
      );

      const monitor = creteMonitor(openai, eventClient);
      monitor.start();

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
      expect(eventClient.send).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            eventType: 'ChatCompletionMessage',
            attributes: {
              model,
              sequence: 0,
              completion_id: expect.any(String),
              content: question,
              id: expect.any(String),
              role: ChatCompletionRequestMessageRoleEnum.User,
              vendor: 'openai',
            },
          },
          {
            eventType: 'ChatCompletionMessage',
            attributes: {
              model,
              sequence: 1,
              completion_id: expect.any(String),
              content: choices[0].message.content,
              id: expect.any(String),
              role: choices[0].message.role,
              vendor: 'openai',
            },
          },
        ])
      );
    });

    it('should send ChatCompletionSummary event', async () => {
      expect(eventClient.send).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            eventType: 'ChatCompletionSummary',
            attributes: {
              model,
              id: expect.any(String),
              timestamp: expect.any(Number),
              vendor: 'openai',
              finish_reason: choices[0].finish_reason,
              response_time: expect.any(Number),
              number_of_messages: 2,
              prompt_tokens: usage?.prompt_tokens,
              total_tokens: usage?.total_tokens,
              usage_completion_tokens: usage?.completion_tokens,
              'array.0.key': array[0].key,
              'object.key': object.key,
            },
          },
        ])
      );
    });
  });
});
