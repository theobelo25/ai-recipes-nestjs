import { Type } from '@sinclair/typebox';

export function buildAiCreateRecipeSchema(
  allowedIngredients: { id: string; name: string }[],
) {
  // ✅ Use enum so AJV strictly enforces allowed IDs
  const IngredientIdSchema =
    allowedIngredients.length > 0
      ? Type.String({ enum: allowedIngredients.map((x) => x.id) })
      : Type.String({ format: 'uuid' });

  const AiRecipeIngredientSchema = Type.Object(
    {
      ingredientId: IngredientIdSchema,
      quantity: Type.Optional(Type.Number({ minimum: 0 })),
      unit: Type.Optional(Type.String({ minLength: 1, maxLength: 32 })),
      sortOrder: Type.Optional(Type.Integer({ minimum: 0 })),
    },
    { additionalProperties: false },
  );

  const ExtraIngredientSchema = Type.Object(
    {
      name: Type.String({ minLength: 1, maxLength: 80 }),
      quantity: Type.Optional(Type.Number({ minimum: 0 })),
      unit: Type.Optional(Type.String({ minLength: 1, maxLength: 32 })),
    },
    { additionalProperties: false },
  );

  return Type.Object(
    {
      title: Type.String({ minLength: 2, maxLength: 120 }),
      description: Type.String({ minLength: 10, maxLength: 500 }),
      instructions: Type.Array(Type.String({ minLength: 15, maxLength: 500 }), {
        minItems: 4,
        maxItems: 12,
      }),
      servings: Type.Integer({ minimum: 1, maximum: 50 }),
      prepMinutes: Type.Integer({ minimum: 0, maximum: 24 * 60 }),
      cookMinutes: Type.Integer({ minimum: 0, maximum: 24 * 60 }),

      ingredients: Type.Array(AiRecipeIngredientSchema, {
        minItems: 1,
        maxItems: 100,
      }),
      extras: Type.Optional(
        Type.Array(ExtraIngredientSchema, { maxItems: 12 }),
      ),
    },
    { additionalProperties: false },
  );
}

export type AiCreateRecipeDto = {
  title: string;
  description: string;
  instructions: string[];
  servings: number;
  prepMinutes: number;
  cookMinutes: number;

  ingredients: Array<{
    ingredientId: string;
    quantity?: number;
    unit?: string;
    sortOrder?: number;
  }>;

  extras?: Array<{
    name: string;
    quantity?: number;
    unit?: string;
  }>;
};

export type RecipePreviewDto = Omit<AiCreateRecipeDto, 'ingredients'> & {
  ingredients: Array<
    AiCreateRecipeDto['ingredients'][number] & { name: string }
  >;
};
