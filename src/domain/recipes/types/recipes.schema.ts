import { Type, Static } from '@sinclair/typebox';

export const RecipeIngredientInputSchema = Type.Object(
  {
    ingredientId: Type.String({ format: 'uuid' }),
    quantity: Type.Optional(Type.Number({ minimum: 0 })),
    unit: Type.Optional(Type.String({ minLength: 1, maxLength: 32 })),
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
  {
    additionalProperties: false,
    errorMessage: {
      properties: {
        title: 'title must be string',
        description: 'must be string',
        instructions: 'must be string',
        servings: 'must be number',
        prepMinutes: 'must be number',
        cookMinutes: 'must be number',
        ingredients: 'must be ingredient array',
      },
    },
  },
);

export const UpdateRecipeSchema = Type.Partial(CreateRecipeSchema, {
  additionalProperties: false,
  minProperties: 1,
});

export type ReplaceRecipeIngredientsDto = Static<
  typeof ReplaceRecipeIngredientsSchema
>;
export type CreateRecipeDto = Static<typeof CreateRecipeSchema>;
export type UpdateRecipeDto = Static<typeof UpdateRecipeSchema>;
export type RecipeIngredientInputDto = Static<
  typeof RecipeIngredientInputSchema
>;

const GeneratedRecipeIngredientSchema = Type.Object(
  {
    ingredientId: Type.String({ minLength: 1 }),
    quantity: Type.Optional(Type.Number()),
    unit: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
    sortOrder: Type.Optional(Type.Integer({ minimum: 0 })),
    name: Type.Optional(Type.String({ minLength: 1 })), // optional hint only
  },
  { additionalProperties: false },
);

const GeneratedExtraSchema = Type.Object(
  {
    name: Type.String({ minLength: 1, maxLength: 120 }),
    quantity: Type.Optional(Type.Number()),
    unit: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  },
  { additionalProperties: false },
);

export const SaveGeneratedRecipeSchema = Type.Object(
  {
    title: Type.String({ minLength: 1, maxLength: 200 }),
    description: Type.String({ minLength: 1, maxLength: 2000 }),

    instructions: Type.Array(Type.String({ minLength: 1, maxLength: 2000 }), {
      minItems: 1,
      maxItems: 200,
    }),

    servings: Type.Integer({ minimum: 1, maximum: 50 }),
    prepMinutes: Type.Integer({ minimum: 0, maximum: 24 * 60 }),
    cookMinutes: Type.Integer({ minimum: 0, maximum: 24 * 60 }),

    sourceUrl: Type.Optional(
      Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
    ),
    sourceName: Type.Optional(
      Type.Union([Type.String({ minLength: 1, maxLength: 200 }), Type.Null()]),
    ),

    ingredients: Type.Array(GeneratedRecipeIngredientSchema, { minItems: 1 }),

    extras: Type.Optional(Type.Array(GeneratedExtraSchema, { maxItems: 50 })),
  },
  { additionalProperties: false },
);

export type SaveGeneratedRecipeDto = Static<
  typeof SaveGeneratedRecipeSchema
>;
