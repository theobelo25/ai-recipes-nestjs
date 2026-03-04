import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { PrismaRecipesRepository } from './infrastructure/prisma-recipes.repository';
import { RecipeGeneratorService } from './ai/recipe-generator.service';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';
import { RECIPES_REPOSITORY } from './infrastructure/recipes.repository.interface';
import { IngredientsModule } from '../ingredients';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, AiModule, IngredientsModule],
  controllers: [RecipesController],
  providers: [
    PrismaRecipesRepository,
    RecipesService,
    RecipeGeneratorService,
    { provide: RECIPES_REPOSITORY, useExisting: PrismaRecipesRepository },
  ],
  exports: [RecipesService],
})
export class RecipesModule {}
