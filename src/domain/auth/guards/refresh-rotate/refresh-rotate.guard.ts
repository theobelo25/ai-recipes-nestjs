import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { RefreshTokenService } from '../../refreshToken/refresh-tokens.service';
import { REFRESH_COOKIE } from '../../types/auth.constants';
import {
  AUTH_ERROR_CODES,
  type AuthErrorResponseBody,
} from '../../errors/auth-error-codes';

@Injectable()
export class RefreshRotateGuard implements CanActivate {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();

    const raw = req.cookies?.[REFRESH_COOKIE];
    if (!raw) {
      const body: AuthErrorResponseBody = {
        errorCode: AUTH_ERROR_CODES.AUTH_REFRESH_MISSING,
        message: 'Missing refresh token.',
      };
      throw new UnauthorizedException(body);
    }

    const { userId, nextRaw } = await this.refreshTokenService.rotate(raw);

    req.user = { id: userId };
    req.refreshToken = nextRaw;

    return true;
  }
}
