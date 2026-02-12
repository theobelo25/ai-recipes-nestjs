import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyReply } from 'fastify';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdaptorHost: HttpAdapterHost) {}

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdaptorHost;
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const status = exception.getStatus();
    const message = exception.getResponse();

    const responseBody = {
      status,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
      message,
    };

    httpAdapter.reply(reply, responseBody, status);
  }
}
