import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { imageOptimizer } from '../utils/image-optimizer';

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  private readonly maxSize: number;
  private readonly allowedFormats: string[];

  constructor(
    maxSize: number = 10 * 1024 * 1024,
    allowedFormats: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ) {
    this.maxSize = maxSize;
    this.allowedFormats = allowedFormats;
  }

  async transform(value: Express.Multer.File | Express.Multer.File[]) {
    if (!value) {
      return value;
    }

    const files = Array.isArray(value) ? value : [value];

    for (const file of files) {
      await this.validateFile(file);
    }

    return value;
  }

  private async validateFile(file: Express.Multer.File): Promise<void> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    if (!this.allowedFormats.includes(file.mimetype)) {
      throw new BadRequestException(
        `Image format ${file.mimetype} is not allowed`,
      );
    }

    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `Image size exceeds ${this.maxSize / 1024 / 1024}MB limit`,
      );
    }

    const validation = await imageOptimizer.validateImage(file.buffer);

    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    if (validation.metadata) {
      const { width, height } = validation.metadata;
      const maxDimension = 8000;

      if (
        width &&
        height &&
        (width > maxDimension || height > maxDimension)
      ) {
        throw new BadRequestException(
          `Image dimensions must not exceed ${maxDimension}x${maxDimension}`,
        );
      }
    }
  }
}
