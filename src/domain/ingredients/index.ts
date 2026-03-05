/**
 * Public API for ingredients: module, service, and shared types.
 * Other domains can import from here instead of deep paths.
 */
export { IngredientsModule } from './ingredients.module';
export { IngredientsService } from './ingredients.service';
export type { Ingredient } from './types/ingredient.types';
export {
  type CreateIngredientDto,
  type UpdateIngredientDto,
  createIngredientSchema,
  updateIngredientSchema,
} from './dto';
