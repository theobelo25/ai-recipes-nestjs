import { FastifyReply } from 'fastify';

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
  reply.setCookie('refreshToken', token, {
    ...baseOptions(secure),
    maxAge: maxAgeSeconds,
  });
}

export function clearRefreshCookie(reply: FastifyReply, secure: boolean) {
  reply.clearCookie('refreshToken', {
    ...baseOptions(secure),
    maxAge: 0,
  });
}
