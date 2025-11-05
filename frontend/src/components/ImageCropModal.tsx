'use client';

import { useCallback } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PixelCrop, PercentCrop } from 'react-image-crop';
import { AspectRatioType, ASPECT_RATIO_CONFIG } from '@/types/image-crop.types';
import { useImageCropping } from '@/hooks/useImageCropping';
import { useCropHistory } from '@/hooks/useCropHistory';
import { useResponsiveContainerSize } from '@/hooks/useResponsiveContainerSize';
import { useCropPreview, useAutoUpdatePreview } from '@/hooks/useCropPreview';
import { CropControls, CropActions, CropModalHeader, CropArea } from './ImageCropModal/index';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  aspectRatio: 'AVATAR' | 'BANNER';
  onComplete: (croppedFile: File) => Promise<void>;
  onReplace?: () => void;
  title?: string;
}

/**
 * Modal para crop de imagens com preview e histórico de undo/redo.
 * Suporta substituição de imagem sem fechar a modal (padrão similar ao Instagram/Facebook).
 */
export default function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  aspectRatio,
  onComplete,
  onReplace,
  title
}: ImageCropModalProps) {
  // Configuração baseada no tipo de aspect ratio
  const aspectRatioType = AspectRatioType[aspectRatio];
  const config = ASPECT_RATIO_CONFIG[aspectRatioType];

  // Custom hooks para separação de responsabilidades
  const containerSize = useResponsiveContainerSize(aspectRatioType);
  const {
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    imgRef,
    onImageLoad: handleImageLoad,
    processCrop,
    isProcessing,
    error
  } = useImageCropping(aspectRatioType);

  const cropHistory = useCropHistory();
  const { showPreview, togglePreview, previewCanvasRef, updatePreview } = useCropPreview();

  // Auto-atualiza preview quando necessário
  useAutoUpdatePreview(showPreview, completedCrop, imgRef, updatePreview);

  // Handler para quando a imagem carrega
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const initialCrop = handleImageLoad(e);
    cropHistory.reset(initialCrop);
  }, [handleImageLoad, cropHistory]);

  // Handler para quando o crop é completado
  const onCropComplete = useCallback((pixelCrop: PixelCrop, percentageCrop: PercentCrop) => {
    setCompletedCrop(pixelCrop);
    // Salva no histórico quando o usuário termina de ajustar
    if (percentageCrop) cropHistory.add(percentageCrop);
  }, [setCompletedCrop, cropHistory]);

  // Handler para undo
  const handleUndo = useCallback(() => {
    const previousCrop = cropHistory.undo();
    if (previousCrop) {
      setCrop(previousCrop);
    }
  }, [cropHistory, setCrop]);

  // Handler para redo
  const handleRedo = useCallback(() => {
    const nextCrop = cropHistory.redo();
    if (nextCrop) {
      setCrop(nextCrop);
    }
  }, [cropHistory, setCrop]);

  const handleSave = useCallback(async () => {
    try {
      await processCrop(onComplete);
      onClose();
    } catch {
      if (error) {
        alert(error);
      }
    }
  }, [processCrop, onComplete, onClose, error]);

  /**
   * Handler para substituição de imagem.
   * Permite selecionar nova imagem mantendo modal aberta (UX similar ao Instagram).
   */
  const handleReplace = useCallback(() => {
    if (onReplace) {
      onReplace();
    } else {
      onClose();
    }
  }, [onReplace, onClose]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-8">
        <div className="relative">
          {/* Botão de fechar sobre a modal */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full border-2 border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-all shadow-lg"
            aria-label="Fechar modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <DialogPanel
            className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-full"
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              maxHeight: 'calc(100vh - 2rem)',
              width: `${containerSize.width + 64}px`,
              maxWidth: 'calc(100vw - 2rem)'
            }}
          >
            {/* Header */}
            <CropModalHeader
              title={title || config.defaultTitle}
              recommendedDimensions={config.recommendedDimensions}
            />

            {/* Área de crop */}
            <CropArea
              imageSrc={imageSrc}
              crop={crop}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              aspect={config.ratio}
              imgRef={imgRef}
              onImageLoad={onImageLoad}
              containerSize={containerSize}
              showPreview={showPreview}
              previewCanvasRef={previewCanvasRef}
            />

            {/* Controles e ações - responsivo */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 px-4 sm:px-8 py-4 sm:py-6 flex-shrink-0">
              {showPreview ? (
                /* Modo Preview: apenas controles */
                <>
                  <CropControls
                    showPreview={showPreview}
                    onPreviewToggle={togglePreview}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={cropHistory.canUndo}
                    canRedo={cropHistory.canRedo}
                    isProcessing={isProcessing}
                    hasCompletedCrop={!!completedCrop}
                  />
                  <div className="flex-1" />
                </>
              ) : (
                /* Modo Crop: controles e ações */
                <>
                  <CropControls
                    showPreview={showPreview}
                    onPreviewToggle={togglePreview}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={cropHistory.canUndo}
                    canRedo={cropHistory.canRedo}
                    isProcessing={isProcessing}
                    hasCompletedCrop={!!completedCrop}
                  />

                  {/* Botões de ação à direita */}
                  <CropActions
                    onCancel={handleReplace}
                    onSave={handleSave}
                    isProcessing={isProcessing}
                    canSave={!!completedCrop}
                  />
                </>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
