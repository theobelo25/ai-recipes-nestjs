import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
} from './types/ingredient.schema';
import { slugify } from 'src/common/utils/slugify';
import { TransactionClient } from 'src/prisma/generated/internal/prismaNamespace';
import { IngredientCategory } from 'src/prisma/generated/enums';

@Injectable()
export class IngredientsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createIngredientDto: CreateIngredientDto) {
    const slug = slugify(createIngredientDto.name);

    return await this.prismaService.ingredient.create({
      data: { ...createIngredientDto, slug },
    });
  }

  async findAll() {
    return await this.prismaService.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    return await this.prismaService.ingredient.findUniqueOrThrow({
      where: { slug },
    });
  }

  async update(id: string, data: UpdateIngredientDto) {
    return await this.prismaService.ingredient.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prismaService.ingredient.delete({
      where: { id },
    });
  }

  async upsertBySlug(
    tx: TransactionClient,
    input: { name: string; slug: string; category?: IngredientCategory },
  ) {
    const { slug, name, category } = input;

    return await tx.ingredient.upsert({
      where: { slug },
      create: { name, slug, category },
      update: {
        ...(category !== undefined ? { category } : {}),
      },
    });
  }
}
