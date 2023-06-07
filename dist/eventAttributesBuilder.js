"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventAttributesBuilder = void 0;
const utility_1 = require("./utility");
class EventAttributesBuilder {
    constructor(options = {}) {
        var _a, _b;
        this.currentAttributes = {};
        this.currentAttributes = (_a = options.initialAttributes) !== null && _a !== void 0 ? _a : {};
        this.specialTreatments = (_b = options.specialTreatments) !== null && _b !== void 0 ? _b : {};
    }
    getAttributes() {
        return this.currentAttributes;
    }
    addObjectAttributes(object, keyPrefix = '') {
        Object.entries(object).forEach(([key, value]) => {
            this.addAttributes(value, `${keyPrefix}${key}`);
        }, {});
        return this;
    }
    addArrayAttributes(array, keyPrefix) {
        array.forEach((value, index) => {
            const key = `${keyPrefix}.${index}`;
            this.addAttributes(value, key);
        }, {});
        return this;
    }
    addAttributes(value, key) {
        const specialTreatment = this.specialTreatments[key];
        if (specialTreatment) {
            if (specialTreatment.skip) {
                return this;
            }
            else if (specialTreatment.parseValue) {
                this.currentAttributes[key] = specialTreatment.parseValue(value);
            }
            return this;
        }
        if ((0, utility_1.isObject)(value)) {
            return this.addObjectAttributes(value, `${key}.`);
        }
        if (Array.isArray(value)) {
            return this.addArrayAttributes(value, `${key}.`);
        }
        if (!(0, utility_1.isNull)(value)) {
            this.currentAttributes[key] = value;
        }
        return this;
    }
}
exports.EventAttributesBuilder = EventAttributesBuilder;
//# sourceMappingURL=eventAttributesBuilder.js.map