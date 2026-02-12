import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationModule } from './common/validation/validation.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Get the instance of ValidationModule via DI
  const validationModule = app
    .select(ValidationModule)
    .get(ValidationModule, { strict: true });
  validationModule.configure(app);

  // Apply Global Filters
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new PrismaExceptionFilter(httpAdapter),
    new ValidationExceptionFilter(httpAdapter),
  );

  await app.listen(3333);
  console.log('Server running on http://localhost:3333');
}
bootstrap().catch((error) => console.error(error));
