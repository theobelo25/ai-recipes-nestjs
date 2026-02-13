import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';
export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    return request.user;
  },
);
