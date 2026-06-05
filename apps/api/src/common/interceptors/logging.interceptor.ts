import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, Logger,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userId = request.user?.id || 'anonymous';
    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Log structuré JSON
        const log = {
          timestamp: new Date().toISOString(),
          level: 'info',
          method,
          url,
          statusCode,
          duration_ms: duration,
          userId,
          ip,
        };

        // Alerter si la requête est lente (> 2 secondes)
        if (duration > 2000) {
          this.logger.warn(`SLOW REQUEST : ${method} ${url} — ${duration}ms`);
        } else {
          this.logger.log(`${method} ${url} ${statusCode} — ${duration}ms [user: ${userId}]`);
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        // Log structuré pour les erreurs
        const log = {
          timestamp: new Date().toISOString(),
          level: 'error',
          method,
          url,
          error: error.message,
          statusCode: error.status || 500,
          duration_ms: duration,
          userId,
          ip,
        };

        this.logger.error(
          `${method} ${url} ERROR ${error.status || 500} — ${duration}ms — ${error.message}`
        );

        return throwError(() => error);
      }),
    );
  }
}