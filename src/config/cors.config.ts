import { FastifyCorsOptions } from '@fastify/cors';
import { env } from 'src/env';

/** Single source of truth for allowed origins (CORS and Origin guard). */
const corsOriginsRaw = (env.CORS_ORIGINS ?? env.FRONTEND_ORIGIN ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

/** Exact origins (no wildcard). */
export const allowedOrigins = corsOriginsRaw.filter((o) => !o.includes('*'));

/** Patterns like "http://*.traefik.me" – * matches one or more chars in the host. */
const originPatterns = corsOriginsRaw
  .filter((o) => o.includes('*'))
  .map((pattern) => {
    const regex = new RegExp(
      '^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]+') + '$',
    );
    return regex;
  });

/** Check if an origin is allowed (exact match or wildcard pattern). Use for CORS and Origin guard. */
export function isOriginAllowed(origin: string): boolean {
  if (allowedOrigins.includes(origin)) return true;
  return originPatterns.some((re) => re.test(origin));
}

export const corsConfig: FastifyCorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools (Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'), false);
  },

  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
