import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PantryService } from './pantry.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { type RequestUser } from '../auth/interfaces/request-user.interface';
import {
  type UpdatePantryItemDto,
  type AddPantryItemDto,
} from './types/pantry.schema';

@UseGuards(JwtAuthGuard)
@Controller('pantry')
export class PantryController {
  constructor(private readonly pantryService: PantryService) {}

  @Get()
  list(@User() user: RequestUser) {
    return this.pantryService.list(user.id);
  }

  @Post()
  add(@User() user: RequestUser, @Body() addPantryItemDto: AddPantryItemDto) {
    return this.pantryService.add(user.id, addPantryItemDto);
  }

  @Patch(':id')
  update(
    @User() user: RequestUser,
    @Param('id') id: string,
    @Body() updatePantryItemDto: UpdatePantryItemDto,
  ) {
    return this.pantryService.update(user.id, id, updatePantryItemDto);
  }

  @Delete(':id')
  remove(@User() user: RequestUser, @Param('id') id: string) {
    return this.pantryService.remove(user.id, id);
  }
}
