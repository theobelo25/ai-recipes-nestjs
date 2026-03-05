// Load .env before any other import that uses env (e.g. config/). Remove only if main.ts
// no longer imports from config/ and all env usage happens after ConfigModule is created.
import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationModule } from './common/validation/validation.module';
import { ConfigService } from '@nestjs/config';
import fastifyCookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import {
  helmetConfig,
  corsConfig,
  cookieConfig,
  isOriginAllowed,
} from './config/';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const adapter = new FastifyAdapter();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );

  const fastify = app.getHttpAdapter().getInstance();

  fastify.addHook('onRequest', (request, reply, done) => {
    if (request.method !== 'OPTIONS') return done();
    const origin = request.headers.origin as string | undefined;
    if (!origin) {
      reply.code(204).header('Content-Length', '0').send();
      return;
    }
    if (!isOriginAllowed(origin)) {
      reply.code(204).header('Content-Length', '0').send();
      return;
    }
    reply.header('Access-Control-Allow-Origin', origin);
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    );
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    reply.header('Access-Control-Max-Age', '86400');
    reply.code(204).header('Content-Length', '0').send();
  });

  await fastify.register(cors, corsConfig);

  const validationModule = app.get(ValidationModule);
  validationModule.configure(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT') ?? 3000;
  const host = configService.get<string>('APP_HOST') ?? '0.0.0.0';

  await app.register(fastifyCookie, cookieConfig);
  await app.register(helmet, helmetConfig);

  await app.listen(port, host);
  logger.log(`Server running on http://${host}:${port}`);
}
bootstrap().catch((err) => {
  logger.error('Bootstrap failed', err);
});
