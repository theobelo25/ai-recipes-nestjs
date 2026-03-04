import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  RecipeIngredientInputDto,
  UpdateRecipeDto,
  CreateRecipeDto,
  SaveGeneratedRecipeDto,
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
import {
  UNIT_OF_WORK,
  type IUnitOfWork,
} from 'src/common/uow/unit-of-work.interface';
import { IngredientsService } from '../ingredients';

type ExtraResolved = {
  ingredientId: string;
  name: string;
  quantity?: number;
  unit?: string;
};

@Injectable()
export class RecipesService {
  constructor(
    @Inject(RECIPES_REPOSITORY)
    private readonly recipesRepository: IRecipesRepository,
    private readonly ingredientsSerivce: IngredientsService,
    private readonly recipeGenerator: RecipeGeneratorService,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  list() {
    return this.recipesRepository.findMany();
  }

  getBySlug(slug: string): Promise<RecipeView> {
    return this.recipesRepository.findBySlug(slug);
  }

  async getUsersRecipes(userId: string, db?: Db) {
    return this.recipesRepository.findManyByUserId(userId, db);
  }

  async getUsersRecentRecipes(userId: string, db?: Db) {
    return this.recipesRepository.findRecentByUserId(userId, db);
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

  async saveGeneratedRecipe(userId: string, dto: SaveGeneratedRecipeDto) {
    const seen = new Set<string>();
    for (const ri of dto.ingredients) {
      if (seen.has(ri.ingredientId)) {
        throw new BadRequestException(
          'Duplicate ingredientId in ingredients[]',
        );
      }
      seen.add(ri.ingredientId);
    }

    const extrasNormalized = (dto.extras ?? [])
      .map((e) => ({
        name: e.name.trim(),
        quantity: e.quantity,
        unit: e.unit?.trim(),
      }))
      .filter((e) => e.name.length > 0);

    return this.uow.transaction(async (db) => {
      const resolvedExtras: ExtraResolved[] = extrasNormalized.length
        ? await this.resolveExtrasToIngredients(extrasNormalized, db)
        : [];

      // 2) build final recipe ingredients list
      const baseSortOrders = dto.ingredients
        .map((x) => x.sortOrder)
        .filter((n): n is number => typeof n === 'number');

      const nextSortStart =
        baseSortOrders.length > 0
          ? Math.max(...baseSortOrders) + 1
          : dto.ingredients.length;

      const recipeIngredients = [
        ...dto.ingredients.map((x, idx) => ({
          ingredientId: x.ingredientId,
          quantity: x.quantity ?? null,
          unit: x.unit ?? null,
          sortOrder: x.sortOrder ?? idx,
        })),

        ...resolvedExtras.map((x, i) => ({
          ingredientId: x.ingredientId,
          quantity: x.quantity ?? null,
          unit: x.unit ?? null,
          sortOrder: nextSortStart + i,
        })),
      ];

      // 3) save recipe
      return this.recipesRepository.createFromGenerated(
        userId,
        {
          title: dto.title.trim(),
          description: dto.description.trim(),
          instructions: dto.instructions.map((s) => s.trim()).filter(Boolean),
          servings: dto.servings,
          prepMinutes: dto.prepMinutes,
          cookMinutes: dto.cookMinutes,
          sourceUrl: dto.sourceUrl ?? null,
          sourceName: dto.sourceName ?? null,
          ingredients: recipeIngredients,
        },
        db,
      );
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

  private async resolveExtrasToIngredients(
    extras: Array<{ name: string; quantity?: number; unit?: string }>,
    db: unknown,
  ): Promise<ExtraResolved[]> {
    const bySlug = new Map<
      string,
      { name: string; quantity?: number; unit?: string }
    >();

    for (const e of extras) {
      const name = e.name.trim();
      if (!name) continue;

      const slug = slugify(name);
      if (!slug) continue;

      if (!bySlug.has(slug)) {
        bySlug.set(slug, { name, quantity: e.quantity, unit: e.unit });
      }
    }

    const unique = [...bySlug.entries()].map(([slug, e]) => ({
      slug,
      name: e.name,
      quantity: e.quantity,
      unit: e.unit,
    }));

    const slugs = unique.map((u) => u.slug);

    const existing = await this.ingredientsSerivce.findManyBySlug(slugs, db);

    const existingMap = new Map(existing.map((i) => [i.slug, i]));

    const missing = unique.filter((u) => !existingMap.has(u.slug));
    if (missing.length) {
      await this.ingredientsSerivce.createMany(
        missing.map((m) => ({ name: m.name, slug: m.slug })),
        db,
      );
    }

    const allNow = await this.ingredientsSerivce.findManyBySlug(slugs, db);

    const allMap = new Map(allNow.map((i) => [i.slug, i]));

    return unique.map((u) => {
      const ing = allMap.get(u.slug);
      if (!ing) {
        throw new BadRequestException(
          `Failed to resolve extra ingredient: ${u.name}`,
        );
      }

      return {
        ingredientId: ing.id,
        name: u.name,
        quantity: u.quantity,
        unit: u.unit,
      };
    });
  }
}
