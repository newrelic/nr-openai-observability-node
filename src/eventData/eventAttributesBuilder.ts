import { EventAttributes } from '../eventTypes';
import { isNull, isObject } from './objectUtility';

export type AttributeKeySpecialTreatments = Record<
  string,
  { skip?: boolean; parseValue?: (value: any) => string | number }
>;

export interface EventAttributesBuilderOptions {
  specialTreatments?: AttributeKeySpecialTreatments;
  initialAttributes?: EventAttributes;
}

export class EventAttributesBuilder {
  private readonly specialTreatments: AttributeKeySpecialTreatments;

  private currentAttributes: EventAttributes = {};

  constructor(options: EventAttributesBuilderOptions = {}) {
    this.currentAttributes = options.initialAttributes ?? {};
    this.specialTreatments = options.specialTreatments ?? {};
  }

  getAttributes() {
    return this.currentAttributes;
  }

  addObjectAttributes(object = {}, keyPrefix = ''): this {
    Object.entries(object || {}).forEach(([key, value]) => {
      this.addAttributes(value, `${keyPrefix}${key}`);
    }, {});

    return this;
  }

  private addArrayAttributes(array: any[], keyPrefix: string): this {
    array.forEach((value, index) => {
      const key = `${keyPrefix}.${index}`;
      this.addAttributes(value, key);
    }, {});

    return this;
  }

  private addAttributes(value: any, key: string): this {
    const specialTreatment = this.specialTreatments[key];
    if (specialTreatment) {
      if (specialTreatment.skip) {
        return this;
      } else if (specialTreatment.parseValue) {
        this.currentAttributes[key] = specialTreatment.parseValue(value);
      }
      return this;
    }

    if (isObject(value)) {
      return this.addObjectAttributes(value, `${key}.`);
    }

    if (Array.isArray(value)) {
      return this.addArrayAttributes(value, `${key}.`);
    }

    if (!isNull(value)) {
      this.currentAttributes[key] = value;
    }

    return this;
  }
}
