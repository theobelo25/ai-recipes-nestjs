import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AddPantryItemDto, UpdatePantryItemDto } from './types/pantry.schema';
import {
  type IPantryRepository,
  PANTRY_REPOSITORY,
} from './infrastructure/pantry.repository.interface';
import { IngredientsService } from '../ingredients/ingredients.service';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/common/uow/unit-of-work.interface';

@Injectable()
export class PantryService {
  constructor(
    @Inject(PANTRY_REPOSITORY)
    private readonly pantryRepository: IPantryRepository,
    private readonly ingredientsService: IngredientsService,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  async list(userId: string) {
    return this.pantryRepository.getPantryItems(userId);
  }

  async listRecent(userId: string) {
    return this.pantryRepository.getRecentPantryItems(userId);
  }

  async add(userId: string, addPantryItemDto: AddPantryItemDto) {
    return this.uow.transaction(async (tx) => {
      const ingredient = await this.ingredientsService.ensureByName(
        {
          name: addPantryItemDto.name,
        },
        tx,
      );

      const { quantity, unit, notes } = addPantryItemDto;

      return this.pantryRepository.addOrUpdateByIngredient(
        userId,
        ingredient.id,
        { quantity, unit, notes },
        tx,
      );
    });
  }

  async update(
    userId: string,
    pantryItemId: string,
    updatePantryItemDto: UpdatePantryItemDto,
  ) {
    const updated = await this.pantryRepository.updatePantryItem(
      userId,
      pantryItemId,
      updatePantryItemDto,
    );
    if (!updated) throw new NotFoundException('Pantry item not found.');

    return updated;
  }

  async remove(userId: string, pantryItemId: string) {
    const ok = await this.pantryRepository.removePantryItem(
      userId,
      pantryItemId,
    );
    if (!ok) throw new NotFoundException('Pantry item not found.');

    return { ok: true };
  }
}
