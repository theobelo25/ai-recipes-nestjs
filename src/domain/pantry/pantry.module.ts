import { Module } from '@nestjs/common';
import { PantryService } from './pantry.service';
import { PantryController } from './pantry.controller';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { PantryRepository } from './infrastructure/pantry.repository';

@Module({
  imports: [IngredientsModule],
  controllers: [PantryController],
  providers: [PantryService, PantryRepository],
})
export class PantryModule {}
