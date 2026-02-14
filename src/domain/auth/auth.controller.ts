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

    // reply.setCookie('accessToken', accessToken, {
    //   secure: true,
    //   httpOnly: true,
    //   sameSite: true,
    // });

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
  @Post('login')
  @RouteSchema({ body: loginSchema })
  async login(
    @User() user: RequestUser,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    const refreshToken = req.cookies;
    console.log(refreshToken);
    const { id, accessToken } = await this.authService.login(user);

    // reply.setCookie('accessToken', accessToken, {
    //   secure: true,
    //   httpOnly: true,
    //   sameSite: true,
    // });

    // reply.setCookie('refreshToken', refreshToken, {
    //   secure: true,
    //   httpOnly: true,
    //   sameSite: 'lax',
    // });

    return { userId: id, accessToken };
  }

  @UseGuards(RefreshAuthGuard)
  @Public()
  @Post('refresh')
  refreshToken(@User() user: RequestUser, @Req() req: FastifyRequest) {
    const refreshToken = req.cookies;
    console.log(refreshToken);
    return this.authService.refreshToken(user);
  }

  @Post('signout')
  async signout(@User() user: RequestUser) {
    await this.authService.signout(user);
  }

  @Get()
  testGet() {
    return 'Working';
  }
}
