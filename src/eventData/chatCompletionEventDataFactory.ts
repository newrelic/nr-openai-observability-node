import { v4 as uuid } from 'uuid';
import {
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
} from 'openai';

import { EventData, OpenAIError } from '../eventTypes';
import { filterUndefinedValues, removeUndefinedValues } from './objectUtility';
import {
  CommonSummaryAttributesFactoryOptions,
  ResponseHeaders,
  createCommonSummaryAttributesFactory,
} from './commonSummaryAttributesFactory';

export interface ChatCompletionEventDataFactoryOptions {
  request: CreateChatCompletionRequest;
  responseData?: CreateChatCompletionResponse;
  responseTime: number;
  responseHeaders?: ResponseHeaders;
  responseError?: OpenAIError;
}

export const createChatCompletionEventDataFactory = ({
  applicationName,
  openAiConfiguration,
}: CommonSummaryAttributesFactoryOptions) => {
  const commonSummaryAttributesFactory = createCommonSummaryAttributesFactory({
    applicationName,
    openAiConfiguration,
  });

  const createEventDataList = (
    options: ChatCompletionEventDataFactoryOptions,
  ): EventData[] => {
    const completionId = uuid();

    const messageDataList = createMessageEventDataList(completionId, options);
    const summaryData = createSummaryEventData(completionId, options);

    return [...messageDataList, summaryData];
  };

  const createMessageEventDataList = (
    completion_id: string,
    { request, responseData }: ChatCompletionEventDataFactoryOptions,
  ): EventData[] => {
    return getMessages(request, responseData).map<EventData>(
      (message, sequence) => ({
        eventType: 'LlmChatCompletionMessage',
        attributes: {
          id: uuid(),
          applicationName,
          sequence,
          completion_id,
          content: message.content ?? '',
          role: message.role,
          model: request.model,
          vendor: 'openAI',
        },
      }),
    );
  };

  const createSummaryEventData = (
    id: string,
    {
      request,
      responseData,
      ...restOptions
    }: ChatCompletionEventDataFactoryOptions,
  ): EventData => {
    const { choices } = responseData || {};

    const attributeKeySpecialTreatments = {
      choices: {
        skip: true,
      },
      messages: {
        skip: true,
      },
    };

    const attributes = {
      finish_reason: choices?.[choices.length - 1].finish_reason,
      number_of_messages: getMessages(request, responseData).length,
      ...commonSummaryAttributesFactory.createAttributes({
        id,
        request,
        responseData,
        attributeKeySpecialTreatments,
        ...restOptions,
      }),
    };

    return {
      eventType: 'LlmChatCompletionSummary',
      attributes: removeUndefinedValues(attributes),
    };
  };

  const getMessages = (
    request: CreateChatCompletionRequest,
    responseData?: CreateChatCompletionResponse,
  ) => {
    if (!responseData) {
      return [...(request.messages ?? [])]
        .filter(filterUndefinedValues)
        .filter((item) => item.content);
    }
    return [
      ...(request.messages ?? []),
      ...(responseData?.choices ?? []).map(({ message }) => message),
    ].filter(filterUndefinedValues);
  };

  return {
    createEventDataList,
  };
};
