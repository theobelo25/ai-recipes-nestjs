import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';
import { StringValue } from 'ms';

export default registerAs('refreshJwt', () => {
  const config = {
    secret: process.env.REFRESH_JWT_SECRET as string,
    expiresIn: process.env.REFRESH_JWT_TTL as StringValue,
  } as const satisfies JwtSignOptions;
  return config;
});
