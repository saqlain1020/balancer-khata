export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const serialize = <T>(obj: T) => JSON.parse(JSON.stringify(obj)) as T;
