import { Injectable } from '@nestjs/common';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import addErrors from 'ajv-errors';
import addKeywords from 'ajv-keywords';

@Injectable()
export class ValidationService {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: true, $data: true });
    addFormats(this.ajv);
    addErrors(this.ajv);
    addKeywords(this.ajv, ['transform']);
  }

  compileSchema(schema: object): ValidateFunction {
    return this.ajv.compile(schema);
  }

  getInstance(): Ajv {
    return this.ajv;
  }
}
