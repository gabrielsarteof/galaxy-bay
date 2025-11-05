import { useState, useCallback } from 'react';
import { Crop } from 'react-image-crop';
import { IMAGE_CROP_CONSTANTS } from '@/types/image-crop.types';

export interface CropHistoryState {
  current: Crop | undefined;
  canUndo: boolean;
  canRedo: boolean;
  add: (crop: Crop) => void;
  undo: () => Crop | undefined;
  redo: () => Crop | undefined;
  reset: (initialCrop?: Crop) => void;
}

/**
 * Hook para gerenciar histórico de crops com funcionalidade de undo/redo
 * Segue o padrão Command Pattern para gerenciamento de estado
 */
export function useCropHistory(initialCrop?: Crop): CropHistoryState {
  const [history, setHistory] = useState<Crop[]>(initialCrop ? [initialCrop] : []);
  const [currentIndex, setCurrentIndex] = useState(initialCrop ? 0 : -1);

  /**
   * Adiciona um novo crop ao histórico
   * Remove itens futuros se estiver no meio do histórico (após undo)
   */
  const add = useCallback((crop: Crop) => {
    if (!crop) return;

    setHistory((prev) => {
      // Remove itens futuros se estiver no meio do histórico
      const newHistory = prev.slice(0, currentIndex + 1);
      // Adiciona o novo crop
      newHistory.push(crop);

      // Limita o histórico para evitar uso excessivo de memória
      if (newHistory.length > IMAGE_CROP_CONSTANTS.HISTORY_LIMIT) {
        newHistory.shift();
        // Não incrementa o índice pois removemos o primeiro
        return newHistory;
      }

      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex]);

  /**
   * Desfaz a última ação (volta para o crop anterior)
   */
  const undo = useCallback((): Crop | undefined => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      return history[newIndex];
    }
    return undefined;
  }, [currentIndex, history]);

  /**
   * Refaz uma ação desfeita (avança para o próximo crop)
   */
  const redo = useCallback((): Crop | undefined => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      return history[newIndex];
    }
    return undefined;
  }, [currentIndex, history]);

  /**
   * Reseta o histórico com um novo crop inicial
   */
  const reset = useCallback((newInitialCrop?: Crop) => {
    if (newInitialCrop) {
      setHistory([newInitialCrop]);
      setCurrentIndex(0);
    } else {
      setHistory([]);
      setCurrentIndex(-1);
    }
  }, []);

  return {
    current: history[currentIndex],
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    add,
    undo,
    redo,
    reset
  };
}
