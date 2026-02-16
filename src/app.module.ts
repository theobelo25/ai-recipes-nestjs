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

@Module({
  imports: [
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
