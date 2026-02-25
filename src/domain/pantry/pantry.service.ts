import { Injectable, NotFoundException } from '@nestjs/common';
import { AddPantryItemDto, UpdatePantryItemDto } from './types/pantry.schema';
import { PrismaService } from 'src/prisma/prisma.service';
import { IngredientsService } from '../ingredients/ingredients.service';

import { slugify } from 'src/common/utils/slugify';

@Injectable()
export class PantryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly ingredientsSerice: IngredientsService,
  ) {}

  async list(userId: string) {
    return this.prismaService.pantryItem.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        ingredient: {
          select: { id: true, name: true, slug: true, category: true },
        },
      },
    });
  }

  async listRecent(userId: string) {
    return this.prismaService.pantryItem.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      include: {
        ingredient: {
          select: { id: true, name: true, slug: true, category: true },
        },
      },
    });
  }

  async add(userId: string, addPantryItemDto: AddPantryItemDto) {
    const { name, category, quantity, unit, notes } = addPantryItemDto;
    const slug = slugify(name);

    return this.prismaService.$transaction(async (tx) => {
      try {
        const ingredient = await this.ingredientsSerice.upsertBySlug(tx, {
          name,
          slug,
          category,
        });

        const pantryItem = await tx.pantryItem.upsert({
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
          include: { ingredient: true },
        });

        return pantryItem;
      } catch (error) {
        console.error(error);
      }
    });
  }

  async update(
    userId: string,
    pantryItemId: string,
    updatePantryItemDto: UpdatePantryItemDto,
  ) {
    const existing = await this.prismaService.pantryItem.findUnique({
      where: { id: pantryItemId },
      select: { id: true, userId: true },
    });
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Pantry item not found');
    }

    return this.prismaService.pantryItem.update({
      where: { id: pantryItemId },
      data: updatePantryItemDto,
      include: {
        ingredient: {
          select: { id: true, name: true, slug: true, category: true },
        },
      },
    });
  }

  async remove(userId: string, pantryItemId: string) {
    const existing = await this.prismaService.pantryItem.findUnique({
      where: { id: pantryItemId },
      select: { id: true, userId: true },
    });
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Pantry item not found');
    }

    await this.prismaService.pantryItem.delete({ where: { id: pantryItemId } });
    return { ok: true };
  }
}
