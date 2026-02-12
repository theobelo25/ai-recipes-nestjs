import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ValidationModule } from './common/validation/validation.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ValidationModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
