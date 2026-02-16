import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { env } from 'src/env/env';

export default registerAs('refreshJwt', () => {
  const config = {
    secret: env.REFRESH_JWT_SECRET,
    expiresIn: env.REFRESH_JWT_TTL as StringValue,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  } as const satisfies JwtSignOptions;
  return config;
});
