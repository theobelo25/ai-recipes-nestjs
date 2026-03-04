import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
} from '../types/ingredient.schema';
import { Db } from 'src/common/db/db.type';
import { asPrismaDb } from 'src/prisma/prisma-db.util';
import { IIngredientsRepository } from './ingredients.repository.interface';
import { Ingredient as PrismaIngredient } from 'src/prisma/generated/client';
import { Ingredient } from '../types/ingredient.types';
import { slugify } from 'src/common/utils/slugify';

@Injectable()
export class PrismaIngredientsRepository implements IIngredientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createIngredientDto: CreateIngredientDto,
    slug: string,
    db?: Db,
  ) {
    const prisma = asPrismaDb(this.prisma, db);
    const ingredient = await prisma.ingredient.create({
      data: { ...createIngredientDto, slug },
    });

    return this.toIngredientDto(ingredient);
  }

  async createMany(
    items: Array<{ name: string; slug: string }>,
    db?: Db,
  ): Promise<void> {
    if (!items.length) return;

    const prisma = asPrismaDb(this.prisma, db);

    await prisma.ingredient.createMany({
      data: items.map((i) => ({
        name: i.name,
        slug: slugify(i.name),
      })),
      skipDuplicates: true,
    });
  }

  async findAll(db?: Db) {
    const prisma = asPrismaDb(this.prisma, db);
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });

    return ingredients.map((i) => this.toIngredientDto(i));
  }

  async findManyBySlug(
    slugs: string[],
    db?: Db,
  ): Promise<{ id: string; name: string; slug: string }[]> {
    const prisma = asPrismaDb(this.prisma, db);
    return await prisma.ingredient.findMany({
      where: { slug: { in: slugs } },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  }

  async findOneBySlug(slug: string, db?: Db) {
    const prisma = asPrismaDb(this.prisma, db);
    const existing = await prisma.ingredient.findUniqueOrThrow({
      where: { slug },
    });

    return this.toIngredientDto(existing);
  }

  async updateBySlug(slug: string, data: UpdateIngredientDto, db?: Db) {
    const prisma = asPrismaDb(this.prisma, db);
    const updated = await prisma.ingredient.update({ where: { slug }, data });
    return this.toIngredientDto(updated);
  }

  async removeBySlug(slug: string, db?: Db) {
    const prisma = asPrismaDb(this.prisma, db);
    const deleted = await prisma.ingredient.delete({
      where: { slug },
    });

    return this.toIngredientDto(deleted);
  }

  async ensureByName(name: string, slug: string, db?: Db) {
    const prisma = asPrismaDb(this.prisma, db);

    const ensured = await prisma.ingredient.upsert({
      where: { slug },
      update: {
        name,
      },
      create: {
        name,
        slug,
      },
    });

    return this.toIngredientDto(ensured);
  }

  private toIngredientDto(entity: PrismaIngredient): Ingredient {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
