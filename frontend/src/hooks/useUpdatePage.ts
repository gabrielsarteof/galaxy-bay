import { useState } from 'react';
import { updatePage } from '@/services/page';
import { UpdatePageFormData } from '@/schemas/page.schema';
import type { components } from '@/types/api-schema';

type PageResponseDto = components['schemas']['PageResponseDto'];

interface UseUpdatePageReturn {
  updatePageMutation: (
    pageId: string,
    data: Partial<UpdatePageFormData>
  ) => Promise<PageResponseDto | null>;
  isUpdating: boolean;
  error: string;
  clearError: () => void;
}

/**
 * Hook para gerenciar atualizações de página.
 * Realiza validação e tratamento de erros padronizado.
 */
export function useUpdatePage(): UseUpdatePageReturn {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const clearError = () => setError('');

  const updatePageMutation = async (
    pageId: string,
    data: Partial<UpdatePageFormData>
  ): Promise<PageResponseDto | null> => {
    setIsUpdating(true);
    setError('');

    try {
      const updatedPage = await updatePage(pageId, data);
      return updatedPage;
    } catch (err: unknown) {
      console.error('Erro ao atualizar página:', err);
      handleError(err);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleError = (err: unknown) => {
    if (err && typeof err === 'object' && 'response' in err) {
      const error = err as {
        response?: { data?: { message?: string; statusCode?: number } };
      };
      const statusCode = error.response?.data?.statusCode;
      const message = error.response?.data?.message;

      if (statusCode === 400) {
        setError('Dados inválidos. Verifique os campos e tente novamente.');
      } else if (statusCode === 401) {
        setError('Sessão expirada. Redirecionando para login...');
      } else if (statusCode === 404) {
        setError('Página não encontrada.');
      } else {
        setError(message || 'Erro ao atualizar a página. Tente novamente.');
      }
    } else {
      setError('Erro ao conectar com o servidor. Verifique sua conexão.');
    }
  };

  return {
    updatePageMutation,
    isUpdating,
    error,
    clearError,
  };
}
