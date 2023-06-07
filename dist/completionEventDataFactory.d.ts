import { CreateCompletionRequest, CreateCompletionResponse } from 'openai';
import { EventData } from './eventTypes';
export interface ChatCompletionEventDataFactoryOptions {
    request: CreateCompletionRequest;
    responseData: CreateCompletionResponse;
    responseTime: number;
    applicationName: string;
}
export declare const createCompletionEventDataFactory: () => {
    createEventData: ({ request, responseData, applicationName, responseTime: response_time, }: ChatCompletionEventDataFactoryOptions) => EventData;
};
