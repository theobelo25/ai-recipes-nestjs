import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ValidationModule } from './common/validation/validation.module';
import { UsersModule } from './domain/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { EnvModule } from './env/env.module';
import { AuthModule } from './domain/auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { IngredientsModule } from './domain/ingredients/ingredients.module';
import { PantryModule } from './domain/pantry/pantry.module';
import { RecipesModule } from './domain/recipes/recipes.module';
import { AiModule } from './domain/ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import aiConfig from './domain/ai/config/ai.config';
import { appConfig } from './config/app.config';
import { accessJwtConfig } from './domain/auth/config/access-jwt.config';

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
      load: [appConfig, aiConfig, accessJwtConfig],
    }),
    IngredientsModule,
    PantryModule,
    RecipesModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
