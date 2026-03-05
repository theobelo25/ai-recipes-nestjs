import { BadRequestException } from '@nestjs/common';
import {
  RECIPES_ERROR_CODES,
  type RecipesErrorResponseBody,
} from '../errors/recipes-error-codes';

/**
 * Thrown when one or more requested ingredients are not found in the database.
 * Maps to HTTP 400. Uses stable error code for API clients.
 */
export class MissingIngredientsException extends BadRequestException {
  constructor(missingNames: string[]) {
    const message =
      missingNames.length === 1
        ? `Ingredient not found: ${missingNames[0]}`
        : `Ingredients not found: ${missingNames.join(', ')}`;
    const body: RecipesErrorResponseBody = {
      errorCode: RECIPES_ERROR_CODES.RECIPES_MISSING_INGREDIENTS,
      message,
      missingNames,
    };
    super(body);
  }
}
