import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import refreshJwtConfig from '../config/refresh-jwt.config.js';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service.js';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { FastifyRequest } from 'fastify';

const extractJwtFromCookie = (req: FastifyRequest): string | null => {
  let token = null;
  if (req && req.cookies) {
    // Replace 'access_token' with the actual name of your cookie
    token = req.cookies['refreshToken'];
  }
  if (token === undefined) token = null;
  return token;
};

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshJwtConfiguration: ConfigType<
      typeof refreshJwtConfig
    >,
    private readonly authService: AuthService,
  ) {
    console.log('here in constructor');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromCookie, // Use the custom cookie extractor first
        // Optional: fallback to the standard bearer token header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: refreshJwtConfiguration.secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(req: FastifyRequest, payload: JwtPayload) {
    const { refreshToken } = req.cookies;
    const userId = payload.sub;

    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}
