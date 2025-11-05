import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface RateLimitOptions {
  ttl: number;
  limit: number;
}

const requestCounts = new Map<string, { count: number; resetTime: number }>();

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;

    const options: RateLimitOptions = {
      ttl: 60 * 1000,
      limit: 100,
    };

    const now = Date.now();
    const key = `${ip}`;

    let record = requestCounts.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + options.ttl,
      };
      requestCounts.set(key, record);
      return true;
    }

    record.count++;

    if (record.count > options.limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60 * 1000);
