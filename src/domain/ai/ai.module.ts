import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AI_PROVIDER } from './providers/provider.keys';
import { GeminiProvider } from './providers/gemini/gemini.provider';
import aiConfig from './config/ai.config';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AiJsonValidator } from './validation/ai-json-validator';
import { GeminiClient } from './providers/gemini/gemini.client';
import { ValidationModule } from 'src/common/validation/validation.module';
import { ProviderFactory } from './providers/provider.factory';
import { OllamaProvider } from './providers/ollama/ollama.provider';
import { OllamaClient } from './providers/ollama/ollama.client';
import { GroqClient } from './providers/groq/groq.client';
import { GroqProvider } from './providers/groq/groq.provider';

@Module({
  imports: [
    ConfigModule.forFeature(aiConfig),
    HttpModule.register({
      timeout: 10_000,
      maxRedirects: 0,
    }),
    ValidationModule,
  ],
  providers: [
    AiService,
    ProviderFactory,
    OllamaClient,
    GeminiClient,
    GroqClient,
    OllamaProvider,
    GeminiProvider,
    GroqProvider,
    AiJsonValidator,
    {
      provide: AI_PROVIDER,
      useFactory: (
        config: ConfigType<typeof aiConfig>,
        factory: ProviderFactory,
        gemini: GeminiProvider,
        groq: GroqProvider,
        ollama: OllamaProvider,
      ) => {
        return factory.create(config.provider, { gemini, groq, ollama });
      },
      inject: [
        aiConfig.KEY,
        ProviderFactory,
        GeminiProvider,
        GroqProvider,
        OllamaProvider,
      ],
    },
  ],
  exports: [AiService],
})
export class AiModule {}
