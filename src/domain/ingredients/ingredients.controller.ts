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
import { ParseSlugPipe } from 'src/common/pipes/parse-slug.pipe';
import { IngredientsService } from './ingredients.service';
import {
  type CreateIngredientDto,
  type UpdateIngredientDto,
  createIngredientSchema,
  updateIngredientSchema,
} from './dto';

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
  findOne(@Param('slug', ParseSlugPipe) slug: string) {
    return this.ingredientsService.findOneBySlug(slug);
  }

  @Patch(':slug')
  @RouteSchema({ body: updateIngredientSchema })
  update(
    @Param('slug', ParseSlugPipe) slug: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.updateBySlug(slug, updateIngredientDto);
  }

  @Delete(':slug')
  remove(@Param('slug', ParseSlugPipe) slug: string) {
    return this.ingredientsService.removeBySlug(slug);
  }
}
