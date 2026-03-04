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
import { helmetConfig, corsConfig, cookieConfig } from './config/';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const validationModule = app.get(ValidationModule);
  validationModule.configure(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT') ?? 3000;

  await app.register(fastifyCookie, cookieConfig);
  app.enableCors(corsConfig);
  await app.register(helmet, helmetConfig);

  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
}
bootstrap().catch((err) => {
  logger.error('Bootstrap failed', err);
});
