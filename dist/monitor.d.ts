import { OpenAIApi } from 'openai';
import { EventClientOptions } from './eventsClient';
export interface MonitorOpenAIOptions extends EventClientOptions {
    applicationName: string;
}
export declare const monitorOpenAI: (openAIApi: OpenAIApi, options: MonitorOpenAIOptions) => void;
