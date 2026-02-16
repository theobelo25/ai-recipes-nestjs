import ms from 'ms';
import refreshJwtConfig from './refresh-jwt.config';
import { CookieSerializeOptions } from '@fastify/cookie';

export function buildRefreshCookieOptions(
  isProd: boolean,
): CookieSerializeOptions {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    path: '/',
    maxAge: ms(refreshJwtConfig().expiresIn),
  };
}
