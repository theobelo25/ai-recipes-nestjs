import { Global, Module } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

@Global()
@Module({
  providers: [ValidationService],
  exports: [ValidationService],
})
export class ValidationModule {
  constructor(private readonly validationService: ValidationService) {}

  configure(app: NestFastifyApplication) {
    app
      .getHttpAdapter()
      .getInstance()
      .setValidatorCompiler(({ schema }) => {
        return this.validationService.getInstance().compile(schema);
      });
  }
}
