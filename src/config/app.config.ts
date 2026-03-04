import { registerAs, type ConfigType } from '@nestjs/config';
import { env } from 'src/env';

export const appConfig = registerAs('app', () => ({
  nodeEnv: env.NODE_ENV ?? 'development',
  isProd: (env.NODE_ENV ?? 'development') === 'production',
}));

export type AppConfig = ConfigType<typeof appConfig>;
