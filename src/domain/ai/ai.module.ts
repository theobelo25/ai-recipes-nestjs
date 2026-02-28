import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AI_PROVIDER } from './providers/ai.tokens';
import { GeminiProvider } from './providers/gemini/gemini.provider';
import aiConfig from './config/ai.config';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AiJsonValidator } from './validation/ai-json-validator';
import { GeminiClient } from './providers/gemini/gemini.client';
import { ValidationModule } from 'src/common/validation/validation.module';

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
    GeminiClient,
    GeminiProvider,
    AiJsonValidator,
    {
      provide: AI_PROVIDER,
      useExisting: GeminiProvider,
      inject: [aiConfig.KEY, GeminiProvider],
    },
  ],
  exports: [AiService],
})
export class AiModule {}
