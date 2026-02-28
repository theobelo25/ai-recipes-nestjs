import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import type { FastifyReply } from 'fastify';

import { refreshTokenConfig } from '../config/refresh-token.config';
import { setRefreshCookie, clearRefreshCookie } from './refresh-cookie';
import { appConfig, type AppConfig } from 'src/config/app.config';

@Injectable()
export class AuthCookiesService {
  constructor(
    @Inject(appConfig.KEY) private readonly appConfig: AppConfig,
    @Inject(refreshTokenConfig.KEY)
    private readonly refreshConfig: ConfigType<typeof refreshTokenConfig>,
  ) {}

  setRefresh(reply: FastifyReply, raw: string) {
    setRefreshCookie(
      reply,
      raw,
      this.appConfig.isProd,
      this.refreshConfig.ttlSeconds,
    );
  }

  clearRefresh(reply: FastifyReply) {
    clearRefreshCookie(reply, this.appConfig.isProd);
  }
}
