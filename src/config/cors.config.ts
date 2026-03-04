import { FastifyCorsOptions } from '@fastify/cors';
import { env } from 'src/env/env';

/** Single source of truth for allowed origins (CORS and Origin guard). */
export const allowedOrigins = (env.CORS_ORIGINS ?? env.FRONTEND_ORIGIN ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const corsConfig: FastifyCorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools (Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'), false);
  },

  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
