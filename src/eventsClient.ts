import { telemetry } from '@newrelic/telemetry-sdk';
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
  const environment = {
    newRelicApiKey: process.env.NEW_RELIC_LICENSE_KEY,
    insertKey: process.env.NEW_RELIC_INSERT_KEY,
    host: process.env.EVENT_CLIENT_HOST,
  };

  const apiKey =
    options.newRelicApiKey ??
    environment.newRelicApiKey ??
    environment.insertKey;
  if (!apiKey) {
    throw new Error("New Relic API Key wasn't found");
  }

  const eventClient = new EventClient({
    ...options,
    apiKey,
    host: options.host ?? environment.host,
  });

  const send: OpenAIEventClient['send'] = (...eventDataList) => {
    const eventBatch = new EventBatch();

    eventDataList.forEach(({ eventType, attributes }) => {
      const event = new Event(eventType, attributes);
      eventBatch.addEvent(event);
    });

    eventClient.send(eventBatch, (error, response) => {
      if (error) {
        console.error(error);
      } else if (response) {
        const { statusCode, statusMessage } = response;

        if (statusCode !== 200) {
          console.error(`Error sending event: ${statusCode} ${statusMessage}`);
        }
      }
    });
  };

  return {
    send,
  };
};
