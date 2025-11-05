import { DialogTitle } from '@headlessui/react';

interface CropModalHeaderProps {
  title: string;
  recommendedDimensions: string;
}

/**
 * Componente para o cabeçalho do modal de crop
 * Exibe título e dimensões recomendadas
 */
export function CropModalHeader({ title, recommendedDimensions }: CropModalHeaderProps) {
  return (
    <div className="flex flex-col gap-2 px-4 sm:px-8 pt-4 sm:pt-5 pb-4 sm:pb-6 flex-shrink-0">
      <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 text-center">
        {title}
      </DialogTitle>
      <p className="text-xs sm:text-sm text-gray-500 text-center">
        Para obter melhores resultados, envie uma imagem com pelo menos {recommendedDimensions}
      </p>
    </div>
  );
}
