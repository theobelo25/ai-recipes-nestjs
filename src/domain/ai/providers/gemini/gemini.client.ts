import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  GeminiClientConfig,
  GeminiErrorResponse,
  GeminiGenerateContentResponse,
} from '../../types';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';

@Injectable()
export class GeminiClient {
  constructor(private readonly http: HttpService) {}

  async generateText(
    config: GeminiClientConfig,
    prompt: string,
  ): Promise<string> {
    const { apiKey, baseUrl, model } = config;

    const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    try {
      const res = await firstValueFrom(this.http.post(url, body));
      const data = res.data as GeminiGenerateContentResponse;
      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map((p) => p.text)
          .filter(Boolean)
          .join('') ?? '';

      return text;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const details = error.response?.data as GeminiErrorResponse | undefined;

        throw new ServiceUnavailableException({
          message: 'Gemini request failed.',
          status,
          details,
        });
      }

      throw new ServiceUnavailableException({
        message: 'Gemini request failed.',
      });
    }
  }
}
