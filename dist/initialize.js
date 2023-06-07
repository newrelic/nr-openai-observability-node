"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeOpenAI = void 0;
const eventsClient_1 = require("./eventsClient");
const monitor_1 = require("./monitor");
const initializeOpenAI = (openAIApi, eventClientOptions) => {
    const eventClient = (0, eventsClient_1.createEventClient)(eventClientOptions);
    const monitor = (0, monitor_1.creteMonitor)(openAIApi, eventClient);
    monitor.start();
};
exports.initializeOpenAI = initializeOpenAI;
//# sourceMappingURL=initialize.js.map