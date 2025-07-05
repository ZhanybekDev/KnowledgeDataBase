export function isPromise(promise: any): boolean {
  return !isNull(promise) && typeof promise.then === "function";
}

export function isFunction(fun: any): boolean {
  return !isNull(fun) && typeof fun === "function";
}

export function isString(text: any): boolean {
  return !isNull(text) && (typeof text === "string" || text instanceof String);
}

export function isNull<T>(value: T): boolean {
  return value === undefined || value === null;
}

export function isNumeric(value: string) {
  return /^\d+$/.test(value);
}
