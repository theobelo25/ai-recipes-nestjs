import { AI_PROVIDER_KEYS } from 'src/domain/ai/providers/provider.keys';
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.string().min(1),
  APP_PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_ORIGIN: z.string().min(1),
  CORS_ORIGINS: z.string().min(1),

  DATASOURCE_USERNAME: z.string().min(1),
  DATASOURCE_PASSWORD: z.string().min(1),
  DATASOURCE_HOST: z.string().min(1),
  DATASOURCE_PORT: z.coerce.number().int().positive(),
  DATASOURCE_DATABASE: z.string().min(1),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(1),
  JWT_TTL: z.string().min(1),
  REFRESH_TOKEN_TTL: z.string().min(1),
  REFRESH_PREFIX_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().min(1),
  JWT_AUDIENCE: z.string().min(1),

  AI_PROVIDER: z.enum(AI_PROVIDER_KEYS),
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().min(1),
  GEMINI_BASE_URL: z.url(),
});

// Handy typed shape if you want it elsewhere
export type Env = z.infer<typeof envSchema>;
