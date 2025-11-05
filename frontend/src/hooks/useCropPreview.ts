import { useState, useRef, useEffect, useCallback } from 'react';
import { PixelCrop } from 'react-image-crop';
import { renderCropPreview } from '@/utils/crop.utils';

export interface CropPreviewState {
  showPreview: boolean;
  togglePreview: () => void;
  previewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  updatePreview: (image: HTMLImageElement, crop: PixelCrop) => void;
}

/**
 * Hook para gerenciar o preview do crop
 * Encapsula lógica de renderização e estado do preview
 */
export function useCropPreview(): CropPreviewState {
  const [showPreview, setShowPreview] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  const updatePreview = useCallback((image: HTMLImageElement, crop: PixelCrop) => {
    if (!previewCanvasRef.current) return;

    try {
      renderCropPreview(image, previewCanvasRef.current, crop);
    } catch (error) {
      console.error('Error rendering preview:', error);
    }
  }, []);

  return {
    showPreview,
    togglePreview,
    previewCanvasRef,
    updatePreview
  };
}

/**
 * Hook que combina preview com auto-update baseado em mudanças
 */
export function useAutoUpdatePreview(
  showPreview: boolean,
  completedCrop: PixelCrop | undefined,
  imgRef: React.RefObject<HTMLImageElement | null>,
  updatePreview: (image: HTMLImageElement, crop: PixelCrop) => void
): void {
  useEffect(() => {
    if (!showPreview || !completedCrop || !imgRef.current) {
      return;
    }

    if (!imgRef.current.complete || imgRef.current.naturalWidth === 0) {
      return;
    }

    updatePreview(imgRef.current, completedCrop);
  }, [showPreview, completedCrop, imgRef, updatePreview]);
}
