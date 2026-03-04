/**
 * Stable error codes for the auth module. API clients can branch on these
 * to show user-facing messages or retry logic.
 */
export const AUTH_ERROR_CODES = {
  /** Invalid email or password (local strategy). */
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  /** JWT invalid or user not found. */
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  /** Failed to sign access token. */
  AUTH_TOKEN_SIGN_FAILED: 'AUTH_TOKEN_SIGN_FAILED',
  /** User not authorized (e.g. wrong password for change-password). */
  AUTH_USER_NOT_AUTHORIZED: 'AUTH_USER_NOT_AUTHORIZED',
  /** A user with this email already exists. */
  AUTH_EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_ALREADY_EXISTS',
  /** Refresh token missing from request. */
  AUTH_REFRESH_MISSING: 'AUTH_REFRESH_MISSING',
  /** Refresh token invalid or expired. */
  AUTH_REFRESH_INVALID: 'AUTH_REFRESH_INVALID',
  /** Refresh token reuse detected (security revocation). */
  AUTH_REFRESH_REUSE_DETECTED: 'AUTH_REFRESH_REUSE_DETECTED',
  /** Rotated refresh token missing (internal server error). */
  AUTH_REFRESH_ROTATED_MISSING: 'AUTH_REFRESH_ROTATED_MISSING',
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

/**
 * Standard shape for auth error responses. All auth-related HTTP exceptions
 * use this so clients can reliably read errorCode and details.
 */
export interface AuthErrorResponseBody {
  errorCode: AuthErrorCode;
  message: string;
  details?: unknown;
}
