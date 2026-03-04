import { BadRequestException } from '@nestjs/common';

/**
 * Thrown when one or more requested ingredients are not found in the database.
 * Maps to HTTP 400.
 */
export class MissingIngredientsException extends BadRequestException {
  constructor(missingNames: string[]) {
    const message =
      missingNames.length === 1
        ? `Ingredient not found: ${missingNames[0]}`
        : `Ingredients not found: ${missingNames.join(', ')}`;
    super(message);
  }
}
