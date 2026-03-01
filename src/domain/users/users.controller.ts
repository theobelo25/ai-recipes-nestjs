import { Body, Controller, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../auth/decorators/user.decorator';
import { type RequestUser } from '../auth/interfaces/request-user.interface';
import { RouteSchema } from '@nestjs/platform-fastify';
import {
  type UpdateProfileDto,
  UpdateProfileSchema,
} from './types/users.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @RouteSchema({ body: UpdateProfileSchema })
  async editProfile(
    @User() { id }: RequestUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateUser(id, updateProfileDto);
  }
}
