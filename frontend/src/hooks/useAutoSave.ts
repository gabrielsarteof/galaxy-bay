import { useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
}

/**
 * Hook para auto-save com debounce
 * Segue o padrão do Patreon de salvar automaticamente após pausa na edição
 *
 * @param options - Configurações do auto-save
 * @returns Estado do auto-save (isSaving, lastSaved, error)
 */
export function useAutoSave<T>({
  data,
  onSave,
  delay = 1000,
  enabled = true
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const debouncedData = useDebounce(data, delay);
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef<Date | null>(null);
  const errorRef = useRef<Error | null>(null);
  const isFirstRender = useRef(true);

  const save = useCallback(async (dataToSave: T) => {
    if (!enabled || isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      errorRef.current = null;

      await onSave(dataToSave);

      lastSavedRef.current = new Date();
    } catch (err) {
      errorRef.current = err as Error;
      console.error('Auto-save error:', err);
    } finally {
      isSavingRef.current = false;
    }
  }, [enabled, onSave]);

  useEffect(() => {
    // Não salva no primeiro render (valores iniciais)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (enabled) {
      save(debouncedData);
    }
  }, [debouncedData, enabled, save]);

  return {
    isSaving: isSavingRef.current,
    lastSaved: lastSavedRef.current,
    error: errorRef.current
  };
}
