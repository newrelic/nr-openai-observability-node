import { CreateCompletionRequest, CreateCompletionResponse } from 'openai';
import { EventData, OpenAIError } from './eventTypes';
import { EventAttributesBuilder } from './eventAttributesBuilder';

export interface ChatCompletionEventDataFactoryOptions {
  request: CreateCompletionRequest;
  response?: CreateCompletionResponse;
  responseTime: number;
  applicationName: string;
  error?: OpenAIError
}


const parseError = (error?: OpenAIError) => {
  if (!error) {
    return
  }
  return { error_type: error?.response?.data.error.type, error_status: error?.response?.status, error_message: error?.message, error_code: error?.response?.data.error.code }
}
export const createCompletionEventDataFactory = () => {
  const createEventData = ({
    request,
    response,
    applicationName,
    responseTime: response_time,
    error
  }: ChatCompletionEventDataFactoryOptions): EventData => {
    const attributes = new EventAttributesBuilder({
      initialAttributes: { response_time, applicationName },
      specialTreatments: {
        messages: {
          parseValue: (value) => JSON.stringify(value),
        },
      },
    }).addObjectAttributes(request)
      .addObjectAttributes(response).addObjectAttributes(parseError(error))
      .getAttributes();

    return { eventType: 'LlmCompletion', attributes };
  };

  return {
    createEventData,
  };
};
