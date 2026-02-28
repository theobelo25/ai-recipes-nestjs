import 'fastify';
import { RequestUser } from 'src/domain/auth/interfaces/request-user.interface';

declare module 'fastify' {
  interface FastifyRequest {
    user?: RequestUser;
    refreshToken?: string;
  }
}
