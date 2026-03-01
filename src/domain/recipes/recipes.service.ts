import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateRecipeDto,
  RecipeIngredientInputDto,
  UpdateRecipeDto,
} from './types/recipes.schema';
import { slugify } from 'src/common/utils/slugify';
import { RecipesRepository } from './infrastructure/recipes.repository';
import { RecipeGeneratorService } from './ai/recipe-generator.service';
import { Prisma } from 'src/prisma/generated/client';
import { RecipeWithRelations } from './types/recipes.types';

@Injectable()
export class RecipesService {
  constructor(
    private readonly recipesRepo: RecipesRepository,
    private readonly recipeGenerator: RecipeGeneratorService,
  ) {}

  list() {
    return this.recipesRepo.findMany();
  }

  getBySlug(slug: string): Promise<RecipeWithRelations | null> {
    return this.recipesRepo.findBySlug(slug);
  }

  async create(
    authorId: string,
    dto: CreateRecipeDto,
  ): Promise<RecipeWithRelations> {
    const { ingredients, title, ...rest } = dto;

    const data: Prisma.RecipeCreateInput = {
      ...rest,
      title,
      slug: slugify(title),
      author: { connect: { id: authorId } },
    };

    const created = await this.recipesRepo.create(data);

    if (ingredients?.length) {
      return this.recipesRepo.replaceIngredients(created.id, ingredients);
    }

    return created;
  }

  async update(
    authorId: string,
    recipeId: string,
    dto: UpdateRecipeDto,
  ): Promise<RecipeWithRelations> {
    await this.assertOwner(authorId, recipeId);

    const { ingredients, title, ...rest } = dto;

    const data: Prisma.RecipeUpdateInput = {
      ...rest,
      ...(title ? { title, slug: slugify(title) } : {}),
    };

    const updated = await this.recipesRepo.update(recipeId, data);

    if (ingredients) {
      return this.recipesRepo.replaceIngredients(recipeId, ingredients);
    }

    return updated;
  }

  async replaceIngredients(
    authorId: string,
    recipeId: string,
    ingredients: RecipeIngredientInputDto[],
  ) {
    await this.assertOwner(authorId, recipeId);

    const updated = await this.recipesRepo.replaceIngredients(
      recipeId,
      ingredients,
    );

    return updated;
  }

  async remove(authorId: string, recipeId: string) {
    await this.assertOwner(authorId, recipeId);
    await this.recipesRepo.delete(recipeId);
    return { ok: true };
  }

  async generateRecipeFromIngredients(ingredients: string[]) {
    // The AI service returns a recipe payload already shaped to your schema.
    return this.recipeGenerator.generateRecipeFromIngredients(ingredients);
  }

  private async assertOwner(authorId: string, recipeId: string) {
    const recipe = await this.recipesRepo.findByIdMinimal(recipeId);
    if (!recipe) throw new NotFoundException('Recipe not found.');
    if (recipe.authorId && recipe.authorId !== authorId) {
      throw new ForbiddenException('Not allowed');
    }
  }
}
