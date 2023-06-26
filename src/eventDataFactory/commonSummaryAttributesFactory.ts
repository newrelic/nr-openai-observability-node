import {
  Configuration,
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
  CreateEmbeddingRequest,
  CreateEmbeddingResponse,
} from 'openai';

import {
  CommonSummaryAttributes,
  EventAttributes,
  OpenAIError,
} from '../eventTypes';
import { isString, removeUndefinedValues } from './objectUtility';
import {
  AttributeKeySpecialTreatments,
  EventAttributesBuilder,
} from './eventAttributesBuilder';

export interface CommonSummaryAttributesFactoryOptions {
  applicationName: string;
  openAiConfiguration?: Configuration;
}

export type ResponseHeader = string | number | boolean | undefined;

export type ResponseHeaders = Record<string, ResponseHeader>;

export interface CommonSummaryAttributesOptions {
  id: string;
  request: CreateChatCompletionRequest | CreateEmbeddingRequest;
  responseData?: CreateChatCompletionResponse | CreateEmbeddingResponse;
  responseTime: number;
  responseHeaders?: ResponseHeaders;
  responseError?: OpenAIError;
  attributeKeySpecialTreatments?: AttributeKeySpecialTreatments;
}

export class CommonSummaryAttributesFactory {
  constructor(
    private readonly options: CommonSummaryAttributesFactoryOptions,
  ) {}

  createAttributes({
    id,
    request,
    responseData,
    responseTime: response_time,
    responseHeaders,
    responseError,
    attributeKeySpecialTreatments,
  }: CommonSummaryAttributesOptions): EventAttributes {
    const { applicationName, openAiConfiguration } = this.options;

    const initialAttributes: CommonSummaryAttributes = {
      id,
      response_time,
      applicationName,
      'request.model': request.model,
      'response.model': responseData?.model,
      timestamp: Date.now(),
      vendor: 'openAI',
      error_status: responseError?.response?.status,
      error_message: responseError?.response
        ? responseError?.response?.data?.error?.message
        : responseError?.message,
      error_type: responseError?.response?.data?.error?.type,
      error_code: responseError?.response?.data?.error?.code,
      error_param: responseError?.response?.data?.error?.param,
      organization: responseHeaders?.['openai-organization'],
      api_version: responseHeaders?.['openai-version'],
      api_key_last_four_digits: isString(openAiConfiguration?.apiKey)
        ? `sk-${openAiConfiguration?.apiKey.slice(-4)}`
        : undefined,
      ...this.parseRateLimitHeaders(responseHeaders),
    };

    const attributes = new EventAttributesBuilder({
      initialAttributes:
        removeUndefinedValues<EventAttributes>(initialAttributes),
      specialTreatments: {
        ...attributeKeySpecialTreatments,
        model: {
          skip: true,
        },
        id: {
          skip: true,
        },
      },
    })
      .addObjectAttributes(responseData)
      .addObjectAttributes(request)
      .getAttributes();

    return attributes;
  }

  private parseRateLimitHeaders(headers?: ResponseHeaders) {
    if (!headers) {
      return {};
    }

    return {
      ratelimit_reset_tokens: headers['x-ratelimit-reset-tokens'] as string,
      ratelimit_reset_requests: headers['x-ratelimit-reset-requests'] as string,
      ratelimit_limit_requests: this.getHeaderNumber(
        headers['x-ratelimit-limit-requests'],
      ),
      ratelimit_limit_tokens: this.getHeaderNumber(
        headers['x-ratelimit-limit-tokens'],
      ),
      ratelimit_remaining_tokens: this.getHeaderNumber(
        headers['x-ratelimit-remaining-tokens'],
      ),
      ratelimit_remaining_requests: this.getHeaderNumber(
        headers['x-ratelimit-remaining-requests'],
      ),
    };
  }

  private getHeaderNumber(header: ResponseHeader): number | undefined {
    const headerNumber = Number(header);
    return !isNaN(headerNumber) ? headerNumber : undefined;
  }
}
