import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ValidationModule } from './common/validation/validation.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { UsersModule } from './domain/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { EnvModule } from './env';
import { AuthModule } from './domain/auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { IngredientsModule } from './domain/ingredients';
import { PantryModule } from './domain/pantry';
import { RecipesModule } from './domain/recipes';
import { AiModule } from './domain/ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import aiConfig from './domain/ai/config/ai.config';
import { appConfig } from './config';

@Module({
  imports: [
    // Config & env first (other modules may depend on them)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, aiConfig],
    }),
    EnvModule,
    // Infrastructure
    PrismaModule,
    ValidationModule,
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 120 },
    ]),
    // Domain
    AiModule,
    AuthModule,
    IngredientsModule,
    PantryModule,
    RecipesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Order: last registered runs first when exception is thrown
    { provide: APP_FILTER, useClass: ValidationExceptionFilter },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
})
export class AppModule {}
