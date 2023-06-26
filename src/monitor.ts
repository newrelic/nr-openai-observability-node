import { OpenAIApi } from 'openai';
import { createEventClient, EventClientOptions } from './eventsClient';
import { OpenAIError } from './eventTypes';
import {
  ChatCompletionEventDataFactory,
  CompletionEventDataFactory,
  EmbeddingEventDataFactory,
} from './eventData';

export interface MonitorOpenAIOptions extends EventClientOptions {
  applicationName: string;
}

export const monitorOpenAI = (
  openAIApi: OpenAIApi,
  options: MonitorOpenAIOptions,
) => {
  const { applicationName } = options;
  const openAiConfiguration = openAIApi['configuration'];

  const eventClient = createEventClient(options);
  const chatCompletionEventDataFactory = new ChatCompletionEventDataFactory({
    applicationName,
    openAiConfiguration,
  });
  const embeddingEventDataFactory = new EmbeddingEventDataFactory({
    applicationName,
    openAiConfiguration,
  });
  const completionEventDataFactory = new CompletionEventDataFactory({
    applicationName,
  });

  const patchCompletion = (
    createCompletion: OpenAIApi['createCompletion'],
  ): OpenAIApi['createCompletion'] => {
    return async (
      ...[request, options]: Parameters<OpenAIApi['createCompletion']>
    ) => {
      return monitorResponse(
        () => createCompletion(request, options),
        ({ response, responseError, getDuration }) => {
          const eventData = completionEventDataFactory.createEventData({
            request,
            responseData: response?.data,
            responseTime: getDuration(),
            responseError,
          });
          eventClient.send(eventData);
        },
      );
    };
  };

  const patchChatCompletion = (
    createChatCompletion: OpenAIApi['createChatCompletion'],
  ): OpenAIApi['createChatCompletion'] => {
    return async (
      ...[request, options]: Parameters<OpenAIApi['createChatCompletion']>
    ) => {
      return monitorResponse(
        () => createChatCompletion(request, options),
        ({ response, responseError, getDuration }) => {
          const eventDataList =
            chatCompletionEventDataFactory.createEventDataList({
              request,
              responseData: response?.data,
              responseTime: getDuration(),
              responseHeaders: response?.headers,
              responseError,
            });
          eventClient.send(...eventDataList);
        },
      );
    };
  };

  const patchEmbedding = (
    createEmbedding: OpenAIApi['createEmbedding'],
  ): OpenAIApi['createEmbedding'] => {
    return async (
      ...[request, options]: Parameters<OpenAIApi['createEmbedding']>
    ) => {
      return monitorResponse(
        () => createEmbedding(request, options),
        ({ response, responseError, getDuration }) => {
          const eventData = embeddingEventDataFactory.createEventData({
            request,
            responseData: response?.data,
            responseTime: getDuration(),
            responseHeaders: response?.headers,
            responseError,
          });
          eventClient.send(eventData);
        },
      );
    };
  };

  const monitorResponse = async <TResponse>(
    call: () => Promise<TResponse>,
    onResponse: (options: {
      response?: TResponse;
      responseError?: OpenAIError;
      getDuration: () => number;
    }) => void,
  ): Promise<TResponse> => {
    const { getDuration } = startTimer();
    try {
      const response = await call();
      try {
        onResponse({ response, getDuration });
      } catch (error: any) {
        console.error(error);
      }
      return response;
    } catch (responseError: any) {
      try {
        onResponse({ responseError, getDuration });
      } catch (error) {
        console.error(error);
      }
      throw responseError;
    }
  };

  const startTimer = () => {
    const startTime = new Date();

    return {
      getDuration: () => new Date().valueOf() - startTime.valueOf(),
    };
  };

  openAIApi.createCompletion = patchCompletion(
    openAIApi.createCompletion.bind(openAIApi),
  );
  openAIApi.createChatCompletion = patchChatCompletion(
    openAIApi.createChatCompletion.bind(openAIApi),
  );
  openAIApi.createEmbedding = patchEmbedding(
    openAIApi.createEmbedding.bind(openAIApi),
  );
};
