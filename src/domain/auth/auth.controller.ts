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
import {
  signupSchema,
  type SignupDto,
  signinSchema,
} from './types/auth.schema';
import { RouteSchema } from '@nestjs/platform-fastify';
import { type FastifyReply, type FastifyRequest } from 'fastify';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { User } from './decorators/user.decorator';
import { type RequestUser } from './interfaces/request-user.interface';
import { Public } from './decorators/public.decorator';
import { OriginGuard } from './guards/origin/origin.guard';
import { Throttle } from '@nestjs/throttler';
import { RefreshToken } from './decorators/refresh-token.decorator';
import { RefreshRotateGuard } from './guards/refresh-rotate/refresh-rotate.guard';
import { AuthFlowService } from './authFlow/auth-flow.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authFlowService: AuthFlowService) {}

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...createUserDto } = signupDto;

    return await this.authFlowService.signUpAndIssueTokens(
      createUserDto,
      reply,
    );
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
  async refresh(@Req() req: FastifyRequest) {
    const userId = req.auth!.userId;
    return await this.authFlowService.updateAccessTokenOnRefresh(userId);
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
}
