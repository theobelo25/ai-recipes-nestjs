import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HashingService } from '../auth/hashing/hashing.service';
import { Argon2Service } from '../auth/hashing/argon2.service';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import refreshJwtConfig from '../auth/config/refresh-token.config';
import { AuthCookiesService } from '../auth/cookies/auth-cookies.service';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    JwtModule,
    ConfigModule.forFeature(refreshJwtConfig),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: HashingService, useClass: Argon2Service },
    AuthService,
    AuthCookiesService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
