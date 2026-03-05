import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyReply } from 'fastify';

@Catch()
export class UnhandledExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnhandledExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    const err =
      exception instanceof Error
        ? exception
        : new Error(String(exception));
    this.logger.error(
      `${err.name}: ${err.message}`,
      err.stack,
    );

    const responseBody = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
      message: 'Internal server error.',
    };

    httpAdapter.reply(reply, responseBody, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
