import {
  HttpException,
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
import { OllamaClient } from './ollama.client';

import {
  AI_ERROR_CODES,
  type AiErrorResponseBody,
} from '../../errors/ai-error-codes';
import {
  type AllowedIngredientRef,
  type GenerateJsonInput,
  type GenerateTextInput,
} from '../../types';
import { type OllamaClientConfig } from '../../types/ollama.types';

@Injectable()
export class OllamaProvider implements AIProvider, OnModuleInit {
  private ollamaConfig!: OllamaClientConfig;

  constructor(
    private readonly ollamaClient: OllamaClient,
    private readonly jsonValidator: AiJsonValidator,
    @Inject(aiConfig.KEY)
    private readonly config: ConfigType<typeof aiConfig>,
  ) {}

  onModuleInit() {
    this.ollamaConfig = this.validateAndGetConfig();
  }

  async generateText(input: GenerateTextInput): Promise<{ text: string }> {
    const config = this.getConfig();
    const prompt = buildPrompt(input);
    const text = await this.ollamaClient.generateText(config, prompt, {});
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

    const strictPrompt = this.buildStrictJsonPrompt(prompt, input.schema);

    const raw1 = await this.ollamaClient.generateText(config, strictPrompt, {
      json: true,
      temperature: 0,
      numPredict: 900,
    });

    try {
      return this.jsonValidator.parseAndValidate<T>(raw1, input.schema, {
        allowedIngredients,
      });
    } catch (err) {
      const { message, errors, snippet } = this.extractAjvRepairInfo(err);

      const errorJson = errors ? JSON.stringify(errors, null, 2) : undefined;

      const MAX_PREV_CHARS = 6_000;
      const prev =
        raw1.length > MAX_PREV_CHARS ? raw1.slice(0, MAX_PREV_CHARS) : raw1;

      const repairPrompt = [
        strictPrompt,
        '',
        'REPAIR TASK:',
        'Your previous output failed schema validation. Return ONE corrected JSON object.',
        'Return JSON ONLY. No prose.',
        '',
        'VALIDATION SUMMARY:',
        message ?? '(no message)',
        '',
        'VALIDATION ERRORS (fix these paths/keywords):',
        errorJson ?? '(no structured errors available)',
        '',
        'PARSED SNIPPET (what the validator saw):',
        snippet ?? '(no snippet available)',
        '',
        'PREVIOUS RAW OUTPUT (may include mistakes):',
        prev,
        '',
        'REPAIR RULES (DO THIS):',
        '- Keep fields that are already valid.',
        '- Remove unknown/forbidden keys.',
        '- Fix types and constraints exactly.',
        '- Ensure ingredients vs extras rules are followed.',
        '',
        'Now output the corrected JSON object only.',
      ].join('\n');

      const raw2 = await this.ollamaClient.generateText(config, repairPrompt, {
        json: true,
        temperature: 0,
        numPredict: 1200,
      });
      return this.jsonValidator.parseAndValidate<T>(raw2, input.schema, {
        allowedIngredients,
      });
    }
  }

  private getConfig(): OllamaClientConfig {
    if (this.ollamaConfig) return this.ollamaConfig;
    this.ollamaConfig = this.validateAndGetConfig();
    return this.ollamaConfig;
  }

  private validateAndGetConfig(): OllamaClientConfig {
    const baseUrl = this.config.ollama.baseUrl?.trim();
    const model = this.config.ollama.model?.trim();

    const missing: string[] = [];
    if (!baseUrl) missing.push('OLLAMA_BASE_URL');
    if (!model) missing.push('OLLAMA_MODEL');

    if (missing.length) {
      const body: AiErrorResponseBody = {
        errorCode: AI_ERROR_CODES.AI_CONFIG_MISSING,
        message: `Missing AI config: ${missing.join(', ')} (provider=ollama)`,
        missingKeys: missing,
      };
      throw new InternalServerErrorException(body);
    }

    return { baseUrl, model };
  }

  private buildStrictJsonPrompt(
    prompt: string,
    schema: GenerateJsonInput['schema'],
  ) {
    const extraInstructions = [
      'If an ingredient is not in the allowed list, do NOT create a fake ingredientId. Put it in extras instead.',
      '',
      'NON-NEGOTIABLE OUTPUT RULES:',
      '- Must validate against the JSON shape + constraints below.',
      '- Do NOT output a JSON schema.',
      '- Do NOT include keys like "type", "properties", "required", "additionalProperties".',
      '- Do NOT include any keys not listed in the JSON shape.',
      '- Do NOT include UUIDs anywhere except in fields whose name contains "Id".',
      '',
      'PANTRY / ALLOWED LIST RULES (SOURCE OF TRUTH):',
      '- The allowed ingredient list above represents pantry items.',
      '- Pantry items MUST appear ONLY in ingredients[] using ingredientId.',
      '- Pantry items MUST NEVER appear in extras[] under any name variation.',
      '- ingredients[].ingredientId MUST be one of the allowed IDs. Never invent/modify IDs.',
      '',
      'INGREDIENTS vs EXTRAS (DISJOINT SET):',
      '- ingredients[] = pantry/allowed items (by ingredientId only).',
      '- extras[] = non-pantry items NOT present in the allowed list (by name only).',
      '- extras[].name MUST NOT match any allowed ingredient name (case-insensitive; ignore pluralization + minor punctuation).',
      '- Never list the same real-world ingredient in both ingredients[] and extras[].',
      '- If unsure whether a candidate extra matches an allowed ingredient, OMIT it.',
      '',
      'CLOSURE ALGORITHM (MUST FOLLOW):',
      '1) First, choose ALL pantry items you will use -> ingredients[].',
      '2) Then, choose ONLY the non-pantry items you must add -> extras[].',
      '3) Only after (1) and (2), write title/description/instructions using ONLY items listed in ingredients[] or extras[].',
      '',
      'CLOSURE RULE (MANDATORY):',
      '- Every ingredient mentioned or implied in title/description/instructions MUST appear in ingredients[] or extras[].',
      '- This includes items like vegetables, oils, salt, pepper, butter, sauces, spices/seasonings, etc.',
      '- You MUST NOT mention any ingredient in the text unless it is listed in ingredients[] or extras[].',
      '',
      'EXTRAS RULE (MANDATORY):',
      '- If you use ANY non-pantry ingredient, you MUST include the "extras" field.',
      '- extras must list each non-pantry ingredient used (0–12 items).',
      '- extras[].name must be specific enough to shop for. Do NOT use vague "spices"—name the specific spice(s).',
      '',
      'FORBIDDEN FIELDS:',
      '- ingredients[] objects may ONLY contain: ingredientId, quantity, unit, sortOrder.',
      '- Do NOT include "name" inside ingredients[].',
      '- Do NOT include "note".',
      '',
      'UNITS & QUANTITY:',
      '- quantity is optional; if present it must be a NUMBER >= 0 (e.g., 0.5 for half).',
      '- unit is optional; if present it must be a short unit string (1–32 chars): lb, g, tbsp, tsp, cup, breast, etc.',
      '- Do NOT put ingredient names in unit (e.g., not "chicken breasts").',
      '- If you do not need a quantity or unit for an ingredient or extra, OMIT that field completely; never use 0, an empty string, or null as a placeholder.',
      '',
      'INSTRUCTIONS RULES:',
      '- instructions MUST be an array of 4–12 strings.',
      '- Each step must be 15–500 characters.',
      '- Each step must be a real cooking action with useful detail (heat/time/visual cue).',
      '- Do NOT include ingredient quantities in instructions.',
      '- Do NOT reference any ingredient not listed in ingredients[] or extras[].',
      '',
      'RECIPE QUALITY RULES:',
      '- Prefer pantry items as the primary ingredients.',
      '- Use extras only when necessary for a coherent recipe.',
      '- Aim for 0–3 extras unless absolutely required.',
      '- Do not force all pantry items—only include ones that fit the recipe.',
      '',
      'REQUIRED JSON SHAPE (ONLY THESE KEYS):',
      '{',
      '  "title": string (2–120 chars),',
      '  "description": string (10–500 chars),',
      '  "instructions": string[] (4–12 items),',
      '  "servings": integer (1–50),',
      '  "prepMinutes": integer (0–1440),',
      '  "cookMinutes": integer (0–1440),',
      '  "ingredients": [',
      '    { "ingredientId": string, "quantity"?: number, "unit"?: string, "sortOrder"?: integer }',
      '  ],',
      '  "extras"?: [',
      '    { "name": string (1–80 chars), "quantity"?: number, "unit"?: string }',
      '  ]',
      '}',
      '',
      'FINAL CHECK (MUST PASS BEFORE OUTPUT):',
      '- JSON only, one object, no extra keys.',
      '- Every ingredient in text is listed in ingredients[] or extras[].',
      '- No pantry item appears in extras[].',
      '- If any non-pantry item is used, extras exists and lists them.',
      '- If sortOrder exists for one ingredient, it exists for all starting at 0.',
    ];

    return buildStrictJsonPrompt({
      basePrompt: prompt,
      schema,
      extraInstructions,
    });
  }

  private extractAjvRepairInfo(err: unknown): {
    message?: string;
    errors?: unknown;
    snippet?: string;
  } {
    if (err instanceof HttpException) {
      const resp = err.getResponse();

      if (typeof resp === 'object' && resp !== null) {
        const r = resp as Record<string, unknown>;

        const message = typeof r.message === 'string' ? r.message : undefined;

        const errors = Array.isArray(r.errors) ? r.errors : undefined;

        const snippet = typeof r.snippet === 'string' ? r.snippet : undefined;

        return {
          message,
          errors,
          snippet,
        };
      }

      if (typeof resp === 'string') {
        return { message: resp };
      }
    }

    if (err instanceof Error) return { message: err.message };
    return { message: String(err) };
  }
}
