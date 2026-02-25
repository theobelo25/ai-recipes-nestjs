import { Module } from '@nestjs/common';
import { PantryService } from './pantry.service';
import { PantryController } from './pantry.controller';
import { IngredientsService } from '../ingredients/ingredients.service';

@Module({
  controllers: [PantryController],
  providers: [PantryService, IngredientsService],
})
export class PantryModule {}
