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
  CommonSummaryAttributesFactory,
} from './commonSummaryAttributesFactory';

export interface ChatCompletionEventDataFactoryOptions {
  request: CreateChatCompletionRequest;
  responseData?: CreateChatCompletionResponse;
  responseTime: number;
  responseHeaders?: ResponseHeaders;
  responseError?: OpenAIError;
}

export class ChatCompletionEventDataFactory {
  private readonly applicationName: string;
  private readonly commonSummaryAttributesFactory: CommonSummaryAttributesFactory;

  constructor({
    applicationName,
    openAiConfiguration,
  }: CommonSummaryAttributesFactoryOptions) {
    this.applicationName = applicationName;
    this.commonSummaryAttributesFactory = new CommonSummaryAttributesFactory({
      applicationName,
      openAiConfiguration,
    });
  }

  createEventDataList(
    options: ChatCompletionEventDataFactoryOptions,
  ): EventData[] {
    const completionId = uuid();

    const messageDataList = this.createMessageEventDataList(
      completionId,
      options,
    );
    const summaryData = this.createSummaryEventData(completionId, options);

    return [...messageDataList, summaryData];
  }

  private createMessageEventDataList(
    completion_id: string,
    { request, responseData }: ChatCompletionEventDataFactoryOptions,
  ): EventData[] {
    return this.getMessages(request, responseData).map((message, sequence) => ({
      eventType: 'LlmChatCompletionMessage',
      attributes: {
        id: uuid(),
        applicationName: this.applicationName,
        sequence,
        completion_id,
        content: this.cutContent(message.content) ?? '',
        role: message.role,
        model: request.model,
        vendor: 'openAI',
      },
    }));
  }

  private createSummaryEventData(
    id: string,
    {
      request,
      responseData,
      ...restOptions
    }: ChatCompletionEventDataFactoryOptions,
  ): EventData {
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
      number_of_messages: this.getMessages(request, responseData).length,
      ...this.commonSummaryAttributesFactory.createAttributes({
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
  }

  private cutContent(inputString = ''): string {
    const maxLength = 4095;
    return inputString.slice(0, maxLength);
  }

  private getMessages(
    request: CreateChatCompletionRequest,
    responseData?: CreateChatCompletionResponse,
  ) {
    if (!responseData) {
      return [...(request.messages ?? [])]
        .filter(filterUndefinedValues)
        .filter((item) => item.content);
    }
    return [
      ...(request.messages ?? []),
      ...(responseData?.choices ?? []).map(({ message }) => message),
    ].filter(filterUndefinedValues);
  }
}
