import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidateFunction } from 'ajv';
import { ValidationService } from 'src/common/validation/validation.service';
import {
  AI_ERROR_CODES,
  type AiErrorResponseBody,
} from '../errors/ai-error-codes';
import type { AllowedIngredientRef } from '../types';

export type AiJsonValidatorContext = {
  allowedIngredients?: AllowedIngredientRef[];
};

@Injectable()
export class AiJsonValidator {
  private readonly cache = new WeakMap<object, ValidateFunction>();

  constructor(private readonly validationService: ValidationService) {}

  parseAndValidate<T>(
    rawText: string,
    schema: object,
    ctx?: AiJsonValidatorContext,
  ): T {
    const data = this.parseJson(rawText);
    this.validateOrThrow(schema, data);
    if (ctx?.allowedIngredients) {
      this.validateExtrasClosureOrThrow(data, ctx.allowedIngredients);
    }

    return data as T;
  }

  validateOrThrow(schema: object, data: unknown): void {
    const validate = this.getOrCompile(schema);
    const ok = validate(data);

    if (ok) return;

    const errors = (validate.errors ?? []).map((e) => ({
      path: e.instancePath || '(root)',
      keyword: e.keyword,
      message: e.message,
      schemaPath: e.schemaPath,
    }));

    const body: AiErrorResponseBody = {
      errorCode: AI_ERROR_CODES.AI_SCHEMA_VALIDATION_FAILED,
      message: 'AI returned JSON that does not match the expected schema.',
      errors,
      snippet: this.snippet(JSON.stringify(data)),
    };
    throw new BadRequestException(body);
  }

  private getOrCompile(schema: object): ValidateFunction {
    const cached = this.cache.get(schema);
    if (cached) return cached;

    const validate = this.validationService.compileSchema(schema);
    this.cache.set(schema, validate);
    return validate;
  }

  private parseJson(rawText: string): unknown {
    const trimmed = rawText.trim();

    try {
      return JSON.parse(trimmed);
    } catch {
      const extracted = this.extractTopLevelJson(trimmed);
      if (extracted) {
        try {
          return JSON.parse(extracted);
        } catch {
          // fall through
        }
      }

      const body: AiErrorResponseBody = {
        errorCode: AI_ERROR_CODES.AI_JSON_INVALID,
        message: 'AI returned invalid JSON.',
        snippet: this.snippet(trimmed),
      };
      throw new BadRequestException(body);
    }
  }

  private extractTopLevelJson(text: string): string | null {
    const firstObj = text.indexOf('{');
    const lastObj = text.lastIndexOf('}');
    if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
      return text.slice(firstObj, lastObj + 1);
    }

    const firstArr = text.indexOf('[');
    const lastArr = text.lastIndexOf(']');
    if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
      return text.slice(firstArr, lastArr + 1);
    }

    return null;
  }

  private snippet(text: string, max = 800): string {
    return text.length <= max ? text : text.slice(0, max) + '…';
  }

  private validateExtrasClosureOrThrow(
    recipe: unknown,
    allowedIngredients: AllowedIngredientRef[],
  ): void {
    if (typeof recipe !== 'object' || recipe === null) return;
    const r = recipe as Record<string, unknown>;

    const title = typeof r.title === 'string' ? r.title : '';
    const description = typeof r.description === 'string' ? r.description : '';
    const instructions = Array.isArray(r.instructions)
      ? r.instructions.filter((x): x is string => typeof x === 'string')
      : [];

    const extras = Array.isArray(r.extras)
      ? r.extras
          .filter(
            (x): x is Record<string, unknown> =>
              typeof x === 'object' && x !== null,
          )
          .map((x) => (typeof x.name === 'string' ? x.name : ''))
          .filter((name) => name.length > 0)
      : [];

    const ingredientsIds = Array.isArray(r.ingredients)
      ? r.ingredients
          .filter(
            (x): x is Record<string, unknown> =>
              typeof x === 'object' && x !== null,
          )
          .map((x) =>
            typeof x.ingredientId === 'string' ? x.ingredientId : '',
          )
          .filter((id) => id.length > 0)
      : [];

    const text = this.norm([title, description, ...instructions].join(' '));

    const extrasSet = new Set(extras.map((x) => this.norm(x)));
    const ingredientIdSet = new Set(ingredientsIds);

    // Map normalized allowed name -> id
    const allowedNameToId = new Map<string, string>();
    for (const a of allowedIngredients) {
      allowedNameToId.set(this.norm(a.name), a.id);
    }

    // Watchlist of common “assumed” items.
    const watchList = [
      'olive oil',
      'salt',
      'pepper',
      'black pepper',
      'garlic',
      'herbs',
      'butter',
      'vegetables',
    ];

    const missingPantry: Array<{ name: string; id: string }> = [];
    const missingExtras: string[] = [];

    for (const item of watchList) {
      const n = this.norm(item);

      // Use substring match (more forgiving than token match)
      if (!text.includes(n)) continue;

      const pantryId = allowedNameToId.get(n);

      if (pantryId) {
        // Mentioned pantry item must be present in ingredients[]
        if (!ingredientIdSet.has(pantryId)) {
          missingPantry.push({ name: item, id: pantryId });
        }
      } else {
        // Mentioned non-pantry item must be present in extras[]
        if (!extrasSet.has(n)) {
          missingExtras.push(item);
        }
      }
    }

    if (missingPantry.length || missingExtras.length) {
      const body: AiErrorResponseBody = {
        errorCode: AI_ERROR_CODES.AI_INGREDIENT_CLOSURE_VIOLATION,
        message: 'AI output violates ingredient closure rules.',
        errors: [
          ...missingPantry.map((m) => ({
            path: '/ingredients',
            keyword: 'ingredientClosurePantry',
            message: `Text references pantry item "${m.name}" but ingredientId "${m.id}" is missing from ingredients[].`,
            schemaPath: '(domain)',
          })),
          ...missingExtras.map((m) => ({
            path: '/extras',
            keyword: 'ingredientClosureExtra',
            message: `Text references "${m}" but it is not listed in extras[] (and is not a pantry item).`,
            schemaPath: '(domain)',
          })),
        ],
        snippet: this.snippet(
          JSON.stringify({ missingPantry, missingExtras, text }).slice(0, 2000),
        ),
      };
      throw new BadRequestException(body);
    }
  }

  private norm(s: string): string {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
