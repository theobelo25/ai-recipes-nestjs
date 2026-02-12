import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ValidationModule } from './common/validation/validation.module';
import { UsersModule } from './domain/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { EnvModule } from './env/env.module';

@Module({
  imports: [ValidationModule, UsersModule, PrismaModule, EnvModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
