import { Body, Controller, Patch, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../auth/decorators/user.decorator';
import { type RequestUser } from '../auth/interfaces/request-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { ChangePasswordDto } from './dtos/changePassword.dto';

import type { FastifyReply } from 'fastify';

import { AuthCookiesService } from '../auth/cookies/auth-cookies.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly cookiesService: AuthCookiesService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Patch('edit-profile')
  async editProfile(
    @User() { id }: RequestUser,
    @Body() { username }: UpdateUserDto,
  ) {
    const user = await this.usersService.updateUser({ id, username });
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @User() { id }: RequestUser,
    @Body() changePasswordDto: ChangePasswordDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const user = await this.usersService.changePassword(id, changePasswordDto);
    this.cookiesService.clearRefresh(reply);
    return user;
  }
}
