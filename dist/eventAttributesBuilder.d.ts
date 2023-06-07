import { EventAttributes } from './eventTypes';
export type AttributeKeySpecialTreatments = Record<string, {
    skip?: boolean;
    parseValue?: (value: any) => string | number;
}>;
export interface EventAttributesBuilderOptions {
    specialTreatments?: AttributeKeySpecialTreatments;
    initialAttributes?: EventAttributes;
}
export declare class EventAttributesBuilder {
    private readonly specialTreatments;
    private currentAttributes;
    constructor(options?: EventAttributesBuilderOptions);
    getAttributes(): EventAttributes;
    addObjectAttributes(object: object, keyPrefix?: string): this;
    private addArrayAttributes;
    private addAttributes;
}
