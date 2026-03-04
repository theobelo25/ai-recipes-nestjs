import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';
import {
  AI_ERROR_CODES,
  type AiErrorResponseBody,
} from '../../errors/ai-error-codes';
import type {
  GroqChatCompletionResponse,
  GroqClientConfig,
} from '../../types/groq.types';

@Injectable()
export class GroqClient {
  constructor(private readonly http: HttpService) {}

  async generateText(
    config: GroqClientConfig,
    prompt: string,
  ): Promise<string> {
    const { apiKey, baseUrl, model } = config;

    const url = `${baseUrl}/chat/completions`;

    const body = {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    };

    try {
      const res = await firstValueFrom(
        this.http.post<GroqChatCompletionResponse>(url, body, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }),
      );

      const data = res.data;
      const text =
        data?.choices?.[0]?.message?.content !== undefined
          ? data.choices[0].message.content
          : '';

      return text;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const apiError: unknown = error.response?.data;
        const body: AiErrorResponseBody = {
          errorCode: AI_ERROR_CODES.AI_PROVIDER_UNAVAILABLE,
          message: 'Groq request failed.',
          details: { status, ...(apiError != null && { apiError }) },
        };
        throw new ServiceUnavailableException(body);
      }

      const body: AiErrorResponseBody = {
        errorCode: AI_ERROR_CODES.AI_PROVIDER_UNAVAILABLE,
        message: 'Groq request failed.',
        details:
          error instanceof Error ? { message: error.message } : undefined,
      };
      throw new ServiceUnavailableException(body);
    }
  }
}
