import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { RefreshTokenService } from '../../refreshToken/refresh-tokens.service';
import { REFRESH_COOKIE } from '../../types/auth.constants';

@Injectable()
export class RefreshRotateGuard implements CanActivate {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();

    const raw = req.cookies?.[REFRESH_COOKIE];
    if (!raw) throw new UnauthorizedException('Missing refresh token.');

    const { userId, nextRaw } = await this.refreshTokenService.rotate(raw);

    req.user = { id: userId };
    req.refreshToken = nextRaw;

    return true;
  }
}
