import sharp from 'sharp';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export class ImageOptimizer {
  async optimize(
    buffer: Buffer,
    options: ImageOptimizationOptions = {},
  ): Promise<Buffer> {
    const {
      width,
      height,
      quality = 85,
      format = 'webp',
      fit = 'cover',
    } = options;

    let transformer = sharp(buffer);

    if (width || height) {
      transformer = transformer.resize(width, height, {
        fit,
        withoutEnlargement: true,
      });
    }

    switch (format) {
      case 'jpeg':
        transformer = transformer.jpeg({ quality, progressive: true });
        break;
      case 'png':
        transformer = transformer.png({ quality, progressive: true });
        break;
      case 'webp':
        transformer = transformer.webp({ quality });
        break;
      case 'avif':
        transformer = transformer.avif({ quality });
        break;
    }

    return transformer.toBuffer();
  }

  async generateThumbnail(buffer: Buffer, size = 256): Promise<Buffer> {
    return sharp(buffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toBuffer();
  }

  async generateResponsiveImages(
    buffer: Buffer,
    sizes: number[] = [640, 750, 828, 1080, 1200, 1920],
  ): Promise<Map<number, Buffer>> {
    const results = new Map<number, Buffer>();

    await Promise.all(
      sizes.map(async (size) => {
        const optimized = await this.optimize(buffer, {
          width: size,
          quality: 85,
          format: 'webp',
        });
        results.set(size, optimized);
      }),
    );

    return results;
  }

  async getMetadata(buffer: Buffer): Promise<sharp.Metadata> {
    return sharp(buffer).metadata();
  }

  async validateImage(buffer: Buffer): Promise<{
    valid: boolean;
    error?: string;
    metadata?: sharp.Metadata;
  }> {
    try {
      const metadata = await this.getMetadata(buffer);

      if (!metadata.format) {
        return { valid: false, error: 'Invalid image format' };
      }

      const allowedFormats = ['jpeg', 'png', 'webp', 'gif', 'svg'];
      if (!allowedFormats.includes(metadata.format)) {
        return {
          valid: false,
          error: `Format ${metadata.format} not allowed`,
        };
      }

      const maxSize = 10 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return { valid: false, error: 'Image size exceeds 10MB limit' };
      }

      const maxDimension = 8000;
      if (
        metadata.width &&
        metadata.height &&
        (metadata.width > maxDimension || metadata.height > maxDimension)
      ) {
        return { valid: false, error: 'Image dimensions too large' };
      }

      return { valid: true, metadata };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid image',
      };
    }
  }
}

export const imageOptimizer = new ImageOptimizer();
