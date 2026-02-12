import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

import { signupSchema } from './schemas/signup.schema';
import { SignupDto } from './dtos/signup.dto';
import { ValidationService } from 'src/common/validation/validation.service';
import { RouteSchema } from '@nestjs/platform-fastify';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly validationService: ValidationService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @RouteSchema({ body: signupSchema })
  signup(@Body() signupDto: SignupDto) {
    const { confirmPassword, ...createUserDto } = signupDto;
    return this.authService.signup(createUserDto);
  }
}
