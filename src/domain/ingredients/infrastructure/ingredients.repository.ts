import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
} from '../types/ingredient.schema';
import { Prisma } from 'src/prisma/generated/client';
import { Db } from 'src/prisma/types/db.type';

@Injectable()
export class IngredientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIngredientDto: CreateIngredientDto, slug: string) {
    return this.prisma.ingredient.create({
      data: { ...createIngredientDto, slug },
    });
  }

  async findAll() {
    return this.prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOneBySlug(slug: string) {
    return this.prisma.ingredient.findUniqueOrThrow({
      where: { slug },
    });
  }

  async updateBySlug(slug: string, data: UpdateIngredientDto) {
    return this.prisma.ingredient.update({ where: { slug }, data });
  }

  async removeBySlug(slug: string) {
    return this.prisma.ingredient.delete({
      where: { slug },
    });
  }

  async ensureByName(
    name: string,
    slug: string,
    opts?: { db?: Prisma.TransactionClient },
  ) {
    const db: Db = opts?.db ?? this.prisma;

    return db.ingredient.upsert({
      where: { slug },
      update: {
        name,
      },
      create: {
        name,
        slug,
      },
    });
  }
}
