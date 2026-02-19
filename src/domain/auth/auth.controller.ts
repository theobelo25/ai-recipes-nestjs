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
import { signupSchema, type SignupDto } from './types/signup.schema';
import { RouteSchema } from '@nestjs/platform-fastify';
import { type FastifyReply, type FastifyRequest } from 'fastify';
import { signinSchema } from './types/signin.schema';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { User } from './decorators/user.decorator';
import { type RequestUser } from './interfaces/request-user.interface';
import { Public } from './decorators/public.decorator';
import { OriginGuard } from './guards/origin/origin.guard';
import { Throttle } from '@nestjs/throttler';
import { RefreshToken } from './decorators/refresh-token.decorator';
import { RefreshRotateGuard } from './guards/refresh-rotate/refresh-rotate.guard';
import { AuthCookiesService } from './cookies/auth-cookies.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookiesService: AuthCookiesService,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...createUserDto } = signupDto;

    const user = await this.authService.signup(createUserDto);
    const accessToken = await this.authService.signAccessToken(user.id);
    const rawRefresh = await this.authService.issueInitialRefreshToken(user.id);

    this.cookiesService.setRefresh(reply, rawRefresh);

    return { accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(OriginGuard, LocalAuthGuard)
  @Public()
  @Post('signin')
  @RouteSchema({ body: signinSchema })
  @Throttle({ default: { ttl: 60_000, limit: 10 } }) // 10/min
  async login(
    @User() user: RequestUser,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const accessToken = await this.authService.signAccessToken(user.id);
    const rawRefresh = await this.authService.issueInitialRefreshToken(user.id);

    this.cookiesService.setRefresh(reply, rawRefresh);

    return { accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(OriginGuard, RefreshRotateGuard)
  @Public()
  @Post('refresh')
  @Throttle({ default: { ttl: 60_000, limit: 30 } }) // 30/min
  async refresh(@Req() req: FastifyRequest) {
    const userId = req.auth!.userId;
    const accessToken = await this.authService.signAccessToken(userId); // or your existing method
    return { accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(OriginGuard)
  @Post('signout')
  @Throttle({ default: { ttl: 60_000, limit: 30 } }) // 30/min
  async signout(
    @RefreshToken() incomingRefreshToken: string | undefined,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    if (incomingRefreshToken)
      await this.authService.revokeRefreshToken(incomingRefreshToken);

    this.cookiesService.clearRefresh(reply);

    return { ok: true };
  }
}
