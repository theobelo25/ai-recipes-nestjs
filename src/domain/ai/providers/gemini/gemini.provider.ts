import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AIProvider } from '../ai-provider';
import { type ConfigType } from '@nestjs/config';
import aiConfig from '../../config/ai.config';

import { AiJsonValidator } from '../../validation/ai-json-validator';
import { GeminiClient } from './gemini.client';
import { GenerateJsonInput, GenerateTextInput } from '../../types';

@Injectable()
export class GeminiProvider implements AIProvider, OnModuleInit {
  constructor(
    private readonly geminiClient: GeminiClient,
    private readonly jsonValidator: AiJsonValidator,
    @Inject(aiConfig.KEY)
    private readonly config: ConfigType<typeof aiConfig>,
  ) {}

  onModuleInit() {
    this.getValidatedConfig();
  }

  async generateText(input: GenerateTextInput): Promise<{ text: string }> {
    const config = this.getValidatedConfig();
    const prompt = this.buildPrompt(input);
    const text = await this.geminiClient.generateText(config, prompt);

    return { text };
  }

  async generateJson<T>(input: GenerateJsonInput): Promise<T> {
    const config = this.getValidatedConfig();
    const prompt = this.buildPrompt({
      prompt: input.prompt,
      system: input.system,
    });

    const strictPrompt = [
      prompt,
      '',
      'Return ONLY valid JSON that matches this schema:',
      JSON.stringify(input.schema, null, 2),
      '',
      'Do not include markdown or any extra text.',
      'If a required field is unknown, still include it with a reasonable empty value that matches the schema.',
    ].join('\n');

    const raw = await this.geminiClient.generateText(config, strictPrompt);

    return this.jsonValidator.parseAndValidate<T>(raw, input.schema);
  }

  private buildPrompt(input: GenerateTextInput): string {
    if (!input.system?.trim()) return input.prompt;
    return `${input.system.trim()}\n\n${input.prompt}`;
  }

  private getValidatedConfig() {
    const apiKey = this.config.gemini.apiKey?.trim();
    const baseUrl = this.config.gemini.baseUrl?.trim();
    const model = this.config.gemini.model?.trim();

    const missing: string[] = [];
    if (!apiKey) missing.push('GEMINI_API_KEY');
    if (!baseUrl) missing.push('GEMINI_BASE_URL');
    if (!model) missing.push('GEMINI_MODEL');

    if (missing.length) {
      throw new Error(
        `Missing AI config value(s): ${missing.join(', ')} (provider=gemini)`,
      );
    }

    return { apiKey, baseUrl, model };
  }
}
