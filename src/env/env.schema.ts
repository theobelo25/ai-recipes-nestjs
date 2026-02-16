import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.string().min(1),
  APP_PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_ORIGIN: z.string().min(1),

  DATASOURCE_USERNAME: z.string().min(1),
  DATASOURCE_PASSWORD: z.string().min(1),
  DATASOURCE_HOST: z.string().min(1),
  DATASOURCE_PORT: z.coerce.number().int().positive(),
  DATASOURCE_DATABASE: z.string().min(1),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(1),
  JWT_TTL: z.string().min(1),
  REFRESH_JWT_SECRET: z.string().min(1),
  REFRESH_JWT_TTL: z.string().min(1),
  REFRESH_PREFIX_SECRET: z.string().min(1),
  JWT_ISSUER: z.string().min(1),
  JWT_AUDIENCE: z.string().min(1),
});

// Handy typed shape if you want it elsewhere
export type Env = z.infer<typeof envSchema>;
