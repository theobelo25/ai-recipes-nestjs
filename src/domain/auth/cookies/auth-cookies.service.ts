import { Inject, Injectable } from '@nestjs/common';
import { ConfigService, type ConfigType } from '@nestjs/config';
import type { FastifyReply } from 'fastify';
import ms from 'ms';

import refreshTokenConfig from '../config/refresh-token.config.js';
import { setRefreshCookie, clearRefreshCookie } from './refresh-cookie.js';

@Injectable()
export class AuthCookiesService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(refreshTokenConfig.KEY)
    private readonly refreshConfig: ConfigType<typeof refreshTokenConfig>,
  ) {}

  private get isProd(): boolean {
    return this.configService.get('NODE_ENV') === 'production';
  }

  private get refreshMaxAgeSeconds(): number {
    const seconds = ms(this.refreshConfig.ttl);
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
      maxAgeSeconds: 0,
    });
  }
}
