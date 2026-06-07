import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    // Vérifier que le contexte est HTTP (sinon laisser passer)
    const contextType = host.getType();
    if (contextType !== 'http') {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = request.headers['x-correlation-id'] as string || uuidv4();

    // Status : HttpException → son code, sinon 500
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Message : HttpException → son message, sinon message de l'erreur originale
    let message: string | object;
    if (exception instanceof HttpException) {
      message = exception.getResponse();
    } else if (exception instanceof Error) {
      message = exception.message;
    } else {
      message = 'Erreur interne du serveur';
    }

    // Log toutes les erreurs (4xx et 5xx)
    const logData = {
      correlationId,
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
      status,
      error: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (status >= 500) {
      this.logger.error(logData);
    } else {
      this.logger.warn(logData);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
      message,
    });
  }
}