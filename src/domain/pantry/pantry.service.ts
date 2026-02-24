import { Injectable, NotFoundException } from '@nestjs/common';
import { AddPantryItemDto, UpdatePantryItemDto } from './types/pantry.schema';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PantryService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async add(userId: string, addPantryItemDto: AddPantryItemDto) {
    const { ingredientId, quantity, unit, notes } = addPantryItemDto;
    try {
      return await this.prismaService.pantryItem.upsert({
        where: {
          userId_ingredientId: { userId, ingredientId },
        },
        create: { userId, ingredientId, quantity, unit, notes },
        update: { quantity, unit, notes },
        include: {
          ingredient: {
            select: { id: true, name: true, slug: true, category: true },
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
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
