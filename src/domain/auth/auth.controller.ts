import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { signupSchema } from './schemas/signup.schema';
import { SignupDto } from './dtos/signup.dto';
import { ValidationService } from 'src/common/validation/validation.service';
import { RouteSchema } from '@nestjs/platform-fastify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserDto } from '../users/dtos/createUser.dto';
import { loginSchema } from './schemas/login.schema';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { User } from './decorators/user.decorator';
import { type RequestUser } from './interfaces/request-user.interface';
import { Public } from './decorators/public.decorator';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly validationService: ValidationService,
    private readonly authService: AuthService,
  ) {}

  // @HttpCode(HttpStatus.OK)
  @Public()
  @Post('signup')
  @RouteSchema({ body: signupSchema })
  async signup(
    @Body() signupDto: SignupDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { username, email, password } = signupDto;
    const createUserDto: CreateUserDto = { username, email, password };

    const { id, accessToken, refreshToken } =
      await this.authService.signup(createUserDto);

    reply.setCookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
    });

    return { userId: id, accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('signin')
  @RouteSchema({ body: loginSchema })
  async login(
    @User() user: RequestUser,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { id, accessToken, refreshToken } =
      await this.authService.signin(user);

    reply.setCookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
    });

    return { userId: id, accessToken };
  }

  @UseGuards(RefreshAuthGuard)
  @Public()
  @Post('refresh')
  async refreshToken(
    @User() user: RequestUser,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const incomingRefreshToken = req.cookies.refreshToken;

    const { id, accessToken, refreshToken } =
      await this.authService.refreshToken(user, incomingRefreshToken);

    reply.setCookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
    });

    return {
      id,
      accessToken,
    };
  }

  @UseGuards(RefreshAuthGuard)
  @Public()
  @Post('signout')
  async signout(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { refreshToken } = request.cookies;

    reply.clearCookie('refreshToken', {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
    });
    await this.authService.signout(refreshToken);
  }

  @Get()
  testGet() {
    return 'Working';
  }
}
