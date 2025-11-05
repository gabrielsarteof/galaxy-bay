import { useState, useCallback } from 'react';

/**
 * Gerencia preview otimista de imagens durante o fluxo de upload.
 * Implementa o padrão Optimistic UI para melhorar UX evitando espera de resposta do servidor.
 */
export function useImageUploadPreview() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const setPreview = useCallback((type: 'avatar' | 'banner', dataUrl: string) => {
    if (type === 'avatar') {
      setAvatarPreview(dataUrl);
    } else {
      setBannerPreview(dataUrl);
    }
  }, []);

  const clearPreview = useCallback((type: 'avatar' | 'banner') => {
    if (type === 'avatar') {
      setAvatarPreview(null);
    } else {
      setBannerPreview(null);
    }
  }, []);

  const clearAllPreviews = useCallback(() => {
    setAvatarPreview(null);
    setBannerPreview(null);
  }, []);

  const setUploading = useCallback((type: 'avatar' | 'banner', isUploading: boolean) => {
    if (type === 'avatar') {
      setIsUploadingAvatar(isUploading);
    } else {
      setIsUploadingBanner(isUploading);
    }
  }, []);

  /**
   * Retorna preview se existir, caso contrário retorna URL original.
   * Permite exibição imediata da imagem cropada antes da confirmação do backend.
   */
  const getDisplayUrl = useCallback((
    type: 'avatar' | 'banner',
    originalUrl: string | null | undefined
  ): string | null | undefined => {
    const preview = type === 'avatar' ? avatarPreview : bannerPreview;
    return preview || originalUrl;
  }, [avatarPreview, bannerPreview]);

  const hasPreview = useCallback((type: 'avatar' | 'banner'): boolean => {
    return type === 'avatar' ? !!avatarPreview : !!bannerPreview;
  }, [avatarPreview, bannerPreview]);

  return {
    avatarPreview,
    bannerPreview,
    isUploadingAvatar,
    isUploadingBanner,
    setPreview,
    clearPreview,
    clearAllPreviews,
    setUploading,
    getDisplayUrl,
    hasPreview
  };
}
