import { updatePage } from '@/services/page';

export type ImageType = 'avatar' | 'banner';

interface UseImageUploadReturn {
  uploadImageToPage: (pageId: string, file: File, type: ImageType) => Promise<boolean>;
}

/**
 * Hook para gerenciar upload de imagens (avatar e banner).
 * Envia o arquivo como FormData para o backend.
 */
export function useImageUpload(): UseImageUploadReturn {
  const uploadImageToPage = async (
    pageId: string,
    file: File,
    type: ImageType
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      await updatePage(pageId, formData);
      return true;
    } catch (err: unknown) {
      console.error('Erro ao fazer upload:', err);
      throw err;
    }
  };

  return {
    uploadImageToPage,
  };
}
