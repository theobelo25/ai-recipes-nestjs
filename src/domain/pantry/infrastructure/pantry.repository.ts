import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { INGREDIENT_SELECT } from '../types/pantry.constants';
import { IngredientsService } from 'src/domain/ingredients/ingredients.service';
import { AddPantryItemDto, UpdatePantryItemDto } from '../types/pantry.schema';

@Injectable()
export class PantryRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ingredientsService: IngredientsService,
  ) {}

  async getPantryItems(userId: string) {
    return this.prisma.pantryItem.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        ingredient: INGREDIENT_SELECT,
      },
    });
  }

  async getRecentPantryItems(userId: string) {
    return this.prisma.pantryItem.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      include: {
        ingredient: INGREDIENT_SELECT,
      },
    });
  }

  async addPantryItem(userId: string, dto: AddPantryItemDto) {
    const { name, quantity, unit, notes } = dto;

    return this.prisma.$transaction(async (tx) => {
      const ingredient = await this.ingredientsService.ensureByName(
        { name },
        { db: tx },
      );

      return tx.pantryItem.upsert({
        where: {
          userId_ingredientId: { userId, ingredientId: ingredient.id },
        },
        create: {
          userId,
          ingredientId: ingredient.id,
          quantity,
          unit,
          notes,
        },
        update: {
          ...(quantity !== undefined ? { quantity } : {}),
          ...(unit !== undefined ? { unit } : {}),
          ...(notes !== undefined ? { notes } : {}),
        },
        include: { ingredient: INGREDIENT_SELECT },
      });
    });
  }

  async updatePantryItem(
    userId: string,
    pantryItemId: string,
    updatePantryItemDto: UpdatePantryItemDto,
  ) {
    const result = await this.prisma.pantryItem.updateManyAndReturn({
      where: {
        id: pantryItemId,
        userId,
      },
      data: updatePantryItemDto,
      include: {
        ingredient: INGREDIENT_SELECT,
      },
    });
    if (result.length === 0)
      throw new NotFoundException('Pantry item not found.');

    return result[0];
  }

  async removePantryItem(userId: string, pantryItemId: string) {
    const { count } = await this.prisma.pantryItem.deleteMany({
      where: { id: pantryItemId, userId },
    });
    if (count === 0) throw new NotFoundException('Pantry item not found');
    return { ok: true };
  }
}
