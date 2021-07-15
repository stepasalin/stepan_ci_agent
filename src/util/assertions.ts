export function mustExist<T>(something: T | null | undefined, message = ''): T {
  // TODO: proper error message, cmon
  if (!something) {
    throw new Error(message || `Expected a value, got ${something}`);
  }
  return something;
}
