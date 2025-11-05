import { useState } from 'react';
import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
}

export function useImageOptimization() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);

  const compressImage = async (
    file: File,
    options: CompressionOptions = {},
  ): Promise<File> => {
    const {
      maxSizeMB = 1,
      maxWidthOrHeight = 1920,
      useWebWorker = true,
      quality = 0.85,
    } = options;

    try {
      setIsCompressing(true);
      setProgress(0);

      const compressedFile = await imageCompression(file, {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker,
        initialQuality: quality,
        onProgress: (percent) => {
          setProgress(percent);
        },
      });

      setProgress(100);

      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
      console.log(
        `Compressed image: ${originalSize}MB → ${compressedSize}MB`,
      );

      return compressedFile;
    } finally {
      setIsCompressing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const compressMultiple = async (
    files: File[],
    options?: CompressionOptions,
  ): Promise<File[]> => {
    const compressed: File[] = [];

    for (const file of files) {
      const result = await compressImage(file, options);
      compressed.push(result);
    }

    return compressed;
  };

  const previewImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const validateImage = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'Imagem muito grande (máximo 10MB)' };
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Formato de imagem não suportado' };
    }

    return { valid: true };
  };

  return {
    compressImage,
    compressMultiple,
    previewImage,
    validateImage,
    isCompressing,
    progress,
  };
}
