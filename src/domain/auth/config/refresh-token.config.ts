import { registerAs } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { env } from 'src/env/env';

export const refreshTokenConfig = registerAs('refreshToken', () => {
  const ttl = env.REFRESH_TOKEN_TTL as StringValue; // e.g. "30d"
  const ttlMs = ms(ttl);

  if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
    throw new Error(
      `Invalid REFRESH_TOKEN_TTL: ${String(env.REFRESH_TOKEN_TTL)}`,
    );
  }

  if (!env.REFRESH_PREFIX_SECRET) {
    throw new Error('REFRESH_PREFIX_SECRET is not set');
  }

  return {
    ttl,
    ttlMs,
    ttlSeconds: Math.floor(ttlMs / 1000),
    prefixSecret: env.REFRESH_PREFIX_SECRET,
  } as const;
});

export type RefreshTokenConfig = ReturnType<typeof refreshTokenConfig>;
