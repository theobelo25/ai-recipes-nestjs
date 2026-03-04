import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecipeIngredientInputDto } from '../types/recipes.schema';
import { RECIPE_INCLUDE } from '../types/recipes.constants';
import {
  CreateRecipeData,
  RecipeView,
  UpdateRecipeData,
} from '../types/recipes.types';
import { IRecipesRepository } from './recipes.repository.interface';
import { Db } from 'src/common/db/db.type';
import { asPrismaDb } from 'src/prisma/prisma-db.util';
import { Prisma } from 'src/prisma/generated/client';
import { slugify } from 'src/common/utils/slugify';

type PrismaRecipeWithIngredients = Prisma.RecipeGetPayload<{
  include: typeof RECIPE_INCLUDE;
}>;

@Injectable()
export class PrismaRecipesRepository implements IRecipesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private include() {
    return RECIPE_INCLUDE;
  }

  async findMany(db?: Db): Promise<RecipeView[]> {
    const prisma = asPrismaDb(this.prisma, db);

    const rows = await prisma.recipe.findMany({
      orderBy: { updatedAt: 'desc' },
      include: this.include(),
    });

    return rows.map((r) => this.toView(r));
  }

  async findManyByUserId(userId: string, db?: Db) {
    const prisma = asPrismaDb(this.prisma, db);
    return await prisma.recipe.findMany({
      where: { authorId: userId },
      include: this.include(),
    });
  }

  async findRecentByUserId(userId: string, db?: Db) {
    const prisma = asPrismaDb(this.prisma, db);
    return await prisma.recipe.findMany({
      where: { authorId: userId },
      include: this.include(),
      take: 3,
    });
  }

  async findBySlug(slug: string, db?: Db): Promise<RecipeView> {
    const prisma = asPrismaDb(this.prisma, db);

    const row = await prisma.recipe.findUniqueOrThrow({
      where: { slug },
      include: this.include(),
    });

    return this.toView(row);
  }

  findByIdMinimal(
    id: string,
    db?: Db,
  ): Promise<{ id: string; authorId: string }> {
    const prisma = asPrismaDb(this.prisma, db);

    return prisma.recipe.findUniqueOrThrow({
      where: { id },
      select: { id: true, authorId: true },
    });
  }

  async create(data: CreateRecipeData, db?: Db): Promise<RecipeView> {
    const prisma = asPrismaDb(this.prisma, db);

    const row = await prisma.recipe.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description ?? null,
        instructions: JSON.stringify(data.instructions),
        servings: data.servings ?? null,
        prepMinutes: data.prepMinutes ?? null,
        cookMinutes: data.cookMinutes ?? null,
        sourceUrl: data.sourceUrl ?? null,
        sourceName: data.sourceName ?? null,
        author: { connect: { id: data.authorId } },
      },
      include: this.include(),
    });

    return this.toView(row);
  }

  async delete(id: string, db?: Db): Promise<void> {
    const prisma = asPrismaDb(this.prisma, db);

    await prisma.recipe.delete({ where: { id } });
  }

  async replaceIngredients(
    recipeId: string,
    ingredients: RecipeIngredientInputDto[],
    db?: Db,
  ): Promise<RecipeView> {
    const prisma = asPrismaDb(this.prisma, db);

    await prisma.recipeIngredient.deleteMany({
      where: { recipeId },
    });

    // Insert new joins
    if (ingredients.length > 0) {
      await prisma.recipeIngredient.createMany({
        data: ingredients.map((i, idx) => ({
          recipeId,
          ingredientId: i.ingredientId,
          quantity: i.quantity ?? null,
          unit: i.unit ?? null,
          sortOrder: i.sortOrder ?? idx,
        })),
      });
    }

    const row = await prisma.recipe.findUniqueOrThrow({
      where: { id: recipeId },
      include: this.include(),
    });

    return this.toView(row);
  }

  async update(
    recipeId: string,
    data: UpdateRecipeData,
    db?: Db,
  ): Promise<RecipeView> {
    const prisma = asPrismaDb(this.prisma, db);

    const row = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        instructions: JSON.stringify(data.instructions),
        servings: data.servings,
        prepMinutes: data.prepMinutes,
        cookMinutes: data.cookMinutes,
        sourceUrl: data.sourceUrl,
        sourceName: data.sourceName,
      },
      include: this.include(),
    });

    return this.toView(row);
  }

  private toView(recipe: PrismaRecipeWithIngredients): RecipeView {
    return {
      id: recipe.id,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      title: recipe.title,
      slug: recipe.slug,
      description: recipe.description,
      instructions: recipe.instructions,
      servings: recipe.servings,
      prepMinutes: recipe.prepMinutes,
      cookMinutes: recipe.cookMinutes,
      sourceUrl: recipe.sourceUrl,
      sourceName: recipe.sourceName,
      authorId: recipe.authorId,

      ingredients: recipe.ingredients.map((ri) => ({
        id: ri.id,
        ingredient: { name: ri.ingredient.name },
        ingredientId: ri.ingredientId,
        quantity: ri.quantity,
        unit: ri.unit,
        sortOrder: ri.sortOrder,
      })),
    };
  }

  async createFromGenerated(
    userId: string,
    data: {
      title: string;
      description: string;
      instructions: string[];
      servings: number;
      prepMinutes: number;
      cookMinutes: number;
      sourceUrl: string | null;
      sourceName: string | null;
      ingredients: Array<{
        ingredientId: string;
        quantity: number | null;
        unit: string | null;
        sortOrder: number;
      }>;
    },
    db?: Db,
  ): Promise<RecipeView> {
    const prisma = asPrismaDb(this.prisma, db);

    const created = await prisma.recipe.create({
      data: {
        authorId: userId,
        title: data.title,
        slug: slugify(data.title),
        description: data.description,
        instructions: JSON.stringify(data.instructions),

        servings: data.servings,
        prepMinutes: data.prepMinutes,
        cookMinutes: data.cookMinutes,
        sourceUrl: data.sourceUrl,
        sourceName: data.sourceName,

        ingredients: {
          create: data.ingredients.map((ri) => ({
            ingredientId: ri.ingredientId,
            quantity: ri.quantity,
            unit: ri.unit,
            sortOrder: ri.sortOrder,
          })),
        },
      },
      select: {
        id: true,
        authorId: true,
        title: true,
        slug: true,
        description: true,
        instructions: true,
        servings: true,
        prepMinutes: true,
        cookMinutes: true,
        sourceUrl: true,
        sourceName: true,
        createdAt: true,
        updatedAt: true,
        ingredients: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            ingredientId: true,
            quantity: true,
            unit: true,
            sortOrder: true,
            ingredient: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return {
      id: created.id,
      authorId: created.authorId,
      title: created.title,
      slug: created.slug,
      description: created.description,
      instructions: created.instructions,
      servings: created.servings,
      prepMinutes: created.prepMinutes,
      cookMinutes: created.cookMinutes,
      sourceUrl: created.sourceUrl,
      sourceName: created.sourceName,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      ingredients: created.ingredients.map((ri) => ({
        id: ri.id,
        ingredientId: ri.ingredientId,
        ingredient: {
          name: ri.ingredient.name,
        },
        slug: ri.ingredient.slug,
        quantity: ri.quantity,
        unit: ri.unit,
        sortOrder: ri.sortOrder,
      })),
    };
  }
}
