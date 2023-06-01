import { telemetry } from '@newrelic/telemetry-sdk';
import { Environment } from './environment';
import { EventData } from './eventTypes';
const { Event, EventBatch, EventClient } = telemetry.events;

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

export const createEventClient = (
  options: EventClientOptions = {},
): OpenAIEventClient => {
  const apiKey =
    options.newRelicApiKey ??
    Environment.newRelicApiKey ??
    Environment.insertKey;
  if (!apiKey) {
    throw new Error("New Relic API Key wasn't found");
  }

  const eventClient = new EventClient({
    ...options,
    apiKey,
    host: options.host ?? Environment.host,
  });

  const send: OpenAIEventClient['send'] = (...eventDataList) => {
    const eventBatch = new EventBatch();

    eventDataList.forEach(({ eventType, attributes }) => {
      const event = new Event(eventType, attributes);
      eventBatch.addEvent(event);
    });

    eventClient.send(eventBatch, (error, { statusCode, statusMessage }) => {
      if (error) {
        console.error(error);
      } else if (statusCode !== 200) {
        console.error(`Error sending event: ${statusCode} ${statusMessage}`);
      }
    });
  };

  return {
    send,
  };
};
