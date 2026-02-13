import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { ConfigService } from '@nestjs/config';
import fastifyCookie from '@fastify/cookie';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Get Config Variable
  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT')!;
  const jwtSecret = configService.get<string>('JWT_SECRET');

  // Register cookie for jwt
  await app.register(fastifyCookie, {
    secret: jwtSecret, // A secret is recommended for signed cookies
  });

  // Apply Global Filters
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new PrismaExceptionFilter(httpAdapter),
    new ValidationExceptionFilter(),
  );

  app.use(helmet);

  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap().catch((error) => console.error(error));
