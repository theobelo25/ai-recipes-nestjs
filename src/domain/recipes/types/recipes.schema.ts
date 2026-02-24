import { Type, Static } from '@sinclair/typebox';

export const RecipeIngredientInputSchema = Type.Object(
  {
    ingredientId: Type.String({ format: 'uuid' }),
    quantity: Type.Optional(Type.Number({ minimum: 0 })),
    unit: Type.Optional(Type.String({ minLength: 1, maxLength: 32 })),
    note: Type.Optional(Type.String({ maxLength: 120 })),
    sortOrder: Type.Optional(Type.Integer({ minimum: 0 })),
  },
  { additionalProperties: false },
);

export const ReplaceRecipeIngredientsSchema = Type.Object(
  {
    ingredients: Type.Array(RecipeIngredientInputSchema, {
      maxItems: 100,
    }),
  },
  { additionalProperties: false },
);

export const CreateRecipeSchema = Type.Object(
  {
    title: Type.String({ minLength: 2, maxLength: 120 }),
    description: Type.Optional(Type.String({ maxLength: 500 })),
    instructions: Type.String({ minLength: 10, maxLength: 20_000 }),

    servings: Type.Optional(Type.Integer({ minimum: 1, maximum: 50 })),
    prepMinutes: Type.Optional(Type.Integer({ minimum: 0, maximum: 24 * 60 })),
    cookMinutes: Type.Optional(Type.Integer({ minimum: 0, maximum: 24 * 60 })),

    sourceUrl: Type.Optional(Type.String({ format: 'uri', maxLength: 500 })),
    sourceName: Type.Optional(Type.String({ maxLength: 80 })),

    ingredients: Type.Optional(
      Type.Array(RecipeIngredientInputSchema, { maxItems: 100 }),
    ),
  },
  { additionalProperties: false },
);

export const UpdateRecipeSchema = Type.Partial(CreateRecipeSchema, {
  additionalProperties: false,
  minProperties: 1,
});

export type CreateRecipeDto = Static<typeof CreateRecipeSchema>;
export type UpdateRecipeDto = Static<typeof UpdateRecipeSchema>;
export type RecipeIngredientInputDto = Static<
  typeof RecipeIngredientInputSchema
>;
