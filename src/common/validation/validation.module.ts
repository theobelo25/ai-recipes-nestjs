import { Global, Module } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

@Global()
@Module({})
export class ValidationModule {
  static configure(app: NestFastifyApplication) {
    const ajv = new Ajv({ allErrors: true, strict: true });
    addFormats(ajv); // Adds formats like 'email', 'date-time', etc.

    // Fastify expects a function that returns a compiled AJV schema
    app
      .getHttpAdapter()
      .getInstance()
      .setValidatorCompiler(({ schema }) => {
        return ajv.compile(schema);
      });

    console.log('AJV validation configured globally');
  }
}
