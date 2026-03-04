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
