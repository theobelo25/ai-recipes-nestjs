// src/domain/recipes/types/generate-recipe.schema.ts
import { Type, Static } from '@sinclair/typebox';

export const GenerateRecipeSchema = Type.Object(
  {
    ingredients: Type.Array(Type.String({ minLength: 1, maxLength: 100 }), {
      minItems: 1,
      maxItems: 20,
    }),
  },
  { additionalProperties: false },
);

export type GenerateRecipeDto = Static<typeof GenerateRecipeSchema>;
