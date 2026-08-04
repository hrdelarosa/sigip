export function hasMysqlErrorCode(error: unknown, code: string): boolean {
  let currentError = error;
  const visitedErrors = new Set<object>();

  while (typeof currentError === 'object' && currentError !== null) {
    if (visitedErrors.has(currentError)) return false;
    visitedErrors.add(currentError);

    if ('code' in currentError && currentError.code === code) return true;

    if (!('cause' in currentError)) return false;
    currentError = currentError.cause;
  }

  return false;
}
