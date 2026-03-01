import { Injectable } from '@nestjs/common';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
} from './types/ingredient.schema';
import { slugify } from 'src/common/utils/slugify';
import { Prisma } from 'src/prisma/generated/client';
import { IngredientsRepository } from './infrastructure/ingredients.repository';

@Injectable()
export class IngredientsService {
  constructor(private readonly ingredientsRepository: IngredientsRepository) {}

  async create(createIngredientDto: CreateIngredientDto) {
    const slug = slugify(createIngredientDto.name);
    return this.ingredientsRepository.create(createIngredientDto, slug);
  }

  async findAll() {
    return this.ingredientsRepository.findAll();
  }

  async findOneBySlug(slug: string) {
    return this.ingredientsRepository.findOneBySlug(slug);
  }

  async updateBySlug(slug: string, updateIngredientDto: UpdateIngredientDto) {
    return this.ingredientsRepository.updateBySlug(slug, updateIngredientDto);
  }

  async removeBySlug(slug: string) {
    return this.ingredientsRepository.removeBySlug(slug);
  }

  async ensureByName(
    input: { name: string },
    opts?: { db?: Prisma.TransactionClient },
  ) {
    const name = input.name.trim();
    const slug = slugify(name);

    return this.ingredientsRepository.ensureByName(name, slug, opts);
  }
}
