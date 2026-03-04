import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PantryService } from './pantry.service';
import {
  JwtAuthGuard,
  User,
  type RequestUser,
} from '../auth';
import {
  type UpdatePantryItemDto,
  type AddPantryItemDto,
  AddPantryItemSchema,
  UpdatePantryItemSchema,
} from './types';
import { RouteSchema } from '@nestjs/platform-fastify';

@UseGuards(JwtAuthGuard)
@Controller('pantry')
export class PantryController {
  constructor(private readonly pantryService: PantryService) {}

  @Get()
  findAll(@User() user: RequestUser) {
    return this.pantryService.findAll(user.id);
  }

  @Get('recent')
  findRecent(@User() user: RequestUser) {
    return this.pantryService.findRecent(user.id);
  }

  @Post()
  @RouteSchema({ body: AddPantryItemSchema })
  add(@User() user: RequestUser, @Body() addPantryItemDto: AddPantryItemDto) {
    return this.pantryService.add(user.id, addPantryItemDto);
  }

  @Patch(':id')
  @RouteSchema({ body: UpdatePantryItemSchema })
  update(
    @User() user: RequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePantryItemDto: UpdatePantryItemDto,
  ) {
    return this.pantryService.update(user.id, id, updatePantryItemDto);
  }

  @Delete(':id')
  remove(
    @User() user: RequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.pantryService.remove(user.id, id);
  }
}
