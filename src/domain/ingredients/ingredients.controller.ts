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
    return this.ingredientsService.findBySlug(slug);
  }

  @Patch(':id')
  @RouteSchema({ body: updateIngredientSchema })
  update(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingredientsService.remove(id);
  }
}
