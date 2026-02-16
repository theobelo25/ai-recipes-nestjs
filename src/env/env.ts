import { envSchema } from './env.schema';

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${JSON.stringify(parsed.error.format(), null, 2)}`,
  );
}

export const env = parsed.data;
