import { Injectable } from '@nestjs/common';
import { AddPantryItemDto, UpdatePantryItemDto } from './types/pantry.schema';
import { PantryRepository } from './infrastructure/pantry.repository';

@Injectable()
export class PantryService {
  constructor(private readonly pantryRepository: PantryRepository) {}

  async list(userId: string) {
    return this.pantryRepository.getPantryItems(userId);
  }

  async listRecent(userId: string) {
    return this.pantryRepository.getRecentPantryItems(userId);
  }

  async add(userId: string, dto: AddPantryItemDto) {
    return this.pantryRepository.addPantryItem(userId, dto);
  }

  async update(
    userId: string,
    pantryItemId: string,
    updatePantryItemDto: UpdatePantryItemDto,
  ) {
    return this.pantryRepository.updatePantryItem(
      userId,
      pantryItemId,
      updatePantryItemDto,
    );
  }

  async remove(userId: string, pantryItemId: string) {
    return this.pantryRepository.removePantryItem(userId, pantryItemId);
  }
}
