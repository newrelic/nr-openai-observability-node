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
  OpenAIError,
} from './eventTypes';
import {
  filterUndefinedValues,
  isString,
  removeUndefinedValues,
} from './objectUtility';
import { EventAttributesBuilder } from './eventAttributesBuilder';

export interface ChatCompletionFactoryOptions {
  applicationName: string;
  openAiConfiguration?: Configuration;
}

export type ResponseHeader = string | number | boolean | undefined;

export type ResponseHeaders = Record<string, ResponseHeader>;

export interface ChatCompletionEventDataFactoryOptions {
  request: CreateChatCompletionRequest;
  response?: CreateChatCompletionResponse;
  responseTime: number;
  headers?: ResponseHeaders;
  error?: OpenAIError;
}

export const createChatCompletionEventDataFactory = ({
  applicationName,
  openAiConfiguration,
}: ChatCompletionFactoryOptions) => {
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
    { request, response }: ChatCompletionEventDataFactoryOptions,
  ): EventData[] => {
    return getMessages(request, response).map<EventData>(
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
      response,
      responseTime: response_time,
      headers,
      error,
    }: ChatCompletionEventDataFactoryOptions,
  ): EventData => {
    const { choices } = response || {};

    const initialAttributes: ChatCompletionSummaryAttributes = {
      finish_reason: choices?.[choices.length - 1].finish_reason,
      number_of_messages: getMessages(request, response).length,
      id,
      response_time,
      applicationName,
      'request.model': request.model,
      'response.model': response?.model,
      timestamp: Date.now(),
      vendor: 'openAI',
      error_status: error?.response?.status,
      error_message: error?.response
        ? error?.response?.data?.error?.message
        : error?.message,
      error_type: error?.response?.data?.error?.type,
      error_code: error?.response?.data?.error?.code,
      error_param: error?.response?.data?.error?.param,
      organization: headers?.['openai-organization'],
      api_version: headers?.['openai-version'],
      api_key_last_four_digits: isString(openAiConfiguration?.apiKey)
        ? `sk-${openAiConfiguration?.apiKey.slice(-4)}`
        : undefined,
      ...getRateLimitHeaders(headers),
    };

    const attributes = new EventAttributesBuilder({
      initialAttributes:
        removeUndefinedValues<EventAttributes>(initialAttributes),
      specialTreatments: {
        model: {
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
      .addObjectAttributes(response)
      .addObjectAttributes(request)
      .getAttributes();

    return {
      eventType: 'LlmChatCompletionSummary',
      attributes,
    };
  };

  const getMessages = (
    request: CreateChatCompletionRequest,
    response?: CreateChatCompletionResponse,
  ) => {
    if (!response) {
      return [...(request.messages ?? [])]
        .filter(filterUndefinedValues)
        .filter((item) => item.content);
    }
    return [
      ...(request.messages ?? []),
      ...(response?.choices ?? []).map(({ message }) => message),
    ].filter(filterUndefinedValues);
  };

  const getRateLimitHeaders = (headers?: ResponseHeaders) => {
    if (!headers) {
      return {};
    }
    return {
      ratelimit_reset_tokens: headers['x-ratelimit-reset-tokens'] as string,
      ratelimit_reset_requests: headers['x-ratelimit-reset-requests'] as string,
      ratelimit_limit_requests: getHeaderNumber(
        headers['x-ratelimit-limit-requests'],
      ),
      ratelimit_limit_tokens: getHeaderNumber(
        headers['x-ratelimit-limit-tokens'],
      ),
      ratelimit_remaining_tokens: getHeaderNumber(
        headers['x-ratelimit-remaining-tokens'],
      ),
      ratelimit_remaining_requests: getHeaderNumber(
        headers['x-ratelimit-remaining-requests'],
      ),
    };
  };

  const getHeaderNumber = (header: ResponseHeader): number | undefined => {
    const headerNumber = Number(header);
    return !isNaN(headerNumber) ? headerNumber : undefined;
  };

  return {
    createEventDataList,
  };
};
