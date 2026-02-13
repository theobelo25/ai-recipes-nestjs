import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }
}
