import { Db } from 'src/common/db/db.type';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
} from '../types/ingredient.schema';
import { Ingredient } from '../types/ingredient.types';

export const INGREDIENTS_REPOSITORY = Symbol('INGREDIENTS_REPOSITORY');

export type IngredientLookup = {
  id: string;
  name: string;
  slug: string;
};

export interface IIngredientsRepository {
  create(dto: CreateIngredientDto, slug: string, db?: Db): Promise<Ingredient>;
  createMany(
    items: Array<{ name: string; slug: string }>,
    db?: unknown,
  ): Promise<void>;
  findAll(db?: Db): Promise<Ingredient[]>;
  findManyBySlug(
    slugs: string[],
    db?: Db,
  ): Promise<{ id: string; name: string; slug: string }[]>;
  findOneBySlug(slug: string, db?: Db): Promise<Ingredient>;
  updateBySlug(
    slug: string,
    data: UpdateIngredientDto,
    db?: Db,
  ): Promise<Ingredient>;
  removeBySlug(slug: string, db?: Db): Promise<Ingredient>;
  ensureByName(name: string, slug: string, db?: Db): Promise<Ingredient>;
}
