import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../auth/decorators/user.decorator';
import { type RequestUser } from '../auth/interfaces/request-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { ChangePasswordDto } from './dtos/changePassword.dto';
import { AuthService } from '../auth/auth.service';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { CookieSerializeOptions } from '@fastify/cookie';
import { AuthCookiesService } from '../auth/cookies/auth-cookies.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly cookiesService: AuthCookiesService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    // this.isProduction = this.configService.get('NODE_ENV') === 'production';
    // this.cookieOptions = buildRefreshCookieOptions(this.isProduction);
  }
  private isProduction: boolean;
  private cookieOptions: CookieSerializeOptions;

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@User() { id }: RequestUser) {
    const user = this.usersService.getPublicUserById(id);
    return user;
  }

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
