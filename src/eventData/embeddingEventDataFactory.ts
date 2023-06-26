import { v4 as uuid } from 'uuid';
import { CreateEmbeddingRequest, CreateEmbeddingResponse } from 'openai';

import { EventData, OpenAIError } from '../eventTypes';
import { removeUndefinedValues } from './objectUtility';
import {
  CommonSummaryAttributesFactoryOptions,
  ResponseHeaders,
  CommonSummaryAttributesFactory,
} from './commonSummaryAttributesFactory';

export interface EmbeddingEventDataFactoryOptions {
  request: CreateEmbeddingRequest;
  responseData?: CreateEmbeddingResponse;
  responseTime: number;
  responseHeaders?: ResponseHeaders;
  responseError?: OpenAIError;
}

export class EmbeddingEventDataFactory {
  private readonly commonSummaryAttributesFactory: CommonSummaryAttributesFactory;

  constructor(options: CommonSummaryAttributesFactoryOptions) {
    this.commonSummaryAttributesFactory = new CommonSummaryAttributesFactory(
      options,
    );
  }

  createEventData({
    request,
    ...restOptions
  }: EmbeddingEventDataFactoryOptions): EventData {
    const attributeKeySpecialTreatments = {
      data: {
        skip: true,
      },
    };

    const attributes = {
      input: request.input,
      ...this.commonSummaryAttributesFactory.createAttributes({
        id: uuid(),
        request,
        attributeKeySpecialTreatments,
        ...restOptions,
      }),
    };

    return {
      eventType: 'LlmEmbedding',
      attributes: removeUndefinedValues(attributes),
    };
  }
}
