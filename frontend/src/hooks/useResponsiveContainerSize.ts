import { useState, useEffect } from 'react';
import { AspectRatioType, ContainerSize } from '@/types/image-crop.types';
import { calculateInitialSize, calculateResponsiveDimensions } from '@/utils/crop.utils';

/**
 * Hook para gerenciar o tamanho responsivo do container de crop
 * Calcula automaticamente as dimensões baseado no viewport e tipo de aspect ratio
 */
export function useResponsiveContainerSize(aspectRatioType: AspectRatioType): ContainerSize {
  const [size, setSize] = useState<ContainerSize>(() => calculateInitialSize(aspectRatioType));

  useEffect(() => {
    const calculateSize = () => {
      const dimensions = calculateResponsiveDimensions(
        window.innerWidth,
        window.innerHeight,
        aspectRatioType
      );
      setSize(dimensions);
    };

    // Calcula tamanho inicial
    calculateSize();

    // Adiciona listener para recalcular no resize
    window.addEventListener('resize', calculateSize);

    // Cleanup
    return () => window.removeEventListener('resize', calculateSize);
  }, [aspectRatioType]);

  return size;
}
