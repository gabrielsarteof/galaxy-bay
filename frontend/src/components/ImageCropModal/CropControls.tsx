import { EyeIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface CropControlsProps {
  showPreview: boolean;
  onPreviewToggle: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isProcessing: boolean;
  hasCompletedCrop: boolean;
}

/**
 * Componente que renderiza os controles de crop (preview, undo, redo)
 * Separado para melhor organização e reusabilidade
 */
export function CropControls({
  showPreview,
  onPreviewToggle,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isProcessing,
  hasCompletedCrop
}: CropControlsProps) {
  if (showPreview) {
    // Modo Preview: apenas botão de voltar ao crop
    return (
      <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
        <button
          onClick={onPreviewToggle}
          disabled={isProcessing}
          className="relative z-50 p-2.5 sm:p-3 text-gray-700 bg-white hover:bg-gray-50 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 shadow-sm"
          title="Voltar ao crop"
          aria-label="Voltar ao crop"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Modo Crop: controles completos
  return (
    <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
      {/* Botão de Preview */}
      <button
        onClick={onPreviewToggle}
        disabled={isProcessing || !hasCompletedCrop}
        className="relative z-50 p-2.5 sm:p-3 text-gray-700 bg-white hover:bg-gray-50 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 shadow-sm"
        title="Visualizar preview"
        aria-label="Visualizar preview"
      >
        <EyeIcon className="w-5 h-5" />
      </button>

      {/* Grupo de botões Undo/Redo */}
      <div className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={onUndo}
          disabled={isProcessing || !canUndo}
          className="relative z-50 p-2.5 sm:p-3 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Desfazer"
          aria-label="Desfazer"
        >
          <ArrowUturnLeftIcon className="w-5 h-5" />
        </button>

        {/* Divisória vertical */}
        <div className="w-px h-6 bg-gray-200" aria-hidden="true"></div>

        <button
          onClick={onRedo}
          disabled={isProcessing || !canRedo}
          className="relative z-50 p-2.5 sm:p-3 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refazer"
          aria-label="Refazer"
        >
          <ArrowUturnRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
