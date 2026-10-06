import messages from '@/shared/i18n/messages/uk.json';

export type ErrorMessageKey = keyof typeof messages.errors;

const KNOWN_CODES = new Set<string>(Object.keys(messages.errors));

/** Key under `errors.*` to show for an API error; never the backend's raw message. */
export function getErrorCode(error: unknown): ErrorMessageKey {
  // Throttled responses carry a generic code (HTTP_ERROR); the status is what the user needs to know.
  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    error.statusCode === 429
  ) {
    return 'TOO_MANY_REQUESTS';
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    KNOWN_CODES.has(error.code)
  ) {
    return error.code as ErrorMessageKey;
  }
  return 'UNKNOWN_ERROR';
}
