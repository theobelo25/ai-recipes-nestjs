/**
 * Stable error codes for the AI module. API clients can branch on these
 * to show user-facing messages or retry logic.
 */
export const AI_ERROR_CODES = {
  /** AI provider returned invalid JSON. */
  AI_JSON_INVALID: 'AI_JSON_INVALID',
  /** AI output failed JSON schema validation. */
  AI_SCHEMA_VALIDATION_FAILED: 'AI_SCHEMA_VALIDATION_FAILED',
  /** AI output violated ingredient/extras closure rules. */
  AI_INGREDIENT_CLOSURE_VIOLATION: 'AI_INGREDIENT_CLOSURE_VIOLATION',
  /** Configured AI provider name is not supported. */
  AI_PROVIDER_UNSUPPORTED: 'AI_PROVIDER_UNSUPPORTED',
  /** Required AI provider env vars are missing. */
  AI_CONFIG_MISSING: 'AI_CONFIG_MISSING',
  /** Request to the AI provider failed (network, rate limit, etc.). */
  AI_PROVIDER_UNAVAILABLE: 'AI_PROVIDER_UNAVAILABLE',
} as const;

export type AiErrorCode = (typeof AI_ERROR_CODES)[keyof typeof AI_ERROR_CODES];

/**
 * Standard shape for AI error responses. All AI-related HTTP exceptions
 * use this so clients can reliably read errorCode and details.
 */
export interface AiErrorResponseBody {
  errorCode: AiErrorCode;
  message: string;
  /** Schema/closure errors (path, keyword, message). */
  errors?: unknown[];
  /** Truncated raw output for debugging. */
  snippet?: string;
  /** Provider-specific (e.g. upstream status, API error payload). */
  details?: unknown;
  /** Missing env var names (for AI_CONFIG_MISSING). */
  missingKeys?: string[];
  /** Configured provider key (for AI_PROVIDER_UNSUPPORTED). */
  provider?: string;
}
