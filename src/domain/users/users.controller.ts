import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, type RequestUser } from '../auth';
import { RouteSchema } from '@nestjs/platform-fastify';
import {
  type UpdateProfileDto,
  UpdateProfileSchema,
} from './types/users.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@User() { id }: RequestUser) {
    return this.usersService.findPublicUserById(id);
  }

  @Patch('me')
  @RouteSchema({ body: UpdateProfileSchema })
  async editProfile(
    @User() { id }: RequestUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateUser(id, updateProfileDto);
  }
}
