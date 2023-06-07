import { EventData } from './eventTypes';
export interface EventClientOptions {
    /**
     * API key with insert access used to authenticate the request.
     * For more information on creating keys, please see:
     * https://docs.newrelic.com/docs/insights/insights-data-sources/custom-data/introduction-event-api#register
     */
    newRelicApiKey?: string;
    /**
     * Optional host override for event endpoint.
     */
    host?: string;
    /**
     * Optional port override for trace endpoint.
     */
    port?: number;
}
export interface OpenAIEventClient {
    send: (...eventDataList: EventData[]) => void;
}
export declare const createEventClient: (options?: EventClientOptions) => OpenAIEventClient;
