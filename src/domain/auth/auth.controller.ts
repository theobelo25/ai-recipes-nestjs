import {
  Body,
  Controller,
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
import type { FastifyRequest, FastifyReply } from 'fastify';
import { CreateUserDto } from '../users/dtos/createUser.dto';
import { loginSchema } from './schemas/login.schema';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { SigninDto } from './dtos/signin.dto';
import { User } from './decorators/user.decorator';
import { type RequestUser } from './interfaces/request-user.interface';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly validationService: ValidationService,
    private readonly authService: AuthService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('signup')
  @RouteSchema({ body: signupSchema })
  async signup(
    @Body() signupDto: SignupDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { username, email, password } = signupDto;
    const createUserDto: CreateUserDto = { username, email, password };

    const token = await this.authService.signup(createUserDto);

    reply.setCookie('token', token, {
      secure: true,
      httpOnly: true,
      sameSite: true,
    });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  @RouteSchema({ body: loginSchema })
  login(
    @User() user: RequestUser,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const token = this.authService.login(user);
    reply.setCookie('token', token, {
      secure: true,
      httpOnly: true,
      sameSite: true,
    });
  }
}
