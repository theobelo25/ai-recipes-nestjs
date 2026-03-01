import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { type RequestUser } from '../auth/interfaces/request-user.interface';
import { User } from '../auth/decorators/user.decorator';
import {
  CreateRecipeSchema,
  ReplaceRecipeIngredientsSchema,
  UpdateRecipeSchema,
  type CreateRecipeDto,
  type ReplaceRecipeIngredientsDto,
  type UpdateRecipeDto,
} from './types/recipes.schema';
import { RouteSchema } from '@nestjs/platform-fastify';
import {
  GenerateRecipeSchema,
  type GenerateRecipeDto,
} from './types/generate-recipe.schema';
import { Public } from '../auth/decorators/public.decorator';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Public()
  @Post('generate')
  @RouteSchema({ body: GenerateRecipeSchema })
  generateRecipe(@Body() generateRecipeDto: GenerateRecipeDto) {
    return this.recipesService.generateRecipeFromIngredients(
      generateRecipeDto.ingredients,
    );
  }

  @Public()
  @Get()
  list() {
    return this.recipesService.list();
  }

  @Public()
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.recipesService.getBySlug(slug);
  }

  @Post()
  @RouteSchema({ body: CreateRecipeSchema })
  create(@User() user: RequestUser, @Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(user.id, createRecipeDto);
  }

  @Delete(':id')
  remove(@User() user: RequestUser, @Param('id') id: string) {
    return this.recipesService.remove(user.id, id);
  }

  @Patch(':id')
  @RouteSchema({ body: UpdateRecipeSchema })
  update(
    @User('id') userId: string,
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(userId, id, updateRecipeDto);
  }

  @Put(':id/ingredients')
  @RouteSchema({ body: ReplaceRecipeIngredientsSchema })
  replaceIngredients(
    @User('id') userId: string,
    @Param('id') id: string,
    @Body() replaceRecipeIngredientsDto: ReplaceRecipeIngredientsDto,
  ) {
    return this.recipesService.replaceIngredients(
      userId,
      id,
      replaceRecipeIngredientsDto.ingredients,
    );
  }
}
