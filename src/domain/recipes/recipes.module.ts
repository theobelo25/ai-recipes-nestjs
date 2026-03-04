import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { PrismaRecipesRepository } from './infrastructure/prisma-recipes.repository';
import { RecipeGeneratorService } from './ai/recipe-generator.service';
import { AiModule } from '../ai/ai.module';
import { RECIPES_REPOSITORY } from './infrastructure/recipes.repository.interface';
import { IngredientsModule } from '../ingredients/ingredients.module';

@Module({
  imports: [AiModule, IngredientsModule],
  controllers: [RecipesController],
  providers: [
    RecipesService,
    RecipeGeneratorService,
    PrismaRecipesRepository,
    { provide: RECIPES_REPOSITORY, useExisting: PrismaRecipesRepository },
  ],
  exports: [RecipesService],
})
export class RecipesModule {}
