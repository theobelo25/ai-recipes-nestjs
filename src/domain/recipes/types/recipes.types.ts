export type RecipeIngredientView = {
  id: string;
  ingredient: {
    name: string;
  };
  ingredientId: string;
  quantity: number | null;
  unit: string | null;
  sortOrder: number;
};

export type RecipeView = {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  title: string;
  slug: string;
  description: string | null;
  instructions: string;

  servings: number | null;
  prepMinutes: number | null;
  cookMinutes: number | null;

  sourceUrl: string | null;
  sourceName: string | null;

  authorId: string; // keep minimal: no author object
  ingredients: RecipeIngredientView[];
};

export type CreateRecipeData = {
  title: string;
  slug: string;
  description?: string | null;
  instructions: string;
  servings?: number | null;
  prepMinutes?: number | null;
  cookMinutes?: number | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  authorId: string;
};

export type UpdateRecipeData = Partial<Omit<CreateRecipeData, 'authorId'>>;

/** Ingredient row for createFromGenerated (repository layer). */
export type CreateFromGeneratedIngredient = {
  ingredientId: string;
  quantity: number | null;
  unit: string | null;
  sortOrder: number;
};

/** Payload for creating a recipe from AI-generated data. */
export type CreateFromGeneratedData = {
  title: string;
  description: string;
  instructions: string[];
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  sourceUrl: string | null;
  sourceName: string | null;
  ingredients: CreateFromGeneratedIngredient[];
};
