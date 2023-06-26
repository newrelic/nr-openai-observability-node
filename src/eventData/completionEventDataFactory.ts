import { CreateCompletionRequest, CreateCompletionResponse } from 'openai';
import { EventData, OpenAIError } from '../eventTypes';
import { EventAttributesBuilder } from './eventAttributesBuilder';

export interface CompletionFactoryOptions {
  applicationName: string;
}

export interface CompletionEventDataOptions {
  request: CreateCompletionRequest;
  responseData?: CreateCompletionResponse;
  responseTime: number;
  responseError?: OpenAIError;
}

export const createCompletionEventDataFactory = ({
  applicationName,
}: CompletionFactoryOptions) => {
  const createEventData = ({
    request,
    responseData,
    responseTime: response_time,
    responseError,
  }: CompletionEventDataOptions): EventData => {
    const attributes = new EventAttributesBuilder({
      initialAttributes: { response_time, applicationName },
    })
      .addObjectAttributes(request)
      .addObjectAttributes(responseData)
      .addObjectAttributes(parseError(responseError))
      .getAttributes();

    return { eventType: 'LlmCompletion', attributes };
  };

  const parseError = (responseError?: OpenAIError) => {
    if (!responseError) {
      return;
    }

    return {
      error_type: responseError?.response?.data.error.type,
      error_status: responseError?.response?.status,
      error_message: responseError?.message,
      error_code: responseError?.response?.data.error.code,
    };
  };

  return {
    createEventData,
  };
};
