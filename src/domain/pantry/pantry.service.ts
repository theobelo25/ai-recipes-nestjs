import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AddPantryItemDto, UpdatePantryItemDto } from './types';
import {
  type IPantryRepository,
  PANTRY_REPOSITORY,
} from './infrastructure/pantry.repository.interface';
import { IngredientsService } from '../ingredients';
import {
  PANTRY_ERROR_CODES,
  type PantryErrorResponseBody,
} from './errors/pantry-error-codes';
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

  async findAll(userId: string) {
    return this.pantryRepository.getPantryItems(userId);
  }

  async findRecent(userId: string) {
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

      const { quantity, unit } = addPantryItemDto;

      return this.pantryRepository.addOrUpdateByIngredient(
        userId,
        ingredient.id,
        { quantity, unit },
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
    if (!updated) {
      const body: PantryErrorResponseBody = {
        errorCode: PANTRY_ERROR_CODES.PANTRY_ITEM_NOT_FOUND,
        message: 'Pantry item not found.',
      };
      throw new NotFoundException(body);
    }

    return updated;
  }

  async remove(userId: string, pantryItemId: string): Promise<void> {
    const ok = await this.pantryRepository.removePantryItem(
      userId,
      pantryItemId,
    );
    if (!ok) {
      const body: PantryErrorResponseBody = {
        errorCode: PANTRY_ERROR_CODES.PANTRY_ITEM_NOT_FOUND,
        message: 'Pantry item not found.',
      };
      throw new NotFoundException(body);
    }
  }
}
