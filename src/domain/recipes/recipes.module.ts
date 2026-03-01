import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { RecipesRepository } from './infrastructure/recipes.repository';
import { RecipeGeneratorService } from './ai/recipe-generator.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [RecipesController],
  providers: [RecipesService, RecipesRepository, RecipeGeneratorService],
  exports: [RecipesService],
})
export class RecipesModule {}
