"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventClient = void 0;
const telemetry_sdk_1 = require("@newrelic/telemetry-sdk");
const environment_1 = require("./environment");
const { Event, EventBatch, EventClient } = telemetry_sdk_1.telemetry.events;
const createEventClient = (options = {}) => {
    var _a, _b, _c;
    const apiKey = (_b = (_a = options.newRelicApiKey) !== null && _a !== void 0 ? _a : environment_1.Environment.newRelicApiKey) !== null && _b !== void 0 ? _b : environment_1.Environment.insertKey;
    if (!apiKey) {
        throw new Error("New Relic API Key wasn't found");
    }
    const eventClient = new EventClient(Object.assign(Object.assign({}, options), { apiKey, host: (_c = options.host) !== null && _c !== void 0 ? _c : environment_1.Environment.host }));
    const send = (...eventDataList) => {
        const eventBatch = new EventBatch();
        eventDataList.forEach(({ eventType, attributes }) => {
            const event = new Event(eventType, attributes);
            eventBatch.addEvent(event);
        });
        eventClient.send(eventBatch, (error, { statusCode, statusMessage }) => {
            if (error) {
                console.error(error);
            }
            else if (statusCode !== 200) {
                console.error(`Error sending event: ${statusCode} ${statusMessage}`);
            }
        });
    };
    return {
        send,
    };
};
exports.createEventClient = createEventClient;
//# sourceMappingURL=eventsClient.js.map