import { OpenAIApi } from 'openai';

import { OpenAIEventClient } from './eventsClient';
import { createChatCompletionEventDataFactory } from './chatCompletionEventDataFactory';
import { createCompletionEventDataFactory } from './completionEventDataFactory';

export const creteMonitor = (
  openAIApi: OpenAIApi,
  eventClient: OpenAIEventClient
) => {
  const chatCompletionEventDataFactory = createChatCompletionEventDataFactory();
  const completionEventDataFactory = createCompletionEventDataFactory();

  const start = () => {
    openAIApi.createCompletion = patchCompletion(
      openAIApi.createCompletion.bind(openAIApi)
    );
    openAIApi.createChatCompletion = patchChatCompletion(
      openAIApi.createChatCompletion.bind(openAIApi)
    );
  };

  const patchCompletion = (
    createCompletion: OpenAIApi['createCompletion']
  ): OpenAIApi['createCompletion'] => {
    return async (...args: Parameters<OpenAIApi['createCompletion']>) => {
      const { getDuration } = startTimer();
      const response = await createCompletion(...args);

      try {
        const eventData = completionEventDataFactory.createEventData(
          args[0],
          response.data,
          getDuration()
        );
        eventClient.send([eventData]);
      } catch (error: any) {
        console.error(error);
      }

      return response;
    };
  };

  const patchChatCompletion = (
    createChatCompletion: OpenAIApi['createChatCompletion']
  ): OpenAIApi['createChatCompletion'] => {
    return async (...args: Parameters<OpenAIApi['createChatCompletion']>) => {
      const { getDuration } = startTimer();
      const response = await createChatCompletion(...args);

      try {
        const duration = getDuration();

        const oldSchemaEventData = completionEventDataFactory.createEventData(
          args[0],
          response.data,
          duration
        );

        const headers = args[1]?.headers ?? {};
        const newSchemaEventDataList =
          chatCompletionEventDataFactory.createEventDataList(
            args[0],
            response.data,
            duration
          );
        eventClient.send([...newSchemaEventDataList, oldSchemaEventData]);
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
