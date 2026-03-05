import { ForbiddenException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { isOriginAllowed } from 'src/config';

export function assertValidOrigin(req: FastifyRequest) {
  const origin = req.headers.origin;

  // If no Origin header, reject
  if (!origin) {
    throw new ForbiddenException('Missing Origin header');
  }

  if (!isOriginAllowed(origin)) {
    throw new ForbiddenException('Invalid Origin');
  }
}
