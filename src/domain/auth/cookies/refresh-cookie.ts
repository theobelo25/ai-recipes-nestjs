import { FastifyReply } from 'fastify';
import { REFRESH_COOKIE } from '../types/auth.constants';

function baseOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    path: '/',
  };
}

export function setRefreshCookie(
  reply: FastifyReply,
  token: string,
  secure: boolean,
  maxAgeSeconds: number,
) {
  reply.setCookie(REFRESH_COOKIE, token, {
    ...baseOptions(secure),
    maxAge: maxAgeSeconds,
  });
}

export function clearRefreshCookie(reply: FastifyReply, secure: boolean) {
  reply.clearCookie(REFRESH_COOKIE, {
    ...baseOptions(secure),
    maxAge: 0,
  });
}
