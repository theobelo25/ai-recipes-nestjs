import { Type, Static } from '@sinclair/typebox';
import { createIngredientSchema } from './create-ingredient.dto';

export const updateIngredientSchema = Type.Partial(createIngredientSchema, {
  additionalProperties: false,
  minProperties: 1,
  errorMessage: {
    minProperties: 'Must update at least one property.',
  },
});

export type UpdateIngredientDto = Static<typeof updateIngredientSchema>;
