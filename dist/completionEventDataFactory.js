"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompletionEventDataFactory = void 0;
const eventAttributesBuilder_1 = require("./eventAttributesBuilder");
const createCompletionEventDataFactory = () => {
    const createEventData = ({ request, responseData, applicationName, responseTime: response_time, }) => {
        const attributes = new eventAttributesBuilder_1.EventAttributesBuilder({
            initialAttributes: { response_time, applicationName },
            specialTreatments: {
                messages: {
                    parseValue: (value) => JSON.stringify(value),
                },
            },
        })
            .addObjectAttributes(request)
            .addObjectAttributes(responseData)
            .getAttributes();
        return { eventType: 'LlmCompletion', attributes };
    };
    return {
        createEventData,
    };
};
exports.createCompletionEventDataFactory = createCompletionEventDataFactory;
//# sourceMappingURL=completionEventDataFactory.js.map