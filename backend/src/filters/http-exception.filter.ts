import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppConstants } from '../constants/app.constants';
import { HttpExceptionResponse } from '../interfaces/http-exception-response.interface';
import { ErrorResponse } from '../interfaces/error-response.interface';

/**
 * HTTP Exception Filter
 * Единая обработка ошибок для всех контроллеров
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode: string | undefined;

    // Обработка HTTP исключений
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const httpResponse = exceptionResponse as HttpExceptionResponse;
        const responseMessage = httpResponse.message;
        message = Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage || exception.message;
        errorCode = httpResponse.errorCode;
      }
    }
    // Обработка обычных ошибок
    else if (exception instanceof Error) {
      message = exception.message;

      // Определяем статус по типу ошибки
      if (message.includes('Invalid') || message.includes('invalid')) {
        status = HttpStatus.BAD_REQUEST;
        errorCode = 'INVALID_INPUT';
      } else if (
        message.includes('not found') ||
        message.includes('Not found')
      ) {
        status = HttpStatus.NOT_FOUND;
        errorCode = 'NOT_FOUND';
      } else if (message.includes('Insufficient')) {
        status = HttpStatus.PAYMENT_REQUIRED;
        errorCode = 'INSUFFICIENT_FUNDS';
      } else if (message.includes('timeout') || message.includes('Timeout')) {
        status = HttpStatus.REQUEST_TIMEOUT;
        errorCode = 'TIMEOUT';
      } else if (
        message.includes('Unauthorized') ||
        message.includes('unauthorized')
      ) {
        status = HttpStatus.UNAUTHORIZED;
        errorCode = 'UNAUTHORIZED';
      } else if (
        message.includes('Forbidden') ||
        message.includes('forbidden')
      ) {
        status = HttpStatus.FORBIDDEN;
        errorCode = 'FORBIDDEN';
      }
    }

    // Логируем ошибку
    const errorLog = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      status,
      message,
      errorCode,
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (status >= AppConstants.HTTP.STATUS.SERVER_ERROR_THRESHOLD) {
      this.logger.error(`Server Error: ${message}`, errorLog);
    } else if (status >= AppConstants.HTTP.STATUS.CLIENT_ERROR_THRESHOLD) {
      this.logger.warn(`Client Error: ${message}`, errorLog);
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (errorCode) {
      errorResponse.errorCode = errorCode;
    }

    // Добавляем stack trace только в development режиме
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    response.status(status).json(errorResponse);
  }
}
