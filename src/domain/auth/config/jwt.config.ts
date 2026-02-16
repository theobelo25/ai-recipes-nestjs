import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { env } from 'src/env/env';

export default registerAs('jwt', () => {
  const config = {
    secret: env.JWT_SECRET,
    signOptions: {
      expiresIn: env.JWT_TTL as StringValue,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    },
  } as const satisfies JwtModuleOptions;
  return config;
});
