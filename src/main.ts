import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Get Config Variable
  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT')!;

  // Apply Global Filters
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new PrismaExceptionFilter(httpAdapter),
    new ValidationExceptionFilter(),
  );

  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap().catch((error) => console.error(error));
