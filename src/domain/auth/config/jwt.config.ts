import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { StringValue } from 'ms';

export default registerAs('jwt', () => {
  const config = {
    secret: process.env.JWT_SECRET as string,
    signOptions: {
      expiresIn: process.env.JWT_TTL as StringValue,
    },
  } as const satisfies JwtModuleOptions;
  return config;
});
