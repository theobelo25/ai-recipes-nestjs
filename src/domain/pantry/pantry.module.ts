import { Module } from '@nestjs/common';
import { PantryService } from './pantry.service';
import { PantryController } from './pantry.controller';
import { AuthModule } from '../auth/auth.module';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { PrismaPantryRepository } from './infrastructure/prisma-pantry.repository';
import { PANTRY_REPOSITORY } from './infrastructure/pantry.repository.interface';

@Module({
  imports: [AuthModule, IngredientsModule],
  controllers: [PantryController],
  providers: [
    PantryService,
    PrismaPantryRepository,
    { provide: PANTRY_REPOSITORY, useExisting: PrismaPantryRepository },
  ],
})
export class PantryModule {}
