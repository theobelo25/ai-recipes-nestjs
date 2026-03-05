/**
 * Public API for recipes: module, service, and shared types.
 * Other domains can import from here instead of deep paths.
 */
export { RecipesModule } from './recipes.module';
export { RecipesService } from './recipes.service';
export type {
  RecipeView,
  RecipeIngredientView,
  CreateRecipeData,
  UpdateRecipeData,
  CreateFromGeneratedData,
  CreateFromGeneratedIngredient,
} from './types/recipes.types';
export {
  type CreateRecipeDto,
  type UpdateRecipeDto,
  type ReplaceRecipeIngredientsDto,
  type RecipeIngredientInputDto,
  type SaveGeneratedRecipeDto,
  CreateRecipeSchema,
  UpdateRecipeSchema,
  ReplaceRecipeIngredientsSchema,
  SaveGeneratedRecipeSchema,
} from './types/recipes.schema';
export {
  type GenerateRecipeDto,
  GenerateRecipeSchema,
} from './types/generate-recipe.schema';
export { MissingIngredientsException } from './exceptions/missing-ingredients.exception';
