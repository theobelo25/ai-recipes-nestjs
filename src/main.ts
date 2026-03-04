import 'dotenv/config';
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

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Wire Fastify schema validator (Ajv) from ValidationModule
  const validationModule = app.get(ValidationModule);
  validationModule.configure(app);

  // Get Config Variable
  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT')!;

  // Register cookie for jwt
  await app.register(fastifyCookie, cookieConfig);

  app.enableCors(corsConfig);
  await app.register(helmet, helmetConfig);

  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap().catch((error) => console.error(error));
