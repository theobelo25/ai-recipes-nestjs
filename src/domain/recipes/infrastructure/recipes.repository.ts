import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecipeIngredientInputDto } from '../types/recipes.schema';
import { Prisma } from 'src/prisma/generated/client';
import { RECIPE_INCLUDE } from '../types/recipes.constants';
import { RecipeWithRelations } from '../types/recipes.types';

@Injectable()
export class RecipesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private include() {
    return RECIPE_INCLUDE;
  }

  findMany(): Promise<RecipeWithRelations[]> {
    return this.prisma.recipe.findMany({
      orderBy: { updatedAt: 'desc' },
      include: this.include(),
    });
  }

  findBySlug(slug: string): Promise<RecipeWithRelations> {
    return this.prisma.recipe.findUniqueOrThrow({
      where: { slug },
      include: this.include(),
    });
  }

  findByIdMinimal(id: string) {
    return this.prisma.recipe.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });
  }

  create(data: Prisma.RecipeCreateInput): Promise<RecipeWithRelations> {
    return this.prisma.recipe.create({
      data,
      include: this.include(),
    });
  }

  delete(id: string) {
    return this.prisma.recipe.delete({ where: { id } });
  }

  replaceIngredients(
    recipeId: string,
    ingredients: RecipeIngredientInputDto[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Delete existing joins for the recipe
      await tx.recipeIngredient.deleteMany({
        where: { recipeId },
      });

      // Insert new joins
      if (ingredients.length > 0) {
        await tx.recipeIngredient.createMany({
          data: ingredients.map((i, idx) => ({
            recipeId,
            ingredientId: i.ingredientId,
            quantity: i.quantity ?? null,
            unit: i.unit ?? null,
            note: i.note ?? null,
            sortOrder: i.sortOrder ?? idx,
          })),
        });
      }

      // Return updated recipe with relations
      const updated = await tx.recipe.findUniqueOrThrow({
        where: { id: recipeId },
        include: this.include(),
      });

      return updated;
    });
  }

  update(
    recipeId: string,
    data: Prisma.RecipeUpdateInput,
  ): Promise<RecipeWithRelations> {
    return this.prisma.recipe.update({
      where: { id: recipeId },
      data,
      include: this.include(),
    });
  }
}
