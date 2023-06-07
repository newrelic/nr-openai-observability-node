export declare const isNull: (value: any) => boolean;
export declare const isObject: (value: any) => boolean;
export declare const isString: (value?: any) => value is string;
export declare const removeUndefinedValues: <T = unknown>(object: any) => T;
export declare const filterUndefinedValues: <T>(value: T | undefined) => value is T;
