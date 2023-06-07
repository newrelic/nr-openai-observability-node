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

export type ResponseHeaders = Record<
  string,
  string | number | boolean | undefined
>;

export interface ChatCompletionEventDataFactoryOptions {
  request: CreateChatCompletionRequest;
  responseData: CreateChatCompletionResponse;
  responseTime: number;
  applicationName: string;
  headers: ResponseHeaders;
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
    {
      request,
      responseData,
      applicationName,
    }: ChatCompletionEventDataFactoryOptions,
  ): EventData[] => {
    return getMessages(request, responseData).map<EventData>(
      (message, sequence) => ({
        eventType: 'LlmChatCompletionMessage',
        attributes: {
          id: uuid(),
          applicationName,
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
      applicationName,
    }: ChatCompletionEventDataFactoryOptions,
  ): EventData => {
    const { choices } = responseData;

    const initialAttributes: ChatCompletionSummaryAttributes = {
      id,
      response_time,
      applicationName,
      timestamp: Date.now(),
      number_of_messages: getMessages(request, responseData).length,
      vendor: 'openAI',
      finish_reason: choices
        ? choices[choices.length - 1].finish_reason
        : undefined,
      ratelimit_limit_requests: headers['x-ratelimit-limit-requests'],
      ratelimit_limit_tokens: headers['x-ratelimit-limit-tokens'],
      ratelimit_reset_tokens: headers['x-ratelimit-reset-tokens'],
      ratelimit_reset_requests: headers['x-ratelimit-reset-requests'],
      ratelimit_remaining_tokens: headers['x-ratelimit-remaining-tokens'],
      ratelimit_remaining_requests: headers['x-ratelimit-remaining-requests'],
      organization: headers['openai-organization'],
      api_version: headers['openai-version'],
      api_key_last_four_digits: isString(openAiConfiguration?.apiKey)
        ? `sk-${openAiConfiguration?.apiKey.slice(-4)}`
        : undefined,
    };

    const attributes = new EventAttributesBuilder({
      initialAttributes:
        removeUndefinedValues<EventAttributes>(initialAttributes),
      specialTreatments: {
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
      .addObjectAttributes(responseData)
      .addObjectAttributes(request)
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
