/**
 * Stable error codes for the pantry module. API clients can branch on these
 * to show user-facing messages or retry logic.
 */
export const PANTRY_ERROR_CODES = {
  /** Pantry item not found or user does not own it. */
  PANTRY_ITEM_NOT_FOUND: 'PANTRY_ITEM_NOT_FOUND',
} as const;

export type PantryErrorCode =
  (typeof PANTRY_ERROR_CODES)[keyof typeof PANTRY_ERROR_CODES];

/**
 * Standard shape for pantry error responses. All pantry-related HTTP exceptions
 * use this so clients can reliably read errorCode and details.
 */
export interface PantryErrorResponseBody {
  errorCode: PantryErrorCode;
  message: string;
  details?: unknown;
}
