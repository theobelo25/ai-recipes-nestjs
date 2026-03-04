import { registerAs } from '@nestjs/config';
import { env } from 'src/env';

export default registerAs('ai', () => {
  const config = {
    provider: env.AI_PROVIDER,

    gemini: {
      apiKey: env.GEMINI_API_KEY,
      model: env.GEMINI_MODEL,
      baseUrl: env.GEMINI_BASE_URL,
    },
    groq: {
      apiKey: env.GROQ_API_KEY,
      model: env.GROQ_MODEL,
      baseUrl: env.GROQ_BASE_URL,
    },
    ollama: {
      baseUrl: env.OLLAMA_BASE_URL,
      model: env.OLLAMA_MODEL,
    },
  } as const;
  return config;
});
