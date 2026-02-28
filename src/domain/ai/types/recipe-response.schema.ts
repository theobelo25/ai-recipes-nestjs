import { Type, Static } from '@sinclair/typebox';

export const IngredientSchema = Type.Object(
  {
    name: Type.String(),
    quantity: Type.String(),
  },
  {
    additionalProperties: false,
  },
);

export const RecipeResponseSchema = Type.Object(
  {
    title: Type.String(),
    servings: Type.Optional(Type.Integer()),
    prepMinutes: Type.Optional(Type.Integer()),
    cookMinutes: Type.Optional(Type.Integer()),
    ingredients: Type.Array(IngredientSchema),
    steps: Type.Array(Type.String()),
  },
  {
    additionalProperties: false,
  },
);

export type RecipeResponse = Static<typeof RecipeResponseSchema>;
