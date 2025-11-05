'use client';

import React, { useState, useRef, useEffect } from 'react';
import randomColor from 'randomcolor';
import { FileMediaIcon } from '@primer/octicons-react';
import ImageCropModal from '@/components/ImageCropModal';
import { fileToDataUrl, validateImageFile, autoResizeIfNeeded } from '@/utils/imageProcessing';
import { useImageUploadPreview } from '@/hooks/useImageUploadPreview';
import ErrorMessage from '@/components/ErrorMessage';
import type { components } from '@/types/api-schema';

type PageResponseDto = components['schemas']['PageResponseDto'];

interface HeroSectionProps {
  page: PageResponseDto;
  isEditing: boolean;
  onImageUpload?: (file: File, type: 'avatar' | 'banner') => Promise<void>;
}

function getColor(seed: string) {
  return randomColor({ seed, luminosity: 'light' });
}

function getAvatarUrl(seed: string) {
  const bg = getColor(seed).replace('#', '');
  const seedEnc = encodeURIComponent(seed);
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seedEnc}&backgroundColor=${bg}&size=128`;
}

function getBannerStyle(seed: string) {
  const c1 = getColor(seed);
  const c2 = getColor(seed + '_alt');
  return { background: `linear-gradient(to right, ${c1}, ${c2})` as const };
}

/**
 * Renderiza banner e avatar da página com suporte a upload e preview otimista.
 */
const HeroSection: React.FC<HeroSectionProps> = ({ page, isEditing, onImageUpload }) => {
  const [isBannerHover, setIsBannerHover] = useState(false);
  const [isBtnHover, setIsBtnHover] = useState(false);
  const [isAvatarHover, setIsAvatarHover] = useState(false);
  const [isAvatarIconHover, setIsAvatarIconHover] = useState(false);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [cropType, setCropType] = useState<'avatar' | 'banner'>('avatar');
  const [error, setError] = useState('');

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const {
    getDisplayUrl,
    setPreview,
    clearPreview,
    setUploading,
    isUploadingAvatar,
    isUploadingBanner,
    hasPreview
  } = useImageUploadPreview();

  /**
   * Limpa preview quando URL do servidor é atualizada.
   * Detecta mudança em avatarUrl/bannerUrl após router.refresh().
   */
  useEffect(() => {
    console.log('[HeroSection] Avatar URL mudou:', page.avatarUrl);
    console.log('[HeroSection] Tem preview de avatar?', hasPreview('avatar'));
    if (hasPreview('avatar') && page.avatarUrl) {
      console.log('[HeroSection] Limpando preview de avatar');
      clearPreview('avatar');
    }
  }, [page.avatarUrl, hasPreview, clearPreview]);

  useEffect(() => {
    console.log('[HeroSection] Banner URL mudou:', page.bannerUrl);
    console.log('[HeroSection] Tem preview de banner?', hasPreview('banner'));
    if (hasPreview('banner') && page.bannerUrl) {
      console.log('[HeroSection] Limpando preview de banner');
      clearPreview('banner');
    }
  }, [page.bannerUrl, hasPreview, clearPreview]);

  const clearError = () => setError('');

  const handleBannerClick = () => {
    if (isEditing && bannerInputRef.current) {
      bannerInputRef.current.click();
    }
  };

  const handleAvatarClick = () => {
    if (isEditing && avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'avatar' | 'banner'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Arquivo inválido');
      event.target.value = '';
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      const resizedDataUrl = await autoResizeIfNeeded(dataUrl, type);
      setImageToCrop(resizedDataUrl);
      setCropType(type);

      if (!cropModalOpen) {
        setCropModalOpen(true);
      }
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      setError('Erro ao carregar a imagem. Tente novamente.');
    }

    event.target.value = '';
  };

  /**
   * Processa conclusão do crop: exibe preview otimista e inicia upload.
   * Preview é atualizado instantaneamente enquanto upload ocorre em background.
   */
  const handleCropComplete = async (croppedFile: File) => {
    if (!onImageUpload) return;

    setError('');

    try {
      console.log('[HeroSection] Iniciando crop complete para:', cropType);
      const previewDataUrl = await fileToDataUrl(croppedFile);
      console.log('[HeroSection] Preview DataURL gerado:', previewDataUrl.substring(0, 50) + '...');

      setPreview(cropType, previewDataUrl);
      console.log('[HeroSection] Preview setado para:', cropType);

      setUploading(cropType, true);
      await onImageUpload(croppedFile, cropType);
      console.log('[HeroSection] Upload concluído para:', cropType);

      // Preview será limpo automaticamente pelo useEffect quando URL do servidor chegar
    } catch (err) {
      console.error('Erro ao fazer upload:', err);

      let errorMessage = 'Erro ao fazer upload da imagem. Tente novamente.';

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };

        if (axiosError.response?.status === 401) {
          errorMessage = 'Sessão expirada. Você será redirecionado para login.';
        } else if (axiosError.response?.status === 413) {
          errorMessage = 'Imagem muito grande. Tente uma imagem menor.';
        } else if (axiosError.response?.status === 400) {
          errorMessage = axiosError.response.data?.message || 'Arquivo inválido. Verifique o formato da imagem.';
        } else if (axiosError.response?.status && axiosError.response.status >= 500) {
          errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
        }
      }

      setError(errorMessage);
      clearPreview(cropType);
    } finally {
      setUploading(cropType, false);
    }
  };

  /**
   * Abre seletor de arquivo para substituição sem fechar modal.
   * Implementa UX similar ao Instagram/Facebook/Patreon.
   */
  const handleReplace = () => {
    const inputRef = cropType === 'avatar' ? avatarInputRef : bannerInputRef;
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="relative">
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4">
          <ErrorMessage message={error} onDismiss={clearError} />
        </div>
      )}

      <div
        className="w-full"
        onMouseEnter={() => isEditing && setIsBannerHover(true)}
        onMouseLeave={() => { setIsBannerHover(false); setIsBtnHover(false); }}
      >
        {getDisplayUrl('banner', page.bannerUrl) ? (
          <img
            key={getDisplayUrl('banner', page.bannerUrl)!}
            src={getDisplayUrl('banner', page.bannerUrl)!}
            alt={`Banner de ${page.name}`}
            className="w-full h-80 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-80" style={getBannerStyle(page.name)} />
        )}

        {isEditing && isBannerHover && !isUploadingBanner && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="pointer-events-auto"
              onMouseEnter={() => setIsBtnHover(true)}
              onMouseLeave={() => setIsBtnHover(false)}
            >
              <button
                onClick={handleBannerClick}
                className="bg-black/50 text-white text-sm px-5 py-3 rounded-xl inline-flex items-center hover:bg-black/60 transition-colors"
              >
                <FileMediaIcon className="mr-2" size={16} /> Enviar imagem de capa
              </button>
              {isBtnHover && (
                <div className="absolute left-1/2 transform -translate-x-1/2 w-max bg-black/50 text-white text-xs mt-2 px-3 py-2 rounded-lg">
                  Recomendamos que seu banner tenha 2560 × 1440 pixels
                </div>
              )}
            </div>
          </div>
        )}

        {isUploadingBanner && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg px-6 py-4 shadow-xl">
              <p className="text-sm font-medium text-gray-900">Enviando imagem...</p>
            </div>
          </div>
        )}

        <input
          ref={bannerInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFileChange(e, 'banner')}
          className="hidden"
        />
      </div>

      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
        <div
          className="relative w-32 h-32"
          onMouseEnter={() => isEditing && setIsAvatarHover(true)}
          onMouseLeave={() => { setIsAvatarHover(false); setIsAvatarIconHover(false); }}
        >
          {getDisplayUrl('avatar', page.avatarUrl) ? (
            <img
              key={getDisplayUrl('avatar', page.avatarUrl)!}
              src={getDisplayUrl('avatar', page.avatarUrl)!}
              alt={page.name}
              className="w-32 h-32 rounded-3xl border-4 border-white object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <img
              src={getAvatarUrl(page.name)}
              alt={page.name}
              className="w-32 h-32 rounded-3xl border-4 border-white object-cover"
            />
          )}

          {isEditing && isAvatarHover && !isUploadingAvatar && (
            <div className="absolute bottom-0 right-0 pointer-events-none">
              <div
                className="pointer-events-auto bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onMouseEnter={() => setIsAvatarIconHover(true)}
                onMouseLeave={() => setIsAvatarIconHover(false)}
                onClick={handleAvatarClick}
              >
                <FileMediaIcon className="w-5 h-5 text-gray-700" />
              </div>

              {isAvatarIconHover && (
                <div className="absolute left-1/2 transform bottom-full mb-2 -translate-x-1/2 w-max bg-black/50 text-white text-xs px-3 py-2 rounded-lg">
                  Recomendamos que sua imagem tenha 1024 × 1024 pixels
                </div>
              )}
            </div>
          )}

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFileChange(e, 'avatar')}
            className="hidden"
          />
        </div>
      </div>

      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        imageSrc={imageToCrop}
        aspectRatio={cropType === 'avatar' ? 'AVATAR' : 'BANNER'}
        onComplete={handleCropComplete}
        onReplace={handleReplace}
        title={cropType === 'avatar' ? 'Ajustar foto de perfil' : 'Ajustar imagem de capa'}
      />
    </div>
  );
};

export default HeroSection;