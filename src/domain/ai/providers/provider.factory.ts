import { Injectable } from '@nestjs/common';
import { AIProvider } from './ai-provider';

@Injectable()
export class ProviderFactory {
  create<K extends string>(
    provider: K,
    providers: Record<K, AIProvider>,
  ): AIProvider {
    const chosen = providers[provider];
    if (!chosen) throw new Error(`Unsupported AI provider: ${provider}`);

    return chosen;
  }
}
