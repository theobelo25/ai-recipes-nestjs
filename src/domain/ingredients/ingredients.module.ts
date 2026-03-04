import { Module } from '@nestjs/common';
import { ParseSlugPipe } from 'src/common/pipes/parse-slug.pipe';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { PrismaIngredientsRepository } from './infrastructure/prisma-ingredients.repository';
import { INGREDIENTS_REPOSITORY } from './infrastructure/ingredients.repository.interface';

@Module({
  controllers: [IngredientsController],
  providers: [
    IngredientsService,
    ParseSlugPipe,
    PrismaIngredientsRepository,
    {
      provide: INGREDIENTS_REPOSITORY,
      useExisting: PrismaIngredientsRepository,
    },
  ],
  exports: [IngredientsService],
})
export class IngredientsModule {}
