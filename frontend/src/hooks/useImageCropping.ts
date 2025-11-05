import { useState, useRef, useCallback } from 'react';
import { Crop, PixelCrop } from 'react-image-crop';
import { AspectRatioType, ASPECT_RATIO_CONFIG } from '@/types/image-crop.types';
import { createInitialCrop, cropImageToFile, validateCrop } from '@/utils/crop.utils';

export interface ImageCroppingState {
  crop: Crop | undefined;
  setCrop: (crop: Crop | undefined) => void;
  completedCrop: PixelCrop | undefined;
  setCompletedCrop: (crop: PixelCrop | undefined) => void;
  imgRef: React.RefObject<HTMLImageElement | null>;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => Crop;
  processCrop: (onComplete: (file: File) => Promise<void>) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
}

/**
 * Hook para gerenciar o estado e lógica de cropping de imagens
 * Encapsula toda a lógica de manipulação de crop
 */
export function useImageCropping(aspectRatioType: AspectRatioType): ImageCroppingState {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const config = ASPECT_RATIO_CONFIG[aspectRatioType];

  /**
   * Handler para quando a imagem carrega
   * Cria e retorna o crop inicial
   */
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>): Crop => {
    const { width, height } = e.currentTarget;
    const initialCrop = createInitialCrop(width, height, config.ratio);
    setCrop(initialCrop);
    return initialCrop;
  }, [config.ratio]);

  /**
   * Processa o crop e chama o callback onComplete
   */
  const processCrop = useCallback(async (
    onComplete: (file: File) => Promise<void>
  ): Promise<void> => {
    setError(null);

    // Validações
    if (!validateCrop(completedCrop)) {
      const errorMsg = 'Por favor, selecione uma área válida para cortar.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!imgRef.current) {
      const errorMsg = 'Imagem não carregada corretamente.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsProcessing(true);

    try {
      const croppedFile = await cropImageToFile(
        imgRef.current,
        completedCrop,
        config
      );

      await onComplete(croppedFile);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao processar imagem. Tente novamente.';
      setError(errorMsg);
      console.error('Error processing image:', err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, config]);

  return {
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    imgRef,
    onImageLoad,
    processCrop,
    isProcessing,
    error
  };
}
