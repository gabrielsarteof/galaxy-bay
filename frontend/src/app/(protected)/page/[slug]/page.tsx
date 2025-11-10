'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { usePageBySlug } from '@/hooks/usePageBySlug';
import { useUpdatePage } from '@/hooks/useUpdatePage';
import { usePageProgress } from '@/hooks/usePageProgress';
import { updatePage } from '@/services/page';
import CreatorLayout from '@/components/layouts/CreatorLayout';
import { PageHeader, HeroSection, PageMetaSection, SecondaryNav } from '@/components/PageDashboard';
import DescriptionModal from '@/components/DescriptionModal';
import ErrorMessage from '@/components/ErrorMessage';

// Importação das tabs
import HomeTab from '@/components/PageDashboard/tabs/HomeTab';
import NFTsTab from '@/components/PageDashboard/tabs/NFTsTab';
import CollectionsTab from '@/components/PageDashboard/tabs/CollectionsTab';
import CommunityTab from '@/components/PageDashboard/tabs/CommunityTab';
import ActivityTab from '@/components/PageDashboard/tabs/ActivityTab';
import AboutTab from '@/components/PageDashboard/tabs/AboutTab';
import SettingsTab from '@/components/PageDashboard/tabs/SettingsTab';

/**
 * Página principal do dashboard do criador.
 * Gerencia o estado completo da página e coordena todas as interações.
 */
export default function PageDashboard() {
  const { slug = '' } = useParams() as { slug?: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: page, isLoading, isError } = usePageBySlug(slug);
  const { updatePageMutation, error, clearError } = useUpdatePage();
  const { canPublish } = usePageProgress(page);

  const [localName, setLocalName] = useState('');
  const [localTagline, setLocalTagline] = useState('');
  const [dirty, setDirty] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const activeTab = searchParams?.get('tab') || 'inicio';

  useEffect(() => {
    if (page) {
      setLocalName(page.name);
      setLocalTagline(page.tagline ?? '');
      setDirty(false);
    }
  }, [page]);

  const isEditing = page?.status !== 'published' && !isPreviewMode;

  useEffect(() => {
    if (!page) return;
    setDirty(
      localName !== page.name ||
      localTagline !== (page.tagline ?? '')
    );
  }, [localName, localTagline, page]);

  const handleSave = async () => {
    if (!page) return;
    const payload: { name?: string; tagline?: string } = {};
    if (localName !== page.name) payload.name = localName;
    if (localTagline !== (page.tagline ?? '')) payload.tagline = localTagline;

    const result = await updatePageMutation(page.id, payload);
    if (result) {
      router.refresh();
    }
  };

  const handleDiscard = () => router.refresh();

  const handlePublish = async () => {
    if (!page) return;

    if (!canPublish) {
      alert('Complete os itens obrigatórios do checklist antes de publicar.');
      return;
    }

    const result = await updatePageMutation(page.id, { status: 'published' });
    if (result) {
      router.refresh();
    }
  };

  const handleTogglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleDescriptionSave = async (description: string) => {
    if (!page) return;

    await updatePageMutation(page.id, { description });
    router.refresh();
  };

  /**
   * Processa upload de imagem (avatar ou banner).
   * Invalida cache do React Query para forçar re-fetch e atualizar checklist.
   */
  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
    if (!page) return;

    try {
      const formData = new FormData();
      formData.append(type, file);

      await updatePage(page.id, formData);

      // Invalida cache do React Query para refletir mudanças
      await queryClient.invalidateQueries({ queryKey: ['page', slug] });
    } catch (err) {
      throw err;
    }
  };

  /**
   * Renderiza a tab ativa com base no parâmetro de query
   * Em modo preview, sempre mostra a tab Home
   */
  const renderTab = () => {
    // Em modo preview, sempre mostra a Home
    if (isPreviewMode) {
      return <HomeTab page={page!} />;
    }

    switch (activeTab) {
      case 'inicio':
        return <HomeTab page={page!} />;
      case 'nfts':
        return <NFTsTab page={page!} />;
      case 'colecoes':
        return <CollectionsTab page={page!} />;
      case 'comunidade':
        return <CommunityTab page={page!} />;
      case 'atividade':
        return <ActivityTab page={page!} />;
      case 'sobre':
        return <AboutTab page={page!} />;
      case 'configuracoes':
        return <SettingsTab page={page!} />;
      default:
        return <HomeTab page={page!} />;
    }
  };

  if (isLoading) {
    return (
      <CreatorLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </CreatorLayout>
    );
  }

  if (isError || !page) {
    return (
      <CreatorLayout>
        <div className="p-6">
          <ErrorMessage
            message="Não foi possível carregar a página. Verifique sua conexão e tente novamente."
            onDismiss={() => router.push('/')}
          />
        </div>
      </CreatorLayout>
    );
  }

  return (
    <CreatorLayout active="/">
      <div className={`overflow-y-auto min-h-screen ${isPreviewMode ? 'bg-white' : 'bg-gray-50'}`}>
        {error && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            <ErrorMessage message={error} onDismiss={clearError} />
          </div>
        )}

        <PageHeader
          page={page}
          isEditing={isEditing}
          isPreviewMode={isPreviewMode}
          dirty={dirty}
          onSave={handleSave}
          onDiscard={handleDiscard}
          onPublish={handlePublish}
          onTogglePreview={handleTogglePreview}
        />
        <HeroSection
          page={page}
          isEditing={isEditing}
          onImageUpload={handleImageUpload}
        />
        <PageMetaSection
          page={page}
          localName={localName}
          setLocalName={setLocalName}
          localTagline={localTagline}
          setLocalTagline={setLocalTagline}
          isEditing={isEditing}
        />
        {!isPreviewMode && <SecondaryNav />}

        {/* Renderização das tabs */}
        <div className="pt-10 pb-30">
          {renderTab()}
        </div>

        {/* Modal de descrição (usado pela AboutTab) - Oculto em modo preview */}
        {!isPreviewMode && (
          <DescriptionModal
            isOpen={isDescriptionModalOpen}
            onClose={() => setIsDescriptionModalOpen(false)}
            onSave={handleDescriptionSave}
            initialValue={page.description ?? ''}
          />
        )}
      </div>
    </CreatorLayout>
  );
}