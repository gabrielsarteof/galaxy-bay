import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { imageOptimizer } from '../utils/image-optimizer';

@Injectable()
export class ImageOptimizationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ImageOptimizationInterceptor.name);

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const files = request.files || [];

    if (files.length > 0) {
      await this.optimizeFiles(files);
    }

    if (request.file) {
      await this.optimizeFile(request.file);
    }

    return next.handle().pipe(
      map((data) => {
        return data;
      }),
    );
  }

  private async optimizeFiles(files: Express.Multer.File[]): Promise<void> {
    await Promise.all(
      files.map((file) => this.optimizeFile(file)),
    );
  }

  private async optimizeFile(file: Express.Multer.File): Promise<void> {
    if (!file.mimetype.startsWith('image/')) {
      return;
    }

    if (file.mimetype === 'image/svg+xml') {
      return;
    }

    try {
      const validation = await imageOptimizer.validateImage(file.buffer);

      if (!validation.valid) {
        this.logger.warn(`Invalid image: ${validation.error}`);
        return;
      }

      const originalSize = file.buffer.length;
      const optimized = await imageOptimizer.optimize(file.buffer, {
        quality: 85,
        format: 'webp',
      });

      file.buffer = optimized;
      file.mimetype = 'image/webp';
      file.originalname = file.originalname.replace(/\.\w+$/, '.webp');

      const savedBytes = originalSize - optimized.length;
      const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

      this.logger.log(
        `Optimized ${file.originalname}: ${(originalSize / 1024).toFixed(1)}KB → ${(optimized.length / 1024).toFixed(1)}KB (${savedPercent}% saved)`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to optimize ${file.originalname}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
