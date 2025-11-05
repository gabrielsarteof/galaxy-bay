import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPage } from '@/services/page';
import { CreatePageFormData } from '@/schemas/page.schema';

interface UseCreatePageReturn {
  createPageMutation: (data: CreatePageFormData) => Promise<void>;
  isLoading: boolean;
  error: string;
  clearError: () => void;
}

export function useCreatePage(): UseCreatePageReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = () => setError('');

  const createPageMutation = async (data: CreatePageFormData) => {
    setIsLoading(true);
    setError('');

    try {
      console.log('Creating page with data:', data);
      const page = await createPage({ name: data.pageName, slug: data.slug });
      console.log('Page created successfully:', page);
      console.log('Redirecting to:', `/page/${page.slug}`);
      router.push(`/page/${page.slug}`);
    } catch (err: unknown) {
      console.error('Error creating page:', err);
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (err: unknown) => {
    console.error(err);

    if (err && typeof err === 'object' && 'response' in err) {
      const error = err as { response?: { data?: { message?: string; statusCode?: number } } };
      const statusCode = error.response?.data?.statusCode;
      const message = error.response?.data?.message;

      if (statusCode === 409 || message?.includes('slug')) {
        setError('Este slug já está em uso. Escolha outro nome para a URL.');
      } else if (statusCode === 400) {
        setError('Dados inválidos. Verifique os campos e tente novamente.');
      } else if (statusCode === 401) {
        setError('Sessão expirada. Redirecionando para login...');
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        setError(message || 'Erro ao criar a página. Tente novamente.');
      }
    } else {
      setError('Erro ao conectar com o servidor. Verifique sua conexão.');
    }
  };

  return {
    createPageMutation,
    isLoading,
    error,
    clearError,
  };
}
