import { ForbiddenException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { env } from 'src/env/env';

const allowedOrigins = new Set(
  (env.FRONTEND_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
);

export function assertValidOrigin(req: FastifyRequest) {
  const origin = req.headers.origin;

  // If no Origin header, reject
  if (!origin) {
    throw new ForbiddenException('Missing Origin header');
  }

  if (!allowedOrigins.has(origin)) {
    throw new ForbiddenException('Invalid Origin');
  }
}
