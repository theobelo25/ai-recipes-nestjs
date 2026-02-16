import { env } from 'src/env/env';

export const jwtConfig = {
  secret: env.JWT_SECRET, // A secret is recommended for signed cookies
};
