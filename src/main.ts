import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationModule } from './common/validation/validation.module';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  // Configure AJV globally using the ValidationModule
  ValidationModule.configure(app);

  await app.listen(3333);
  console.log('Server running on http://localhost:3333');
}
bootstrap().catch((error) => console.error(error));
