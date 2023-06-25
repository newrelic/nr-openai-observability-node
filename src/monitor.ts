import { OpenAIApi } from 'openai';
import { createEventClient, EventClientOptions } from './eventsClient';
import { createChatCompletionEventDataFactory } from './chatCompletionEventDataFactory';
import { createCompletionEventDataFactory } from './completionEventDataFactory';
import { OpenAIError } from './eventTypes';

export interface MonitorOpenAIOptions extends EventClientOptions {
  applicationName: string;
}

export const monitorOpenAI = (
  openAIApi: OpenAIApi,
  options: MonitorOpenAIOptions,
) => {
  const { applicationName } = options;

  const eventClient = createEventClient(options);
  const chatCompletionEventDataFactory = createChatCompletionEventDataFactory({
    applicationName,
    openAiConfiguration: openAIApi['configuration'],
  });
  const completionEventDataFactory = createCompletionEventDataFactory({
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
        ({ response, error, getDuration }) => {
          const eventData = completionEventDataFactory.createEventData({
            request,
            response: response?.data,
            responseTime: getDuration(),
            error,
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
        ({ response, error, getDuration }) => {
          const eventDataList =
            chatCompletionEventDataFactory.createEventDataList({
              request,
              response: response?.data,
              responseTime: getDuration(),
              headers: response?.headers,
              error,
            });
          eventClient.send(...eventDataList);
        },
      );
    };
  };

  const monitorResponse = async <TResponse>(
    call: () => Promise<TResponse>,
    onResponse: (options: {
      response?: TResponse;
      error?: OpenAIError;
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
    } catch (errorResponse: any) {
      try {
        onResponse({ error: errorResponse, getDuration });
      } catch (error) {
        console.error(error);
      }
      throw errorResponse;
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
};
