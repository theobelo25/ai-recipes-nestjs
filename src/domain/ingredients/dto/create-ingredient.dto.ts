import { Type, Static } from '@sinclair/typebox';

export const createIngredientSchema = Type.Object(
  {
    name: Type.String({ minLength: 1, maxLength: 100, transform: ['trim'] }),
  },
  {
    required: ['name'],
    additionalProperties: false,
    errorMessage: {
      properties: {
        name: 'Ingredient name must be a string',
      },
      required: {
        name: 'Ingredient name is required',
      },
      additionalProperties: 'No additional properties are allowed.',
    },
  },
);

export type CreateIngredientDto = Static<typeof createIngredientSchema>;
