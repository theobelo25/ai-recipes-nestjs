export type RecipeAIResponse = {
  title: string;
  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  ingredients: Array<{ name: string; quantity: string }>;
  steps: string[];
};
