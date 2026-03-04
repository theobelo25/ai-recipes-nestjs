import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  AI_ERROR_CODES,
  type AiErrorResponseBody,
} from '../../errors/ai-error-codes';
import type { OllamaClientConfig } from '../../types/ollama.types';

type OllamaGenerateResponse = {
  response?: string;
  done?: boolean;
  model?: string;
  created_at?: string;
};

type OllamaGenerateOptions = {
  json?: boolean;
  temperature?: number;
  numPredict?: number;
};

@Injectable()
export class OllamaClient {
  constructor(private readonly http: HttpService) {}

  async generateText(
    config: OllamaClientConfig,
    prompt: string,
    opts: OllamaGenerateOptions,
  ): Promise<string> {
    const { json, temperature, numPredict } = opts;

    try {
      const { data } = await firstValueFrom(
        this.http.post<OllamaGenerateResponse>(
          `${config.baseUrl}/api/generate`,
          {
            model: config.model,
            prompt,
            stream: false,
            ...(json ? { format: 'json' } : {}),
            options: {
              ...(temperature !== undefined ? { temperature } : {}),
              ...(numPredict !== undefined ? { num_predict: numPredict } : {}),
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 300_000,
          },
        ),
      );

      return data?.response ?? '';
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const apiError: unknown = error.response?.data;
        const body: AiErrorResponseBody = {
          errorCode: AI_ERROR_CODES.AI_PROVIDER_UNAVAILABLE,
          message: 'Ollama request failed.',
          details: { status, ...(apiError != null && { apiError }) },
        };
        throw new ServiceUnavailableException(body);
      }

      const body: AiErrorResponseBody = {
        errorCode: AI_ERROR_CODES.AI_PROVIDER_UNAVAILABLE,
        message: 'Ollama request failed unexpectedly.',
        details:
          error instanceof Error ? { message: error.message } : undefined,
      };
      throw new ServiceUnavailableException(body);
    }
  }
}
