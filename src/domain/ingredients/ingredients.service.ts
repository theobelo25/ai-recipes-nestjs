import { Inject, Injectable } from '@nestjs/common';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
} from './types/ingredient.schema';
import { slugify } from 'src/common/utils/slugify';
import { Db } from 'src/common/db/db.type';
import {
  type IIngredientsRepository,
  INGREDIENTS_REPOSITORY,
} from './infrastructure/ingredients.repository.interface';

@Injectable()
export class IngredientsService {
  constructor(
    @Inject(INGREDIENTS_REPOSITORY)
    private readonly ingredientsRepository: IIngredientsRepository,
  ) {}

  async create(createIngredientDto: CreateIngredientDto, db?: Db) {
    const slug = slugify(createIngredientDto.name);
    return this.ingredientsRepository.create(createIngredientDto, slug, db);
  }

  async findAll(db?: Db) {
    return this.ingredientsRepository.findAll(db);
  }

  async findOneBySlug(slug: string, db?: Db) {
    return this.ingredientsRepository.findOneBySlug(slug, db);
  }

  async updateBySlug(
    slug: string,
    updateIngredientDto: UpdateIngredientDto,
    db?: Db,
  ) {
    return this.ingredientsRepository.updateBySlug(
      slug,
      updateIngredientDto,
      db,
    );
  }

  async removeBySlug(slug: string, db?: Db) {
    return this.ingredientsRepository.removeBySlug(slug, db);
  }

  async ensureByName(input: { name: string }, db?: Db) {
    const name = input.name.trim();
    const slug = slugify(name);

    return this.ingredientsRepository.ensureByName(name, slug, db);
  }
}
