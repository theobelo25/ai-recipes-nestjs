import { FastifyCorsOptions } from '@fastify/cors';
import { env } from 'src/env';

/** Single source of truth for allowed origins (CORS and Origin guard). */
const corsOriginsRaw = (env.CORS_ORIGINS ?? env.FRONTEND_ORIGIN ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

/** Exact origins (no wildcard). */
export const allowedOrigins = corsOriginsRaw.filter((o) => !o.includes('*'));

/** Turn a pattern like "http://*.traefik.me" into a regex; * matches one or more chars in the host. */
function patternToRegex(pattern: string): RegExp {
  return new RegExp(
    '^' +
      pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]+') +
      '$',
  );
}

/** Patterns from CORS_ORIGINS (e.g. "http://*.traefik.me"). */
const originPatterns = corsOriginsRaw
  .filter((o) => o.includes('*'))
  .map(patternToRegex);

/** Built-in: allow Dokploy/Traefik preview origins and production domains without configuring CORS_ORIGINS. */
const BUILTIN_ORIGIN_REGEXES = [
  patternToRegex('http://*.traefik.me'),
  patternToRegex('https://*.traefik.me'),
  patternToRegex('https://*.theocodes.dev'),
  patternToRegex('http://*.theocodes.dev'),
];

/** Check if an origin is allowed (exact match, CORS_ORIGINS patterns, or built-in *.traefik.me). */
export function isOriginAllowed(origin: string): boolean {
  if (allowedOrigins.includes(origin)) return true;
  if (originPatterns.some((re) => re.test(origin))) return true;
  if (BUILTIN_ORIGIN_REGEXES.some((re) => re.test(origin))) return true;
  return false;
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
  preflightContinue: false,
  strictPreflight: false,
};
