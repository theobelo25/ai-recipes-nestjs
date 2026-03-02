import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateRecipeDto,
  RecipeIngredientInputDto,
  UpdateRecipeDto,
} from './types/recipes.schema';
import { slugify } from 'src/common/utils/slugify';
import { RecipeGeneratorService } from './ai/recipe-generator.service';
import {
  CreateRecipeData,
  RecipeView,
  UpdateRecipeData,
} from './types/recipes.types';
import { Db } from 'src/common/db/db.type';
import {
  RECIPES_REPOSITORY,
  type IRecipesRepository,
} from './infrastructure/recipes.repository.interface';
import { UNIT_OF_WORK, type UnitOfWork } from 'src/common/db/unit-of-work';

@Injectable()
export class RecipesService {
  constructor(
    @Inject(RECIPES_REPOSITORY)
    private readonly recipesRepository: IRecipesRepository,
    private readonly recipeGenerator: RecipeGeneratorService,
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWork,
  ) {}

  list() {
    return this.recipesRepository.findMany();
  }

  getBySlug(slug: string): Promise<RecipeView> {
    return this.recipesRepository.findBySlug(slug);
  }

  async create(
    authorId: string,
    createRecipeDto: CreateRecipeDto,
  ): Promise<RecipeView> {
    const { ingredients, title, ...rest } = createRecipeDto;

    const data: CreateRecipeData = {
      ...rest,
      title,
      slug: slugify(title),
      authorId,
    };

    return this.uow.transaction(async (tx) => {
      const created = await this.recipesRepository.create(data, tx);

      if (ingredients?.length) {
        return this.recipesRepository.replaceIngredients(
          created.id,
          ingredients,
          tx,
        );
      }

      return created;
    });
  }

  async update(
    authorId: string,
    recipeId: string,
    updateRecipeDto: UpdateRecipeDto,
  ): Promise<RecipeView> {
    const { ingredients, title, ...rest } = updateRecipeDto;

    const data: UpdateRecipeData = {
      ...rest,
      ...(title ? { title, slug: slugify(title) } : {}),
    };

    return this.uow.transaction(async (tx) => {
      await this.assertOwner(authorId, recipeId, tx);

      const updated = await this.recipesRepository.update(recipeId, data, tx);

      if (ingredients) {
        return this.recipesRepository.replaceIngredients(
          recipeId,
          ingredients,
          tx,
        );
      }

      return updated;
    });
  }

  async replaceIngredients(
    authorId: string,
    recipeId: string,
    ingredients: RecipeIngredientInputDto[],
  ) {
    return this.uow.transaction(async (tx) => {
      await this.assertOwner(authorId, recipeId, tx);

      return this.recipesRepository.replaceIngredients(
        recipeId,
        ingredients,
        tx,
      );
    });
  }

  async remove(authorId: string, recipeId: string) {
    return this.uow.transaction(async (tx) => {
      await this.assertOwner(authorId, recipeId, tx);
      await this.recipesRepository.delete(recipeId, tx);
      return { ok: true };
    });
  }

  async generateRecipeFromIngredients(ingredients: string[]) {
    // The AI service returns a recipe payload already shaped to your schema.
    return this.recipeGenerator.generateRecipeFromIngredients(ingredients);
  }

  private async assertOwner(authorId: string, recipeId: string, db?: Db) {
    const recipe = await this.recipesRepository.findByIdMinimal(recipeId, db);
    if (recipe.authorId !== authorId) {
      throw new NotFoundException('Recipe not found');
    }
  }
}
