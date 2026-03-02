import { RecipeIngredientInputDto } from '../types/recipes.schema';
import {
  CreateRecipeData,
  RecipeView,
  UpdateRecipeData,
} from '../types/recipes.types';
import { Db } from 'src/common/db/db.type';

export const RECIPES_REPOSITORY = Symbol('RECIPES_REPOSITORY');

export interface IRecipesRepository {
  findMany(db?: Db): Promise<RecipeView[]>;
  findBySlug(slug: string, db?: Db): Promise<RecipeView>;
  findByIdMinimal(
    id: string,
    db?: Db,
  ): Promise<{ id: string; authorId: string }>;

  create(data: CreateRecipeData, db?: Db): Promise<RecipeView>;
  update(
    recipeId: string,
    data: UpdateRecipeData,
    db?: Db,
  ): Promise<RecipeView>;
  delete(id: string, db?: Db): Promise<void>;

  replaceIngredients(
    recipeId: string,
    ingredients: RecipeIngredientInputDto[],
    db?: Db,
  ): Promise<RecipeView>;
}
