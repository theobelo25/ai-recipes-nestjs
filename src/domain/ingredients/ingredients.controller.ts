import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RouteSchema } from '@nestjs/platform-fastify';
import { IngredientsService } from './ingredients.service';
import {
  type UpdateIngredientDto,
  type CreateIngredientDto,
  createIngredientSchema,
  updateIngredientSchema,
} from './types/ingredient.schema';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @RouteSchema({ body: createIngredientSchema })
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.ingredientsService.findOneBySlug(slug);
  }

  @Patch(':slug')
  @RouteSchema({ body: updateIngredientSchema })
  update(
    @Param('slug') slug: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.updateBySlug(slug, updateIngredientDto);
  }

  @Delete(':slug')
  remove(@Param('slug') slug: string) {
    return this.ingredientsService.removeBySlug(slug);
  }
}
