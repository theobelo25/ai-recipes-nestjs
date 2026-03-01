import { Module } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { IngredientsRepository } from './infrastructure/ingredients.repository';

@Module({
  controllers: [IngredientsController],
  providers: [IngredientsService, IngredientsRepository],
  exports: [IngredientsService],
})
export class IngredientsModule {}
