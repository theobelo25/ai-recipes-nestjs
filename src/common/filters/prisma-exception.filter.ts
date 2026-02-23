import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { FastifyReply } from 'fastify';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdaptorHost: HttpAdapterHost) {}

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdaptorHost;
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    let statusCode: HttpStatus;
    let errorMessage: string;

    switch (exception.code) {
      case 'P2000': // The provided value for the column is too long
        statusCode = HttpStatus.BAD_REQUEST;
        errorMessage = 'Invalid data provided.';
        break;
      case 'P2002': // Unique constraint failed
        statusCode = HttpStatus.CONFLICT;
        errorMessage = 'Unique constraint violation.';
        break;
      case 'P2025': // Record not found
        statusCode = HttpStatus.NOT_FOUND;
        errorMessage = 'Record not found.';
        break;
      // Add other Prisma error codes and their corresponding HTTP status codes
      default:
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        errorMessage = 'Internal server error.';
    }

    const responseBody = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
      message: errorMessage,
    };

    httpAdapter.reply(reply, responseBody, statusCode);
  }
}
