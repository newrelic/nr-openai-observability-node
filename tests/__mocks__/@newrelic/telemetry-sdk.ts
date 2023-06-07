import { EventData } from '../../../src/eventTypes';

export const sendEventMock = jest.fn();

export const getSentEvent = (index: number): EventData =>
  sendEventMock.mock.calls[0][0][index];

class EventClient {
  send = (eventBatch: EventBatch) => {
    const events = eventBatch.events.map(({ eventType, attributes }) => ({
      eventType,
      attributes,
    }));
    sendEventMock(events);
  };
}

class Event {
  constructor(readonly eventType: string, readonly attributes: any) {}
}

class EventBatch {
  events: Event[] = [];

  addEvent = (event: Event) => {
    this.events.push(event);
  };
}

export const telemetry = {
  events: {
    EventClient,
    Event,
    EventBatch,
  },
};
