import 'fastify';

interface UserPayload {
  userId: string;
  password: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: UserPayload;
    auth?: {
      userId: string;
      refreshTokenId?: string;
    };
  }
}
