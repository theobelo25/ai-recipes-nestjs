import { env } from 'src/env/env';

export const cookieConfig = {
  secret: env.JWT_SECRET, // or reuse REFRESH_COOKIE_SECRET
} as const;
