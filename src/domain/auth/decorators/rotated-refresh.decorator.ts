import { createParamDecorator } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';
export const RotatedRefreshToken = createParamDecorator((_, ctx) => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  return req.refreshToken;
});
