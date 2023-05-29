import { CreateCompletionRequest, CreateCompletionResponse } from 'openai';
import { EventData } from './eventTypes';
import { EventAttributesBuilder } from './eventAttributesBuilder';

export interface ChatCompletionEventDataFactoryOptions {
  request: CreateCompletionRequest;
  responseData: CreateCompletionResponse;
  responseTime: number;
}

export const createCompletionEventDataFactory = () => {
  const createEventDataList = ({
    request,
    responseData,
    responseTime: response_time,
  }: ChatCompletionEventDataFactoryOptions): EventData[] => {
    const attributes = new EventAttributesBuilder({
      initialAttributes: { response_time },
      specialTreatments: {
        messages: {
          parseValue: (value) => JSON.stringify(value),
        },
      },
    })
      .addObjectAttributes(request)
      .addObjectAttributes(responseData)
      .getAttributes();

    return [
      { eventType: 'OpenAICompletion', attributes },
      { eventType: 'LlmCompletion', attributes },
    ];
  };

  return {
    createEventData: createEventDataList,
  };
};
