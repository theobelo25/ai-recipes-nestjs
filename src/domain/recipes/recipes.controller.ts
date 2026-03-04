import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import {
  User,
  Public,
  type RequestUser,
} from '../auth';
import {
  CreateRecipeSchema,
  type CreateRecipeDto,
  ReplaceRecipeIngredientsSchema,
  UpdateRecipeSchema,
  type ReplaceRecipeIngredientsDto,
  type UpdateRecipeDto,
  type SaveGeneratedRecipeDto,
  SaveGeneratedRecipeSchema,
} from './types/recipes.schema';
import { RouteSchema } from '@nestjs/platform-fastify';
import {
  GenerateRecipeSchema,
  type GenerateRecipeDto,
} from './types/generate-recipe.schema';

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

  @Get('me')
  getUsersRecipes(@User() user: RequestUser) {
    return this.recipesService.getUsersRecipes(user.id);
  }

  @Post('generated')
  @RouteSchema({ body: SaveGeneratedRecipeSchema })
  async saveGenerated(
    @User() user: RequestUser,
    @Body() saveGeneratedRecipeDto: SaveGeneratedRecipeDto,
  ) {
    return this.recipesService.saveGeneratedRecipe(
      user.id,
      saveGeneratedRecipeDto,
    );
  }

  @Public()
  @Get()
  listAll() {
    return this.recipesService.list();
  }

  @Get('recent')
  getUsersRecentRecipes(@User() user: RequestUser) {
    return this.recipesService.getUsersRecentRecipes(user.id);
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
  remove(
    @User() user: RequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.recipesService.remove(user.id, id);
  }

  @Patch(':id')
  @RouteSchema({ body: UpdateRecipeSchema })
  update(
    @User() user: RequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(user.id, id, updateRecipeDto);
  }

  @Put(':id/ingredients')
  @RouteSchema({ body: ReplaceRecipeIngredientsSchema })
  replaceIngredients(
    @User() user: RequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() replaceRecipeIngredientsDto: ReplaceRecipeIngredientsDto,
  ) {
    return this.recipesService.replaceIngredients(
      user.id,
      id,
      replaceRecipeIngredientsDto.ingredients,
    );
  }
}
