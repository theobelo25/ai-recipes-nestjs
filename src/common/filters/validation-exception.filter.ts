import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';

import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: FastifyError, host: ArgumentsHost) {
    if (!exception.validation) throw exception;

    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const formattedErrors = exception.validation.map((err) => ({
      field: err.instancePath?.replace('/', '') || err.params?.missingPropery,
      message: err.message,
    }));

    reply.status(400).send({
      statusCode: 400,
      error: 'ValidationError',
      message: 'Request validation failed',
      errors: formattedErrors,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
