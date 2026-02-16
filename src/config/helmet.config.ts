import { FastifyHelmetOptions } from '@fastify/helmet';
import { env } from 'src/env/env';
const isProd = env.NODE_ENV === 'production';

export const helmetConfig: FastifyHelmetOptions = {
  global: true,

  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // needed if inline styles exist
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", env.FRONTEND_ORIGIN || 'http://localhost:3000'],
    },
  },

  frameguard: {
    action: 'deny',
  },

  crossOriginEmbedderPolicy: false,

  // Optional: stricter in prod
  hsts: isProd
    ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      }
    : false,
};
