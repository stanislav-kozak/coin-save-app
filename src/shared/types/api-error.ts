/**
 * Backend error envelope (spec §11.2). Backend PR feature/openapi-error-responses adds ErrorResponseDto +
 * ErrorCode enum — switch to `components['schemas']['ErrorResponseDto']` once it is deployed.
 */
export type ApiError = {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
};
