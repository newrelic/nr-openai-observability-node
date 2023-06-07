"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatCompletionEventDataFactory = void 0;
const uuid_1 = require("uuid");
const utility_1 = require("./utility");
const eventAttributesBuilder_1 = require("./eventAttributesBuilder");
const createChatCompletionEventDataFactory = () => {
    const createEventDataList = (options) => {
        const completionId = (0, uuid_1.v4)();
        const messageDataList = createMessageEventDataList(completionId, options);
        const summaryData = createSummaryEventData(completionId, options);
        return [...messageDataList, summaryData];
    };
    const createMessageEventDataList = (completion_id, { request, responseData, applicationName, }) => {
        return getMessages(request, responseData).map((message, sequence) => ({
            eventType: 'LlmChatCompletionMessage',
            attributes: {
                id: (0, uuid_1.v4)(),
                applicationName,
                sequence,
                completion_id,
                content: message.content,
                role: message.role,
                model: request.model,
                vendor: 'openAI',
            },
        }));
    };
    const createSummaryEventData = (id, { request, responseData, responseTime: response_time, headers, openAiConfiguration, applicationName, }) => {
        const { choices } = responseData;
        const initialAttributes = {
            id,
            response_time,
            applicationName,
            timestamp: Date.now(),
            number_of_messages: getMessages(request, responseData).length,
            vendor: 'openAI',
            finish_reason: choices
                ? choices[choices.length - 1].finish_reason
                : undefined,
            ratelimit_limit_requests: headers['x-ratelimit-limit-requests'],
            ratelimit_limit_tokens: headers['x-ratelimit-limit-tokens'],
            ratelimit_reset_tokens: headers['x-ratelimit-reset-tokens'],
            ratelimit_reset_requests: headers['x-ratelimit-reset-requests'],
            ratelimit_remaining_tokens: headers['x-ratelimit-remaining-tokens'],
            ratelimit_remaining_requests: headers['x-ratelimit-remaining-requests'],
            organization: headers['openai-organization'],
            api_version: headers['openai-version'],
            api_key_last_four_digits: (0, utility_1.isString)(openAiConfiguration === null || openAiConfiguration === void 0 ? void 0 : openAiConfiguration.apiKey)
                ? `sk-${openAiConfiguration === null || openAiConfiguration === void 0 ? void 0 : openAiConfiguration.apiKey.slice(-4)}`
                : undefined,
        };
        const attributes = new eventAttributesBuilder_1.EventAttributesBuilder({
            initialAttributes: (0, utility_1.removeUndefinedValues)(initialAttributes),
            specialTreatments: {
                choices: {
                    skip: true,
                },
                id: {
                    skip: true,
                },
                messages: {
                    skip: true,
                },
            },
        })
            .addObjectAttributes(responseData)
            .addObjectAttributes(request)
            .getAttributes();
        return {
            eventType: 'LlmChatCompletionSummary',
            attributes,
        };
    };
    const getMessages = (request, response) => {
        return [
            ...request.messages,
            ...response.choices.map(({ message }) => message),
        ].filter(utility_1.filterUndefinedValues);
    };
    return {
        createEventDataList,
    };
};
exports.createChatCompletionEventDataFactory = createChatCompletionEventDataFactory;
//# sourceMappingURL=chatCompletionEventDataFactory.js.map