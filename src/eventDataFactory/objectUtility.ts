export const isNull = (value: any) => value === null;

export const isObject = (value: any) =>
  !isNull(value) && typeof value === 'object';

export const isString = (value?: any): value is string =>
  value && typeof value === 'string';

export const removeUndefinedValues = <T = unknown>(object: any): T =>
  Object.entries(object).reduce(
    (current, [key, value]) =>
      value !== undefined && value !== null
        ? {
            ...current,
            [key]: value,
          }
        : current,
    {} as T,
  );

export const filterUndefinedValues = <T>(value: T | undefined): value is T =>
  value !== undefined;
