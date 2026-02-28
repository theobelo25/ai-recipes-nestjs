// src/ai/validation/ai-json-validator.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidateFunction } from 'ajv';
import { ValidationService } from 'src/common/validation/validation.service';

@Injectable()
export class AiJsonValidator {
  private readonly cache = new WeakMap<object, ValidateFunction>();

  constructor(private readonly validationService: ValidationService) {}

  parseAndValidate<T>(rawText: string, schema: object): T {
    const data = this.parseJson(rawText);
    this.validateOrThrow(schema, data);
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

    throw new BadRequestException({
      message: 'AI returned JSON that does not match the expected schema.',
      errors,
      snippet: this.snippet(JSON.stringify(data)),
    });
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

      throw new BadRequestException({
        message: 'AI returned invalid JSON.',
        snippet: this.snippet(trimmed),
      });
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
}
