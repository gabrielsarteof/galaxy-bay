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
export class QueryPerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('QueryPerformance');
  private readonly slowQueryThreshold = 1000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        if (duration > this.slowQueryThreshold) {
          this.logger.warn(
            `Slow query detected: ${method} ${url} - ${duration}ms`,
          );
        }
      }),
    );
  }
}
