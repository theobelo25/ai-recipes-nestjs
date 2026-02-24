import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
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

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  listPublic() {
    return this.recipesService.listPublic();
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.recipesService.getBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @RouteSchema({ body: CreateRecipeSchema })
  create(@User() user: RequestUser, @Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(user.id, createRecipeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @RouteSchema({ body: UpdateRecipeSchema })
  update(
    @User() user: RequestUser,
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(user.id, id, updateRecipeDto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@User() user: RequestUser, @Param('id') id: string) {
    return this.recipesService.remove(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
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
