import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { assertValidOrigin } from 'src/common/security/origin';

@Injectable()
export class OriginGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req: FastifyRequest = context.switchToHttp().getRequest();
    assertValidOrigin(req);
    return true;
  }
}
