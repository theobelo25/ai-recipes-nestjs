import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  signupSchema,
  type SignupDto,
  signinSchema,
  ChangePasswordSchema,
  type ChangePasswordDto,
} from './types/auth.schema';
import { RouteSchema } from '@nestjs/platform-fastify';
import { type FastifyReply } from 'fastify';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { User } from './decorators/user.decorator';
import { type RequestUser } from './interfaces/request-user.interface';
import { Public } from './decorators/public.decorator';
import { OriginGuard } from './guards/origin/origin.guard';
import { Throttle } from '@nestjs/throttler';
import { RefreshToken } from './decorators/refresh-token.decorator';
import { RefreshRotateGuard } from './guards/refresh-rotate/refresh-rotate.guard';
import { AuthFlowService } from './authFlow/auth-flow.service';
import { AuthCookiesService } from './cookies/auth-cookies.service';
import { RotatedRefreshToken } from './decorators/rotated-refresh.decorator';
import { AuthService } from './auth.service';
import {
  AUTH_ERROR_CODES,
  type AuthErrorResponseBody,
} from './errors/auth-error-codes';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authFlowService: AuthFlowService,
    private readonly authCookiesService: AuthCookiesService,
    private readonly authService: AuthService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(OriginGuard)
  @Public()
  @Post('signup')
  @RouteSchema({ body: signupSchema })
  @Throttle({ default: { ttl: 60_000, limit: 5 } }) // 5/min
  async signup(
    @Body() signupDto: SignupDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return await this.authFlowService.signUpAndIssueTokens(signupDto, reply);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(OriginGuard, LocalAuthGuard)
  @Public()
  @Post('signin')
  @RouteSchema({ body: signinSchema })
  @Throttle({ default: { ttl: 60_000, limit: 10 } }) // 10/min
  async login(
    @User() { id }: RequestUser,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return await this.authFlowService.signInAndIssueTokens(id, reply);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(OriginGuard, RefreshRotateGuard)
  @Public()
  @Post('refresh')
  @Throttle({ default: { ttl: 60_000, limit: 30 } }) // 30/min
  async refresh(
    @User() { id }: RequestUser,
    @RotatedRefreshToken() nextRaw: string | undefined,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    if (!nextRaw) {
      const body: AuthErrorResponseBody = {
        errorCode: AUTH_ERROR_CODES.AUTH_REFRESH_ROTATED_MISSING,
        message: 'Rotated refresh token missing.',
      };
      throw new InternalServerErrorException(body);
    }

    this.authCookiesService.setRefresh(reply, nextRaw);
    return await this.authFlowService.updateAccessTokenOnRefresh(id);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(OriginGuard)
  @Public()
  @Post('signout')
  @Throttle({ default: { ttl: 60_000, limit: 30 } }) // 30/min
  async signout(
    @RefreshToken() incomingRefreshToken: string | undefined,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return this.authFlowService.signOutAndRevokeToken(
      incomingRefreshToken,
      reply,
    );
  }

  @Patch('change-password')
  @RouteSchema({ body: ChangePasswordSchema })
  async changePassword(
    @User() { id }: RequestUser,
    @Body() changePasswordDto: ChangePasswordDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const user = await this.authService.changePassword(id, changePasswordDto);
    this.authCookiesService.clearRefresh(reply);
    return user;
  }
}
