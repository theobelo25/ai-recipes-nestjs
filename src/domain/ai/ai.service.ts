import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from './providers/ai.tokens';
import { type AIProvider } from './providers/ai-provider';
import { GenerateJsonInput, GenerateTextInput } from './types';

@Injectable()
export class AiService {
  constructor(@Inject(AI_PROVIDER) private readonly provider: AIProvider) {}

  generateText(input: GenerateTextInput) {
    return this.provider.generateText(input);
  }

  generateJson<T>(input: GenerateJsonInput): Promise<T> {
    return this.provider.generateJson<T>(input);
  }
}
