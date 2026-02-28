import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { type RequestUser } from '../auth/interfaces/request-user.interface';
import { User } from '../auth/decorators/user.decorator';
import {
  type UpdateRecipeDto,
  type CreateRecipeDto,
  CreateRecipeSchema,
  UpdateRecipeSchema,
  ReplaceRecipeIngredientsSchema,
} from './types/recipes.schema';
import { RouteSchema } from '@nestjs/platform-fastify';
import { type GenerateRecipeDto } from './types/generate-recipe.schema';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post('generate')
  generateRecipe(@Body() generateRecipeDto: GenerateRecipeDto) {
    return this.recipesService.generateRecipeFromIngredients(
      generateRecipeDto.ingredients,
    );
  }

  @Get()
  listPublic() {
    return this.recipesService.listPublic();
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.recipesService.getBySlug(slug);
  }

  @Post()
  @RouteSchema({ body: CreateRecipeSchema })
  create(@User() user: RequestUser, @Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(user.id, createRecipeDto);
  }

  @Patch(':id')
  @RouteSchema({ body: UpdateRecipeSchema })
  update(
    @User() user: RequestUser,
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(user.id, id, updateRecipeDto);
  }

  @Delete(':id')
  remove(@User() user: RequestUser, @Param('id') id: string) {
    return this.recipesService.remove(user.id, id);
  }

  @Put(':id/ingredients')
  @RouteSchema({ body: ReplaceRecipeIngredientsSchema })
  replaceIngredients(
    @User() user: RequestUser,
    @Param('id') id: string,
    @Body() body: { ingredients: UpdateRecipeDto['ingredients'] },
  ) {
    return this.recipesService.replaceIngredients(
      user.id,
      id,
      body.ingredients,
    );
  }
}
