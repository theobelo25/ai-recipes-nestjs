import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { AuthService } from '../../auth.service.js';
import { AuthCookiesService } from '../../cookies/auth-cookies.service.js';
import { REFRESH_COOKIE } from '../../types/auth.contants.js';

@Injectable()
export class RefreshRotateGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly cookies: AuthCookiesService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const reply = ctx.switchToHttp().getResponse<FastifyReply>();

    const raw = req.cookies?.[REFRESH_COOKIE];
    if (!raw) throw new UnauthorizedException('Unauthorized.');

    const { userId, nextRaw } = await this.authService.rotateRefreshToken(raw);

    this.cookies.setRefresh(reply, nextRaw);
    req.auth = { userId };

    return true;
  }
}
