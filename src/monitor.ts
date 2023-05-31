import { OpenAIApi } from 'openai';

import { createEventClient, EventClientOptions } from './eventsClient';
import { createChatCompletionEventDataFactory } from './chatCompletionEventDataFactory';
import { createCompletionEventDataFactory } from './completionEventDataFactory';

export interface MonitorOpenAIOptions extends EventClientOptions {
  applicationName: string;
}

export const monitorOpenAI = (
  openAIApi: OpenAIApi,
  options: MonitorOpenAIOptions,
) => {
  const eventClient = createEventClient(options);
  const chatCompletionEventDataFactory = createChatCompletionEventDataFactory();
  const completionEventDataFactory = createCompletionEventDataFactory();
  const { applicationName } = options;

  const patchCompletion = (
    createCompletion: OpenAIApi['createCompletion'],
  ): OpenAIApi['createCompletion'] => {
    return async (...args: Parameters<OpenAIApi['createCompletion']>) => {
      const { getDuration } = startTimer();
      const response = await createCompletion(...args);

      try {
        const eventDataList = completionEventDataFactory.createEventDataList({
          request: args[0],
          responseData: response.data,
          applicationName,
          responseTime: getDuration(),
        });
        eventClient.send(eventDataList);
      } catch (error: any) {
        console.error(error);
      }

      return response;
    };
  };

  const patchChatCompletion = (
    createChatCompletion: OpenAIApi['createChatCompletion'],
  ): OpenAIApi['createChatCompletion'] => {
    return async (...args: Parameters<OpenAIApi['createChatCompletion']>) => {
      const { getDuration } = startTimer();
      const response = await createChatCompletion(...args);

      try {
        const responseTime = getDuration();

        const completionEventDataList =
          completionEventDataFactory.createEventDataList({
            request: args[0],
            responseData: response.data,
            applicationName,
            responseTime,
          });

        const chatCompletionEventDataList =
          chatCompletionEventDataFactory.createEventDataList({
            request: args[0],
            responseData: response.data,
            applicationName,
            responseTime,
            headers: args[1]?.headers,
            openAiConfiguration: openAIApi['configuration'],
          });
        eventClient.send([
          ...chatCompletionEventDataList,
          ...completionEventDataList,
        ]);
      } catch (error: any) {
        console.error(error);
      }

      return response;
    };
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
