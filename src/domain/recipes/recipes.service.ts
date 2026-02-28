import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRecipeDto, UpdateRecipeDto } from './types/recipes.schema';
import { slugify } from 'src/common/utils/slugify';
import { AiService } from '../ai/ai.service';
import { RecipeResponseSchema } from '../ai/types';
import { RecipeAIResponse } from './types/recipes.schema';

@Injectable()
export class RecipesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async generateRecipeFromIngredients(ingredients: string[]) {
    const prompt = `Create a recipe using these ingredients: ${ingredients.join(', ')}.`;
    const system = `Return ONLY valid JSON matching the provided schema. No prose.`;

    return this.aiService.generateJson<RecipeAIResponse>({
      prompt,
      schema: RecipeResponseSchema,
      system,
    });
  }

  async listPublic() {
    return this.prismaService.recipe.findMany({
      orderBy: { updatedAt: 'desc' },
      include: this.recipeInclude(),
    });
  }

  async getBySlug(slug: string) {
    const recipe = await this.prismaService.recipe.findUnique({
      where: { slug },
      include: this.recipeInclude(),
    });
    if (!recipe) throw new NotFoundException('Recipe not found.');
    return recipe;
  }

  async create(authorId: string, createRecipeDto: CreateRecipeDto) {
    const { title, ingredients, ...rest } = createRecipeDto;
    const slug = slugify(title);

    return this.prismaService.recipe.create({
      data: {
        ...rest,
        title,
        slug,
        authorId,
        ingredients: ingredients?.length
          ? {
              create: ingredients.map((ri) => ({
                ...ri,
                sortOrder: ri.sortOrder ?? 0,
              })),
            }
          : undefined,
      },
      include: this.recipeInclude(),
    });
  }

  async update(
    authorId: string,
    recipeId: string,
    updateRecipeDto: UpdateRecipeDto,
  ) {
    const existing = await this.prismaService.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true, authorId: true },
    });
    if (!existing) throw new NotFoundException('Recipe not found.');
    if (existing.authorId && existing.authorId !== authorId)
      throw new ForbiddenException('Not allowed');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { title, ingredients, ...rest } = updateRecipeDto;

    const data = {
      ...rest,
      ...(title && { title, slug: slugify(title) }),
    };

    return this.prismaService.recipe.update({
      where: { id: recipeId },
      data,
      include: this.recipeInclude(),
    });
  }

  async replaceIngredients(
    authorId: string,
    recipeId: string,
    ingredients: UpdateRecipeDto['ingredients'],
  ) {
    const existing = await this.prismaService.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true, authorId: true },
    });
    if (!existing) throw new NotFoundException('Recipe not found.');
    if (existing.authorId && existing.authorId !== authorId)
      throw new ForbiddenException('Not allowed');

    return this.prismaService.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({ where: { recipeId } });

      if (ingredients?.length) {
        await tx.recipeIngredient.createMany({
          data: ingredients.map((ri) => ({
            recipeId,
            ingredientId: ri.ingredientId,
            quantity: ri.quantity ?? null,
            unit: ri.unit ?? null,
            note: ri.note ?? null,
            sortOrder: ri.sortOrder ?? 0,
          })),
        });
      }

      return tx.recipe.findUnique({
        where: { id: recipeId },
        include: this.recipeInclude(),
      });
    });
  }

  async remove(authorId: string, recipeId: string) {
    const existing = await this.prismaService.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true, authorId: true },
    });
    if (!existing) throw new NotFoundException('Recipe not found');
    if (existing.authorId && existing.authorId !== authorId) {
      throw new ForbiddenException('Not allowed');
    }

    await this.prismaService.recipe.delete({ where: { id: recipeId } });
    return { ok: true };
  }

  private recipeInclude() {
    return {
      ingredients: {
        orderBy: { sortOrder: 'asc' as const },
        include: {
          ingredient: {
            select: { id: true, name: true, slug: true, category: true },
          },
        },
      },
      author: { select: { id: true, username: true } },
    };
  }
}
