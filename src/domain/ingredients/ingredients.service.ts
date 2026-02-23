import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
} from './types/create-ingredient.schema';

@Injectable()
export class IngredientsService {
  constructor(private readonly prismaService: PrismaService) {}

  private generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  }

  async create(createIngredientDto: CreateIngredientDto) {
    const slug = this.generateSlug(createIngredientDto.name);

    return await this.prismaService.ingredient.create({
      data: { ...createIngredientDto, slug },
    });
  }

  async findAll() {
    return await this.prismaService.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    return await this.prismaService.ingredient.findUniqueOrThrow({
      where: { slug },
    });
  }

  async update(id: string, data: UpdateIngredientDto) {
    return await this.prismaService.ingredient.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prismaService.ingredient.delete({
      where: { id },
    });
  }
}
