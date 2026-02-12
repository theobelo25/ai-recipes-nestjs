import { Injectable } from '@nestjs/common';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

@Injectable()
export class ValidationService {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: true });
    addFormats(this.ajv);
  }

  compileSchema(schema: object): ValidateFunction {
    return this.ajv.compile(schema);
  }

  getInstance(): Ajv {
    return this.ajv;
  }
}
