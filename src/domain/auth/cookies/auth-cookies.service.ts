import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply } from 'fastify';

import { setRefreshCookie, clearRefreshCookie } from './refresh-cookie.js';
import { AuthService } from '../auth.service.js';

@Injectable()
export class AuthCookiesService {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  private get isProd(): boolean {
    return this.configService.get('NODE_ENV') === 'production';
  }

  private get refreshMaxAgeSeconds(): number {
    const seconds = this.authService.refreshCookieMaxAge;
    if (!Number.isFinite(seconds) || seconds <= 0) {
      throw new Error(
        `Invalid refresh cookie maxAgeSeconds: ${String(seconds)}`,
      );
    }
    return seconds;
  }

  setRefresh(reply: FastifyReply, raw: string) {
    setRefreshCookie(reply, raw, {
      isProd: this.isProd,
      maxAgeSeconds: this.refreshMaxAgeSeconds,
    });
  }

  clearRefresh(reply: FastifyReply) {
    clearRefreshCookie(reply, {
      isProd: this.isProd,
      maxAgeSeconds: this.refreshMaxAgeSeconds,
    });
  }
}
