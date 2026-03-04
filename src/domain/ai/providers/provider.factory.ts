import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  AI_ERROR_CODES,
  type AiErrorResponseBody,
} from '../errors/ai-error-codes';
import { AIProvider } from './ai-provider';
import { AIProviderKey } from './provider.keys';

@Injectable()
export class ProviderFactory {
  create(
    provider: AIProviderKey,
    providers: Record<AIProviderKey, AIProvider>,
  ): AIProvider {
    const chosen = providers[provider];
    if (!chosen) {
      const body: AiErrorResponseBody = {
        errorCode: AI_ERROR_CODES.AI_PROVIDER_UNSUPPORTED,
        message: `Unsupported AI provider: ${provider}. Check AI_PROVIDER env.`,
        provider,
      };
      throw new InternalServerErrorException(body);
    }

    return chosen;
  }
}
