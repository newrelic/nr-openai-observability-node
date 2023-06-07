"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorOpenAI = void 0;
const eventsClient_1 = require("./eventsClient");
const chatCompletionEventDataFactory_1 = require("./chatCompletionEventDataFactory");
const completionEventDataFactory_1 = require("./completionEventDataFactory");
const monitorOpenAI = (openAIApi, options) => {
    const eventClient = (0, eventsClient_1.createEventClient)(options);
    const chatCompletionEventDataFactory = (0, chatCompletionEventDataFactory_1.createChatCompletionEventDataFactory)();
    const completionEventDataFactory = (0, completionEventDataFactory_1.createCompletionEventDataFactory)();
    const { applicationName } = options;
    const patchCompletion = (createCompletion) => {
        return (...args) => __awaiter(void 0, void 0, void 0, function* () {
            const { getDuration } = startTimer();
            const response = yield createCompletion(...args);
            try {
                const eventData = completionEventDataFactory.createEventData({
                    request: args[0],
                    responseData: response.data,
                    applicationName,
                    responseTime: getDuration(),
                });
                eventClient.send(eventData);
            }
            catch (error) {
                console.error(error);
            }
            return response;
        });
    };
    const patchChatCompletion = (createChatCompletion) => {
        return (...args) => __awaiter(void 0, void 0, void 0, function* () {
            const { getDuration } = startTimer();
            const response = yield createChatCompletion(...args);
            try {
                const responseTime = getDuration();
                const eventDataList = chatCompletionEventDataFactory.createEventDataList({
                    request: args[0],
                    responseData: response.data,
                    applicationName,
                    responseTime,
                    headers: response.headers,
                    openAiConfiguration: openAIApi['configuration'],
                });
                eventClient.send(...eventDataList);
            }
            catch (error) {
                console.error(error);
            }
            return response;
        });
    };
    const startTimer = () => {
        const startTime = new Date();
        return {
            getDuration: () => new Date().valueOf() - startTime.valueOf(),
        };
    };
    openAIApi.createCompletion = patchCompletion(openAIApi.createCompletion.bind(openAIApi));
    openAIApi.createChatCompletion = patchChatCompletion(openAIApi.createChatCompletion.bind(openAIApi));
};
exports.monitorOpenAI = monitorOpenAI;
//# sourceMappingURL=monitor.js.map