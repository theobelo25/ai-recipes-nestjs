import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { INGREDIENT_SELECT } from '../types/pantry.constants';
import { PantryUpsertInput, UpdatePantryItemDto } from '../types/pantry.schema';
import { IPantryRepository } from './pantry.repository.interface';
import { Db } from 'src/common/db/db.type';
import { asPrismaDb } from 'src/prisma/prisma-db.util';
import { Prisma } from 'src/prisma/generated/client';
import { PantryItemDto } from '../types/pantry.types';

type PrismaPantryItemWithIngredient = Prisma.PantryItemGetPayload<{
  include: {
    ingredient: typeof INGREDIENT_SELECT;
  };
}>;

@Injectable()
export class PrismaPantryRepository implements IPantryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPantryItems(userId: string, db?: Db) {
    const prisma = asPrismaDb(this.prisma, db);
    const pantryItems = await prisma.pantryItem.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        ingredient: INGREDIENT_SELECT,
      },
    });

    return pantryItems.map((pi) => this.toPantryItemDto(pi));
  }

  async getRecentPantryItems(userId: string, db?: Db) {
    const prisma = asPrismaDb(this.prisma, db);
    const pantryItems = await prisma.pantryItem.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      include: {
        ingredient: INGREDIENT_SELECT,
      },
    });

    return pantryItems.map((pi) => this.toPantryItemDto(pi));
  }

  async addOrUpdateByIngredient(
    userId: string,
    ingredientId: string,
    pantryUpsertInput: PantryUpsertInput,
    db?: Db,
  ) {
    const prisma = asPrismaDb(this.prisma, db);
    const { quantity, unit } = pantryUpsertInput;

    const pantryItem = await prisma.pantryItem.upsert({
      where: {
        userId_ingredientId: { userId, ingredientId },
      },
      create: {
        userId,
        ingredientId,
        quantity,
        unit,
      },
      update: {
        ...(quantity !== undefined ? { quantity } : {}),
        ...(unit !== undefined ? { unit } : {}),
      },
      include: { ingredient: INGREDIENT_SELECT },
    });

    return this.toPantryItemDto(pantryItem);
  }

  async updatePantryItem(
    userId: string,
    pantryItemId: string,
    updatePantryItemDto: UpdatePantryItemDto,
    db?: Db,
  ) {
    const prisma = asPrismaDb(this.prisma, db);
    const result = await prisma.pantryItem.updateManyAndReturn({
      where: {
        id: pantryItemId,
        userId,
      },
      data: updatePantryItemDto,
      include: {
        ingredient: INGREDIENT_SELECT,
      },
    });

    return this.toPantryItemDto(result[0]) ?? null;
  }

  async removePantryItem(userId: string, pantryItemId: string, db?: Db) {
    const prisma = asPrismaDb(this.prisma, db);
    const { count } = await prisma.pantryItem.deleteMany({
      where: { id: pantryItemId, userId },
    });

    return count > 0;
  }

  private toPantryItemDto(
    entity: PrismaPantryItemWithIngredient,
  ): PantryItemDto {
    return {
      id: entity.id,
      quantity: entity.quantity,
      unit: entity.unit,
      updatedAt: entity.updatedAt,

      ingredient: {
        id: entity.ingredient.id,
        name: entity.ingredient.name,
        slug: entity.ingredient.slug,
      },
    };
  }
}
