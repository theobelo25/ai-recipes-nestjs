import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { FastifyReply } from 'fastify';

const PRISMA_ERROR_MAP: Partial<
  Record<string, { statusCode: HttpStatus; message: string }>
> = {
  P2000: {
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Invalid data provided.',
  },
  P2002: {
    statusCode: HttpStatus.CONFLICT,
    message: 'Unique constraint violation.',
  },
  P2025: {
    statusCode: HttpStatus.NOT_FOUND,
    message: 'Record not found.',
  },
};

const DEFAULT_RESPONSE = {
  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  message: 'Internal server error.',
};

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    const { statusCode, message } =
      PRISMA_ERROR_MAP[exception.code] ?? DEFAULT_RESPONSE;

    const responseBody = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
      message,
    };

    httpAdapter.reply(reply, responseBody, statusCode);
  }
}
