import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HashingService } from './hashing/hashing.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { accessJwtConfig } from './config/access-jwt.config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { Argon2Service } from './hashing/argon2.service';
import { RefreshRotateGuard } from './guards/refresh-rotate/refresh-rotate.guard';
import { UsersModule } from '../users/users.module';
import { refreshTokenConfig } from './config/refresh-token.config';
import { AuthCookiesService } from './cookies/auth-cookies.service';
import { RefreshTokenService } from './refreshToken/refresh-tokens.service';
import { AuthFlowService } from './authFlow/auth-flow.service';

@Module({
  imports: [
    ConfigModule.forFeature(accessJwtConfig),
    ConfigModule.forFeature(refreshTokenConfig),
    JwtModule.registerAsync({
      inject: [accessJwtConfig.KEY],
      useFactory: (cfg: ConfigType<typeof accessJwtConfig>) => cfg,
    }),
    PassportModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: HashingService, useClass: Argon2Service },
    LocalStrategy,
    JwtStrategy,
    RefreshRotateGuard,
    AuthFlowService,
    AuthCookiesService,
    RefreshTokenService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
