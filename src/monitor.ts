import { OpenAIApi } from 'openai';

import { OpenAIEventClient } from './eventsClient';
import { createChatCompletionEventDataFactory } from './chatCompletionEventDataFactory';
import { createCompletionEventDataFactory } from './completionEventDataFactory';

export const creteMonitor = (
  openAIApi: OpenAIApi,
  eventClient: OpenAIEventClient,
) => {
  const chatCompletionEventDataFactory = createChatCompletionEventDataFactory();
  const completionEventDataFactory = createCompletionEventDataFactory();

  const start = () => {
    openAIApi.createCompletion = patchCompletion(
      openAIApi.createCompletion.bind(openAIApi),
    );
    openAIApi.createChatCompletion = patchChatCompletion(
      openAIApi.createChatCompletion.bind(openAIApi),
    );
  };

  const patchCompletion = (
    createCompletion: OpenAIApi['createCompletion'],
  ): OpenAIApi['createCompletion'] => {
    return async (...args: Parameters<OpenAIApi['createCompletion']>) => {
      const { getDuration } = startTimer();
      const response = await createCompletion(...args);

      try {
        const eventDataList = completionEventDataFactory.createEventData({
          request: args[0],
          responseData: response.data,
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
          completionEventDataFactory.createEventData({
            request: args[0],
            responseData: response.data,
            responseTime,
          });

        const chatCompletionEventDataList =
          chatCompletionEventDataFactory.createEventDataList({
            request: args[0],
            responseData: response.data,
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

  return {
    start,
  };
};
