import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface RequestMetrics {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Monitoring');
  private metrics: RequestMetrics[] = [];
  private readonly maxMetrics = 1000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - startTime;

        this.recordMetric({
          method,
          url,
          statusCode: response.statusCode,
          duration,
          timestamp: new Date().toISOString(),
          userAgent,
          ip,
        });

        if (duration > 1000) {
          this.logger.warn(
            `Slow request: ${method} ${url} - ${duration}ms`,
          );
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        this.recordMetric({
          method,
          url,
          statusCode,
          duration,
          timestamp: new Date().toISOString(),
          userAgent,
          ip,
        });

        if (statusCode >= 500) {
          this.logger.error(
            `Error: ${method} ${url} - ${error.message}`,
            error.stack,
          );
        }

        return throwError(() => error);
      }),
    );
  }

  private recordMetric(metric: RequestMetrics) {
    this.metrics.push(metric);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getMetrics(): RequestMetrics[] {
    return this.metrics;
  }

  getStats() {
    const now = Date.now();
    const last5Minutes = this.metrics.filter(
      (m) => now - new Date(m.timestamp).getTime() < 5 * 60 * 1000,
    );

    const totalRequests = last5Minutes.length;
    const avgDuration =
      last5Minutes.reduce((sum, m) => sum + m.duration, 0) / totalRequests || 0;

    const statusCounts = last5Minutes.reduce((acc, m) => {
      const key = Math.floor(m.statusCode / 100) * 100;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const slowRequests = last5Minutes.filter((m) => m.duration > 1000).length;

    return {
      totalRequests,
      avgDuration: Math.round(avgDuration),
      statusCounts,
      slowRequests,
      errorRate:
        totalRequests > 0
          ? ((statusCounts[500] || 0) / totalRequests) * 100
          : 0,
    };
  }

  clearMetrics() {
    this.metrics = [];
  }
}
