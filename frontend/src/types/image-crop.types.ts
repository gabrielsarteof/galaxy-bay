export enum AspectRatioType {
  AVATAR = 'AVATAR',
  BANNER = 'BANNER'
}

export interface AspectRatioConfig {
  ratio: number;
  recommendedDimensions: string;
  targetSize: number;
  defaultTitle: string;
}

export const ASPECT_RATIO_CONFIG: Record<AspectRatioType, AspectRatioConfig> = {
  [AspectRatioType.AVATAR]: {
    ratio: 1,
    recommendedDimensions: '1024 × 1024 pixels',
    targetSize: 1024,
    defaultTitle: 'Editar foto de perfil'
  },
  [AspectRatioType.BANNER]: {
    ratio: 16 / 9,
    recommendedDimensions: '2560 × 1440 pixels',
    targetSize: 1920,
    defaultTitle: 'Editar foto de capa'
  }
} as const;

export const IMAGE_CROP_CONSTANTS = {
  HISTORY_LIMIT: 20,
  COMPRESSION_QUALITY: 0.95,
  MIN_CROP_SIZE: 50,
  CANVAS_QUALITY: 'high' as ImageSmoothingQuality
} as const;

export interface ContainerSize {
  width: number;
  height: number;
}

export interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}
