/**
 * Stable error codes for the recipes module. API clients can branch on these
 * to show user-facing messages or retry logic.
 */
export const RECIPES_ERROR_CODES = {
  /** Duplicate ingredientId in ingredients array. */
  RECIPE_DUPLICATE_INGREDIENT: 'RECIPE_DUPLICATE_INGREDIENT',
  /** Recipe not found or user is not the owner. */
  RECIPE_NOT_FOUND: 'RECIPE_NOT_FOUND',
  /** Failed to resolve an extra ingredient by name. */
  RECIPE_EXTRA_RESOLVE_FAILED: 'RECIPE_EXTRA_RESOLVE_FAILED',
  /** One or more requested ingredients were not found (e.g. for AI generation). */
  RECIPES_MISSING_INGREDIENTS: 'RECIPES_MISSING_INGREDIENTS',
} as const;

export type RecipesErrorCode =
  (typeof RECIPES_ERROR_CODES)[keyof typeof RECIPES_ERROR_CODES];

/**
 * Standard shape for recipes error responses. All recipes-related HTTP exceptions
 * use this so clients can reliably read errorCode and details.
 */
export interface RecipesErrorResponseBody {
  errorCode: RecipesErrorCode;
  message: string;
  /** Ingredient name(s) that could not be resolved (for RECIPES_MISSING_INGREDIENTS). */
  missingNames?: string[];
  /** Extra ingredient name that failed to resolve (for RECIPE_EXTRA_RESOLVE_FAILED). */
  ingredientName?: string;
  details?: unknown;
}
