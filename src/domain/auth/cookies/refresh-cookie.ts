import { FastifyReply } from 'fastify';

export type RefreshCookieOptions = {
  maxAgeSeconds: number; // align with refresh TTL
  isProd: boolean;
};

export function setRefreshCookie(
  reply: FastifyReply,
  token: string,
  opts: RefreshCookieOptions,
) {
  reply.setCookie('refreshToken', token, {
    httpOnly: true,
    secure: opts.isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: opts.maxAgeSeconds,
  });
}

export function clearRefreshCookie(
  reply: FastifyReply,
  opts: RefreshCookieOptions,
) {
  reply.clearCookie('refreshToken', {
    httpOnly: true,
    secure: opts.isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
