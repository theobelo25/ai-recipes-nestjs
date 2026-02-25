import { Type, Static } from '@sinclair/typebox';
import { IngredientCategory } from 'src/prisma/generated/enums';

export const createIngredientSchema = Type.Object(
  {
    name: Type.String({ maxLength: 100 }),
    description: Type.Optional(Type.String({ maxLength: 500 })),
    category: Type.Optional(Type.Enum(IngredientCategory)),
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

export const updateIngredientSchema = Type.Partial(createIngredientSchema, {
  additionalProperties: false,
  minProperties: 1,
  errorMessage: {
    minProperties: 'Must update at least one property.',
  },
});

export type CreateIngredientDto = Static<typeof createIngredientSchema>;
export type UpdateIngredientDto = Static<typeof updateIngredientSchema>;
