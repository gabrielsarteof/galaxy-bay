import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    if (body && Object.keys(body).length > 0) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const contentLength = response.get('content-length') || 0;
          const duration = Date.now() - startTime;

          this.logger.log(
            `Response: ${method} ${url} ${statusCode} ${contentLength}bytes - ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `Error Response: ${method} ${url} - ${error.message} - ${duration}ms`,
            error.stack,
          );
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'privateKey'];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
