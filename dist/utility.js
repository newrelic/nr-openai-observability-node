"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterUndefinedValues = exports.removeUndefinedValues = exports.isString = exports.isObject = exports.isNull = void 0;
const isNull = (value) => value === null;
exports.isNull = isNull;
const isObject = (value) => !(0, exports.isNull)(value) && typeof value === 'object';
exports.isObject = isObject;
const isString = (value) => value && typeof value === 'string';
exports.isString = isString;
const removeUndefinedValues = (object) => Object.entries(object).reduce((current, [key, value]) => value !== undefined && value !== null
    ? Object.assign(Object.assign({}, current), { [key]: value }) : current, {});
exports.removeUndefinedValues = removeUndefinedValues;
const filterUndefinedValues = (value) => value !== undefined;
exports.filterUndefinedValues = filterUndefinedValues;
//# sourceMappingURL=utility.js.map