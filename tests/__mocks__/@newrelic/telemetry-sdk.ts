export const sendEventMock = jest.fn();

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
