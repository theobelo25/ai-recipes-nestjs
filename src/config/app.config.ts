import { registerAs } from '@nestjs/config';
import { env } from 'src/env/env';

export const appConfig = registerAs('app', () => ({
  nodeEnv: env.NODE_ENV ?? 'development',
  isProd: (env.NODE_ENV ?? 'development') === 'production',
}));

export type AppConfig = ReturnType<typeof appConfig>;
