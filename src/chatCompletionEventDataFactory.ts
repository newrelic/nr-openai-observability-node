import { v4 as uuid } from 'uuid';

import {
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
} from 'openai';
import {
  ChatCompletionSummaryAttributes,
  EventAttributes,
  EventData,
} from './eventTypes';
import { filterUndefinedValues, removeUndefinedValues } from './utility';
import { EventAttributesBuilder } from './eventAttributesBuilder';

export const createChatCompletionEventDataFactory = () => {
  const createEventDataList = (
    request: CreateChatCompletionRequest,
    response: CreateChatCompletionResponse,
    responseTime: number
  ): EventData[] => {
    const completionId = uuid();

    const messageDataList = createMessageEventDataList(
      request,
      response,
      completionId
    );
    const summaryData = createSummaryEventData(
      request,
      response,
      responseTime,
      completionId
    );

    return [...messageDataList, summaryData];
  };

  const createMessageEventDataList = (
    request: CreateChatCompletionRequest,
    response: CreateChatCompletionResponse,
    completion_id: string
  ): EventData[] => {
    return getMessages(request, response).map<EventData>(
      (message, sequence) => ({
        eventType: 'ChatCompletionMessage',
        attributes: {
          id: uuid(),
          sequence,
          completion_id,
          content: message.content,
          role: message.role,
          model: request.model,
          vendor: 'openai',
        },
      })
    );
  };

  const createSummaryEventData = (
    request: CreateChatCompletionRequest,
    response: CreateChatCompletionResponse,
    response_time: number,
    id: string
  ): EventData => {
    const { usage, choices } = response;

    const initialAttributes: ChatCompletionSummaryAttributes = {
      id,
      response_time,
      timestamp: Date.now(),
      number_of_messages: getMessages(request, response).length,
      vendor: 'openai',
      finish_reason: choices[choices.length - 1].finish_reason,
      prompt_tokens: usage?.prompt_tokens,
      total_tokens: usage?.total_tokens,
      usage_completion_tokens: usage?.completion_tokens,
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
      .addObjectAttributes(response)
      .getAttributes();

    return {
      eventType: 'ChatCompletionSummary',
      attributes,
    };
  };

  const getMessages = (
    request: CreateChatCompletionRequest,
    response: CreateChatCompletionResponse
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
