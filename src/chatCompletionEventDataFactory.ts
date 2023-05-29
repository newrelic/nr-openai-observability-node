import { v4 as uuid } from 'uuid';
import {
  Configuration,
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
} from 'openai';

import {
  ChatCompletionSummaryAttributes,
  EventAttributes,
  EventData,
} from './eventTypes';
import {
  filterUndefinedValues,
  isString,
  removeUndefinedValues,
} from './utility';
import { EventAttributesBuilder } from './eventAttributesBuilder';

export type RequestHeaders = Record<
  string,
  string | number | boolean | undefined
>;

export interface ChatCompletionEventDataFactoryOptions {
  request: CreateChatCompletionRequest;
  responseData: CreateChatCompletionResponse;
  responseTime: number;
  headers?: RequestHeaders;
  openAiConfiguration?: Configuration;
}

export const createChatCompletionEventDataFactory = () => {
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
          sequence,
          completion_id,
          content: message.content,
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
      responseTime: response_time,
      headers,
      openAiConfiguration,
    }: ChatCompletionEventDataFactoryOptions,
  ): EventData => {
    const { usage, choices } = responseData;

    const initialAttributes: ChatCompletionSummaryAttributes = {
      id,
      response_time,
      timestamp: Date.now(),
      number_of_messages: getMessages(request, responseData).length,
      vendor: 'openAI',
      finish_reason: choices[choices.length - 1].finish_reason,
      prompt_tokens: usage?.prompt_tokens,
      total_tokens: usage?.total_tokens,
      usage_completion_tokens: usage?.completion_tokens,
      ratelimit_limit_requests: headers?.['x-ratelimit-limit-requests'],
      ratelimit_limit_tokens: headers?.['x-ratelimit-limit-tokens'],
      ratelimit_reset_tokens: headers?.['x-ratelimit-reset-tokens'],
      ratelimit_reset_requests: headers?.['x-ratelimit-reset-requests'],
      ratelimit_remaining_tokens: headers?.['x-ratelimit-remaining-tokens'],
      ratelimit_remaining_requests: headers?.['x-ratelimit-remaining-requests'],
      organization: openAiConfiguration?.organization,
      api_version: openAiConfiguration?.baseOptions?.apiVersion,
      api_key_last_four_digits: isString(openAiConfiguration?.apiKey)
        ? openAiConfiguration?.apiKey.slice(-4)
        : undefined,
    };

    const attributes = new EventAttributesBuilder({
      initialAttributes:
        removeUndefinedValues<EventAttributes>(initialAttributes),
      specialTreatments: {
        usage: {
          skip: true,
        },
        choices: {
          skip: true,
        },
        id: {
          skip: true,
        },
        messages: {
          skip: true,
        },
      },
    })
      .addObjectAttributes(request)
      .addObjectAttributes(responseData)
      .getAttributes();

    return {
      eventType: 'LlmChatCompletionSummary',
      attributes,
    };
  };

  const getMessages = (
    request: CreateChatCompletionRequest,
    response: CreateChatCompletionResponse,
  ) => {
    return [
      ...request.messages,
      ...response.choices.map(({ message }) => message),
    ].filter(filterUndefinedValues);
  };

  return {
    createEventDataList,
  };
};
