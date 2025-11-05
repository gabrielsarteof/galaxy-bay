import Button from '@/components/Button';

interface CropActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isProcessing: boolean;
  canSave: boolean;
}

/**
 * Componente que renderiza os botões de ação (Substituir e Salvar)
 * Separado para melhor organização e reusabilidade
 */
export function CropActions({
  onCancel,
  onSave,
  isProcessing,
  canSave
}: CropActionsProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <button
        onClick={onCancel}
        disabled={isProcessing}
        className="relative z-50 flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-gray-900 bg-white hover:bg-gray-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-gray-200"
        aria-label="Substituir imagem"
      >
        Substituir
      </button>

      <Button
        onClick={onSave}
        loading={isProcessing}
        disabled={!canSave || isProcessing}
        variant="gradient"
        className="relative z-50 flex-1 sm:flex-none px-4 sm:px-8 text-xs sm:text-sm"
        aria-label="Salvar imagem cropada"
      >
        Salvar
      </Button>
    </div>
  );
}
