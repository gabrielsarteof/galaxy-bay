import { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import {
  AspectRatioConfig,
  AspectRatioType,
  ContainerSize,
  ResponsiveBreakpoints,
  IMAGE_CROP_CONSTANTS
} from '@/types/image-crop.types';
import { compressImage } from './imageProcessing';

/**
 * Cria o crop inicial centralizado para uma imagem
 */
export function createInitialCrop(
  width: number,
  height: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 100, // Preenche toda a largura visível
      },
      aspect,
      width,
      height
    ),
    width,
    height
  );
}

/**
 * Detecta breakpoints responsivos baseado no viewport
 */
export function getResponsiveBreakpoints(viewportWidth: number): ResponsiveBreakpoints {
  return {
    isMobile: viewportWidth < 640,
    isTablet: viewportWidth >= 640 && viewportWidth < 1024,
    isDesktop: viewportWidth >= 1024
  };
}

/**
 * Calcula dimensões do container baseado no viewport e tipo de aspect ratio
 */
export function calculateResponsiveDimensions(
  viewportWidth: number,
  viewportHeight: number,
  aspectRatioType: AspectRatioType
): ContainerSize {
  const { isMobile, isTablet } = getResponsiveBreakpoints(viewportWidth);

  // Espaços REAIS ocupados pela modal
  const outerPadding = isMobile ? 32 : 64; // p-4 vs p-8 (16px * 2)
  const innerPadding = isMobile ? 32 : 64; // px-4 vs px-8
  const headerHeight = isMobile ? 100 : 120; // Header com título e texto
  const footerHeight = isMobile ? 120 : 100; // Botões e controles
  const safeMargin = 40; // Margem de segurança

  // Espaço total ocupado verticalmente e horizontalmente
  const totalVerticalSpace = headerHeight + footerHeight + safeMargin;
  const totalHorizontalSpace = outerPadding + innerPadding;

  // Espaço disponível para a imagem
  const availableWidth = viewportWidth - totalHorizontalSpace;
  const availableHeight = viewportHeight - totalVerticalSpace;

  if (aspectRatioType === AspectRatioType.AVATAR) {
    return calculateAvatarDimensions(availableWidth, availableHeight, isMobile, isTablet);
  } else {
    return calculateBannerDimensions(availableWidth, availableHeight, isMobile, isTablet);
  }
}

/**
 * Calcula dimensões para avatar (quadrado)
 */
function calculateAvatarDimensions(
  availableWidth: number,
  availableHeight: number,
  isMobile: boolean,
  isTablet: boolean
): ContainerSize {
  const targetSizes = {
    mobile: 280,
    tablet: 450,
    desktop: 600
  };

  const targetSize = isMobile ? targetSizes.mobile : isTablet ? targetSizes.tablet : targetSizes.desktop;
  const availableSize = Math.min(availableWidth, availableHeight);
  const finalSize = Math.min(targetSize, availableSize);

  const size = Math.max(250, finalSize);
  return { width: size, height: size };
}

/**
 * Calcula dimensões para banner (16:9)
 */
function calculateBannerDimensions(
  availableWidth: number,
  availableHeight: number,
  isMobile: boolean,
  isTablet: boolean
): ContainerSize {
  const targetWidths = {
    mobile: 280,
    tablet: 600,
    desktop: 900
  };

  const targetWidth = isMobile ? targetWidths.mobile : isTablet ? targetWidths.tablet : targetWidths.desktop;
  let finalWidth = Math.min(targetWidth, availableWidth);
  let calculatedHeight = finalWidth / (16 / 9);

  // Se altura não cabe, recalcula pela altura
  if (calculatedHeight > availableHeight) {
    calculatedHeight = availableHeight;
    finalWidth = calculatedHeight * (16 / 9);
  }

  // Garante aspect ratio exato 16:9 usando floor apenas na largura
  const width = Math.max(250, Math.floor(finalWidth));
  const height = Math.round(width / (16 / 9)); // Calcula altura baseada na largura para manter aspect ratio exato

  return { width, height };
}

/**
 * Calcula a dimensão inicial do container com base no aspect ratio
 */
export function calculateInitialSize(aspectRatioType: AspectRatioType): ContainerSize {
  if (typeof window === 'undefined') {
    // SSR fallback
    return aspectRatioType === AspectRatioType.AVATAR
      ? { width: 600, height: 600 }
      : { width: 900, height: 506 };
  }

  return calculateResponsiveDimensions(
    window.innerWidth,
    window.innerHeight,
    aspectRatioType
  );
}

/**
 * Renderiza preview do crop em um canvas
 * Implementação oficial do react-image-crop
 */
export function renderCropPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = IMAGE_CROP_CONSTANTS.CANVAS_QUALITY;

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  // Move a origem do crop para a origem do canvas (0,0)
  ctx.translate(-cropX, -cropY);
  // Move a origem para o centro da imagem original
  ctx.translate(centerX, centerY);
  // Move o centro de volta para a origem do crop (0,0)
  ctx.translate(-centerX, -centerY);

  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );

  ctx.restore();
}

/**
 * Converte canvas para blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number = IMAGE_CROP_CONSTANTS.COMPRESSION_QUALITY
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Valida se o crop é válido para processamento
 */
export function validateCrop(crop: PixelCrop | undefined): crop is PixelCrop {
  return crop !== undefined && crop.width > 0 && crop.height > 0;
}

/**
 * Processa a imagem cropada e retorna um arquivo comprimido
 */
export async function cropImageToFile(
  image: HTMLImageElement,
  crop: PixelCrop,
  config: AspectRatioConfig
): Promise<File> {
  if (!validateCrop(crop)) {
    throw new Error('Invalid crop dimensions');
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Calcula dimensões do crop na imagem original
  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  // Define tamanho do canvas de saída
  canvas.width = config.targetSize;
  canvas.height = config.ratio === 1
    ? config.targetSize
    : Math.round(config.targetSize / config.ratio);

  // Desenha com alta qualidade
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = IMAGE_CROP_CONSTANTS.CANVAS_QUALITY;

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob = await canvasToBlob(canvas);
  const compressedFile = await compressImage(blob, 1);

  return compressedFile;
}
