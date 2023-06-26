import { v4 as uuid } from 'uuid';
import { CreateEmbeddingRequest, CreateEmbeddingResponse } from 'openai';

import { EventData, OpenAIError } from '../eventTypes';
import { removeUndefinedValues } from './objectUtility';
import {
  CommonSummaryAttributesFactoryOptions,
  ResponseHeaders,
  createCommonSummaryAttributesFactory,
} from './commonSummaryAttributesFactory';

export interface EmbeddingEventDataFactoryOptions {
  request: CreateEmbeddingRequest;
  responseData?: CreateEmbeddingResponse;
  responseTime: number;
  responseHeaders?: ResponseHeaders;
  responseError?: OpenAIError;
}

export const createEmbeddingEventDataFactory = ({
  applicationName,
  openAiConfiguration,
}: CommonSummaryAttributesFactoryOptions) => {
  const commonSummaryAttributesFactory = createCommonSummaryAttributesFactory({
    applicationName,
    openAiConfiguration,
  });

  const createEventData = ({
    request,
    ...restOptions
  }: EmbeddingEventDataFactoryOptions): EventData => {
    const attributeKeySpecialTreatments = {
      data: {
        skip: true,
      },
    };

    const attributes = {
      input: request.input,
      ...commonSummaryAttributesFactory.createAttributes({
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
  };

  return {
    createEventData,
  };
};
