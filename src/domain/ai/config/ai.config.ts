import { registerAs } from '@nestjs/config';
import { env } from 'src/env/env';

export default registerAs('ai', () => {
  const config = {
    provider: env.AI_PROVIDER,

    gemini: {
      apiKey: env.GEMINI_API_KEY,
      model: env.GEMINI_MODEL,
      baseUrl: env.GEMINI_BASE_URL,
    },
  } as const;
  return config;
});
