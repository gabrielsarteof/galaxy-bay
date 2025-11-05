import imageCompression from 'browser-image-compression';
import type { Area } from 'react-easy-crop';

/**
 * Cria uma imagem cropada a partir de uma área de crop
 * Baseado nas best practices do react-easy-crop
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  maxWidth: number = 1024
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Calcula dimensões mantendo qualidade
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = Math.min(pixelCrop.width, maxWidth);
  canvas.height = Math.min(pixelCrop.height, maxWidth * (pixelCrop.height / pixelCrop.width));

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}

/**
 * Cria um elemento Image a partir de uma URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

/**
 * Comprime uma imagem mantendo qualidade aceitável
 */
export async function compressImage(
  file: File | Blob,
  maxSizeMB: number = 1
): Promise<File> {
  const options = {
    maxSizeMB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg'
  };

  try {
    const compressedFile = await imageCompression(file as File, options);
    return compressedFile;
  } catch (error) {
    console.error('Image compression error:', error);
    throw error;
  }
}

/**
 * Converte um arquivo para base64 para preview
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Valida se o arquivo é uma imagem válida
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato inválido. Use JPEG, PNG ou WebP'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Máximo 10MB'
    };
  }

  return { valid: true };
}

/**
 * Aspect ratios comuns para diferentes tipos de imagem
 */
export const ASPECT_RATIOS = {
  AVATAR: 1, // 1:1 (quadrado)
  BANNER: 16 / 9, // 16:9 (widescreen)
  COVER: 3 / 2 // 3:2 (paisagem)
} as const;

/**
 * Dimensões recomendadas para cada tipo de imagem
 */
export const RECOMMENDED_DIMENSIONS = {
  AVATAR: { width: 1024, height: 1024 },
  BANNER: { width: 2560, height: 1440 } // 16:9 aspect ratio exato (2560/1440 = 1.777...)
} as const;

/**
 * Redimensiona e faz crop automático de imagens para o aspect ratio correto
 * Seguindo padrão de mercado (Facebook, Instagram, Twitter)
 *
 * @param dataUrl - Data URL da imagem original
 * @param type - Tipo de imagem (avatar ou banner)
 * @returns Data URL da imagem processada com aspect ratio correto
 */
export async function autoResizeIfNeeded(
  dataUrl: string,
  type: 'avatar' | 'banner'
): Promise<string> {
  const image = await createImage(dataUrl);
  const recommended = type === 'avatar' ? RECOMMENDED_DIMENSIONS.AVATAR : RECOMMENDED_DIMENSIONS.BANNER;
  const targetAspect = type === 'avatar' ? ASPECT_RATIOS.AVATAR : ASPECT_RATIOS.BANNER;

  const imageAspect = image.width / image.height;

  // Se a imagem já está dentro das dimensões recomendadas E tem o aspect ratio correto
  if (
    image.width <= recommended.width &&
    image.height <= recommended.height &&
    Math.abs(imageAspect - targetAspect) < 0.01
  ) {
    return dataUrl;
  }

  // Calcula dimensões para crop centralizado no aspect ratio correto
  let sourceWidth: number;
  let sourceHeight: number;
  let sourceX: number;
  let sourceY: number;

  if (imageAspect > targetAspect) {
    // Imagem mais larga - crop horizontalmente
    sourceHeight = image.height;
    sourceWidth = Math.round(sourceHeight * targetAspect);
    sourceX = Math.round((image.width - sourceWidth) / 2);
    sourceY = 0;
  } else {
    // Imagem mais alta - crop verticalmente
    sourceWidth = image.width;
    sourceHeight = Math.round(sourceWidth / targetAspect);
    sourceX = 0;
    sourceY = Math.round((image.height - sourceHeight) / 2);
  }

  // Calcula escala para as dimensões recomendadas
  const scale = Math.max(
    recommended.width / sourceWidth,
    recommended.height / sourceHeight
  );

  const targetWidth = Math.round(sourceWidth * scale);
  const targetHeight = Math.round(sourceHeight * scale);

  // Cria canvas com dimensões finais
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Desenha com alta qualidade
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Desenha a parte cropada da imagem
  ctx.drawImage(
    image,
    sourceX, sourceY, sourceWidth, sourceHeight,  // área de origem (crop)
    0, 0, targetWidth, targetHeight                // destino (canvas inteiro)
  );

  return canvas.toDataURL('image/jpeg', 0.95);
}
