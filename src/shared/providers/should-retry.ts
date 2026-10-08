/**
 * React Query's retry policy: one retry, except for a 401. The API client has already tried to
 * refresh the session by then; another attempt would only wait out the refresh timeout again.
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    if (error.statusCode === 401) return false;
  }
  return failureCount < 1;
}
