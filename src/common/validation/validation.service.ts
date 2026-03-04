import { Injectable } from '@nestjs/common';
import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import addErrors from 'ajv-errors';
import addKeywords from 'ajv-keywords';
import { isJsonStringArrayKeyword } from './validation.utils';

@Injectable()
export class ValidationService {
  private readonly ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: true,
      $data: true,
      strictSchema: false,
    });

    addFormats(this.ajv);
    addErrors(this.ajv);

    // ✅ Enable the "transform" keyword so `transform: ['trim']` works
    addKeywords(this.ajv, ['transform']);
    this.ajv.addKeyword(isJsonStringArrayKeyword);
  }

  compileSchema<TSchema extends object>(schema: TSchema): ValidateFunction {
    return this.ajv.compile(schema);
  }

  getInstance(): Ajv {
    return this.ajv;
  }
}
