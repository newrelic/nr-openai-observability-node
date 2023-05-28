import { CreateCompletionRequest, CreateCompletionResponse } from 'openai';
import { EventData } from './eventTypes';
import { EventAttributesBuilder } from './eventAttributesBuilder';

export const createCompletionEventDataFactory = () => {
  const createEventData = (
    request: CreateCompletionRequest,
    response: CreateCompletionResponse,
    response_time: number
  ): EventData => {
    const attributes = new EventAttributesBuilder({
      initialAttributes: { response_time },
      specialTreatments: {
        messages: {
          parseValue: (value) => JSON.stringify(value),
        },
      },
    })
      .addObjectAttributes(request)
      .addObjectAttributes(response)
      .getAttributes();

    return { eventType: 'OpenAICompletion', attributes };
  };

  return {
    createEventData,
  };
};
