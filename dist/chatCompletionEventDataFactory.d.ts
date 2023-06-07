import { Configuration, CreateChatCompletionRequest, CreateChatCompletionResponse } from 'openai';
import { EventData } from './eventTypes';
export type ResponseHeaders = Record<string, string | number | boolean | undefined>;
export interface ChatCompletionEventDataFactoryOptions {
    request: CreateChatCompletionRequest;
    responseData: CreateChatCompletionResponse;
    responseTime: number;
    applicationName: string;
    headers: ResponseHeaders;
    openAiConfiguration?: Configuration;
}
export declare const createChatCompletionEventDataFactory: () => {
    createEventDataList: (options: ChatCompletionEventDataFactoryOptions) => EventData[];
};
