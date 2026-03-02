import { Db } from 'src/common/db/db.type';
import { PantryUpsertInput, UpdatePantryItemDto } from '../types/pantry.schema';
import { PantryItemDto } from '../types/pantry.types';

export const PANTRY_REPOSITORY = Symbol('PANTRY_REPOSITORY');

export interface IPantryRepository {
  getPantryItems(userId: string, db?: Db): Promise<PantryItemDto[]>;
  getRecentPantryItems(userId: string, db?: Db): Promise<PantryItemDto[]>;
  addOrUpdateByIngredient(
    userId: string,
    ingredientId: string,
    pantryUpsertInput: PantryUpsertInput,
    db?: Db,
  ): Promise<PantryItemDto>;
  updatePantryItem(
    userId: string,
    pantryItemId: string,
    updatePantryItemDto: UpdatePantryItemDto,
    db?: Db,
  ): Promise<PantryItemDto | null>;
  removePantryItem(
    userId: string,
    pantryItemId: string,
    db?: Db,
  ): Promise<boolean>;
}
