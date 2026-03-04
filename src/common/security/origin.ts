import { ForbiddenException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { allowedOrigins } from 'src/config';

const allowedOriginsSet = new Set(allowedOrigins);

export function assertValidOrigin(req: FastifyRequest) {
  const origin = req.headers.origin;

  // If no Origin header, reject
  if (!origin) {
    throw new ForbiddenException('Missing Origin header');
  }

  if (!allowedOriginsSet.has(origin)) {
    throw new ForbiddenException('Invalid Origin');
  }
}
