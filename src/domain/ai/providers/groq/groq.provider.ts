import {
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';

import { AIProvider } from '../ai-provider';
import aiConfig from '../../config/ai.config';
import { AiJsonValidator } from '../../validation/ai-json-validator';
import {
  buildPrompt,
  buildStrictJsonPrompt,
} from '../../validation/ai-json-prompt-builder';
import { GroqClient } from './groq.client';
import {
  AI_ERROR_CODES,
  type AiErrorResponseBody,
} from '../../errors/ai-error-codes';
import {
  type AllowedIngredientRef,
  type GenerateJsonInput,
  type GenerateTextInput,
  type GroqClientConfig,
} from '../../types';

@Injectable()
export class GroqProvider implements AIProvider, OnModuleInit {
  private groqConfig!: GroqClientConfig;

  constructor(
    private readonly groqClient: GroqClient,
    private readonly jsonValidator: AiJsonValidator,
    @Inject(aiConfig.KEY)
    private readonly config: ConfigType<typeof aiConfig>,
  ) {}

  onModuleInit() {
    this.groqConfig = this.validateAndGetConfig();
  }

  async generateText(input: GenerateTextInput): Promise<{ text: string }> {
    const config = this.getConfig();
    const prompt = buildPrompt(input);
    const text = await this.groqClient.generateText(config, prompt);
    return { text };
  }

  async generateJson<T>(
    input: GenerateJsonInput,
    allowedIngredients: AllowedIngredientRef[],
  ): Promise<T> {
    const config = this.getConfig();
    const prompt = buildPrompt({
      prompt: input.prompt,
      system: input.system,
    });

    const strictPrompt = buildStrictJsonPrompt({
      basePrompt: prompt,
      schema: input.schema,
    });

    const raw = await this.groqClient.generateText(config, strictPrompt);
    return this.jsonValidator.parseAndValidate<T>(raw, input.schema, {
      allowedIngredients,
    });
  }

  private getConfig(): GroqClientConfig {
    if (this.groqConfig) return this.groqConfig;
    this.groqConfig = this.validateAndGetConfig();
    return this.groqConfig;
  }

  private validateAndGetConfig(): GroqClientConfig {
    const apiKey = this.config.groq.apiKey?.trim();
    const baseUrl = this.config.groq.baseUrl?.trim();
    const model = this.config.groq.model?.trim();

    const missing: string[] = [];
    if (!apiKey) missing.push('GROQ_API_KEY');
    if (!baseUrl) missing.push('GROQ_BASE_URL');
    if (!model) missing.push('GROQ_MODEL');

    if (missing.length) {
      const body: AiErrorResponseBody = {
        errorCode: AI_ERROR_CODES.AI_CONFIG_MISSING,
        message: `Missing AI config: ${missing.join(', ')} (provider=groq)`,
        missingKeys: missing,
      };
      throw new InternalServerErrorException(body);
    }

    return { apiKey, baseUrl, model };
  }
}
