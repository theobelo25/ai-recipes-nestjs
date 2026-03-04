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
    AiModule,
    ValidationModule,
    UsersModule,
    PrismaModule,
    EnvModule,
    AuthModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000, // 60s window
        limit: 120, // 120 req/min per IP
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, aiConfig],
    }),
    IngredientsModule,
    PantryModule,
    RecipesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
  ],
})
export class AppModule {}
