'use client';

import React, { useState, useEffect } from 'react';
import { useUpdatePage } from '@/hooks/useUpdatePage';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPageNFTs } from '@/services/nfts';
import type { components } from '@/types/api-schema';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import { Globe, Twitter, Instagram, MessageCircle, Save, Star } from 'lucide-react';
import Image from 'next/image';

type PageResponseDto = components['schemas']['PageResponseDto'];

interface SettingsTabProps {
  page: PageResponseDto;
}

/**
 * Categorias disponíveis para páginas (inspirado no OpenSea)
 */
const CATEGORIES = [
  'Arte',
  'Colecionáveis',
  'Música',
  'Fotografia',
  'Esportes',
  'Trading Cards',
  'Utilidade',
  'Mundos Virtuais',
  'Nomes de Domínio',
  'Outros',
];

/**
 * Aba de configurações da página
 * Permite editar links sociais, categoria, benefícios e outras configurações
 */
const SettingsTab: React.FC<SettingsTabProps> = ({ page }) => {
  const router = useRouter();
  const { updatePageMutation, isLoading, error } = useUpdatePage();

  // Type assertion para acessar campos extras
  const pageWithExtras = page as PageResponseDto & {
    twitterUrl?: string;
    instagramUrl?: string;
    websiteUrl?: string;
    discordUrl?: string;
    benefitsText?: string;
    featuredNftIds?: string[];
  };

  // Estados locais
  const [twitterUrl, setTwitterUrl] = useState(pageWithExtras.twitterUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(pageWithExtras.instagramUrl || '');
  const [websiteUrl, setWebsiteUrl] = useState(pageWithExtras.websiteUrl || '');
  const [discordUrl, setDiscordUrl] = useState(pageWithExtras.discordUrl || '');
  const [category, setCategory] = useState(page.category || '');
  const [benefitsText, setBenefitsText] = useState(pageWithExtras.benefitsText || '');
  const [tags, setTags] = useState<string[]>(page.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [featuredNftIds, setFeaturedNftIds] = useState<string[]>(pageWithExtras.featuredNftIds || []);
  const [dirty, setDirty] = useState(false);

  // Busca NFTs da página
  const { data: nfts, isLoading: nftsLoading } = useQuery({
    queryKey: ['page-nfts', page.id],
    queryFn: () => getPageNFTs(page.id, { limit: 100 }),
  });

  // Detecta mudanças
  useEffect(() => {
    const hasChanges =
      twitterUrl !== (pageWithExtras.twitterUrl || '') ||
      instagramUrl !== (pageWithExtras.instagramUrl || '') ||
      websiteUrl !== (pageWithExtras.websiteUrl || '') ||
      discordUrl !== (pageWithExtras.discordUrl || '') ||
      category !== (page.category || '') ||
      benefitsText !== (pageWithExtras.benefitsText || '') ||
      JSON.stringify(tags) !== JSON.stringify(page.tags || []) ||
      JSON.stringify(featuredNftIds) !== JSON.stringify(pageWithExtras.featuredNftIds || []);

    setDirty(hasChanges);
  }, [twitterUrl, instagramUrl, websiteUrl, discordUrl, category, benefitsText, tags, featuredNftIds, page, pageWithExtras]);

  const handleSave = async () => {
    const updates: Record<string, unknown> = {};

    if (twitterUrl !== (pageWithExtras.twitterUrl || '')) {
      updates.twitterUrl = twitterUrl || undefined;
    }
    if (instagramUrl !== (pageWithExtras.instagramUrl || '')) {
      updates.instagramUrl = instagramUrl || undefined;
    }
    if (websiteUrl !== (pageWithExtras.websiteUrl || '')) {
      updates.websiteUrl = websiteUrl || undefined;
    }
    if (discordUrl !== (pageWithExtras.discordUrl || '')) {
      updates.discordUrl = discordUrl || undefined;
    }
    if (category !== (page.category || '')) {
      updates.category = category || undefined;
    }
    if (benefitsText !== (pageWithExtras.benefitsText || '')) {
      updates.benefitsText = benefitsText || undefined;
    }
    if (JSON.stringify(tags) !== JSON.stringify(page.tags || [])) {
      updates.tags = tags;
    }
    if (JSON.stringify(featuredNftIds) !== JSON.stringify(pageWithExtras.featuredNftIds || [])) {
      updates.featuredNftIds = featuredNftIds;
    }

    const result = await updatePageMutation(page.id, updates);
    if (result) {
      router.refresh();
      setDirty(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const toggleFeaturedNft = (nftId: string) => {
    if (featuredNftIds.includes(nftId)) {
      setFeaturedNftIds(featuredNftIds.filter(id => id !== nftId));
    } else if (featuredNftIds.length < 4) {
      setFeaturedNftIds([...featuredNftIds, nftId]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Configurações da Página</h2>
        {dirty && (
          <Button onClick={handleSave} loading={isLoading} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Salvar alterações
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Links Sociais */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Links Sociais</h3>
        <p className="text-sm text-gray-600 mb-6">
          Adicione links para suas redes sociais e website. Eles serão exibidos na sua página pública.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <FormInput
              id="websiteUrl"
              label="Website"
              placeholder="https://seu-site.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <Twitter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <FormInput
              id="twitterUrl"
              label="Twitter"
              placeholder="https://twitter.com/seu-perfil"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <Instagram className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <FormInput
              id="instagramUrl"
              label="Instagram"
              placeholder="https://instagram.com/seu-perfil"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <MessageCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <FormInput
              id="discordUrl"
              label="Discord"
              placeholder="https://discord.gg/seu-servidor"
              value={discordUrl}
              onChange={(e) => setDiscordUrl(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Categoria */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categoria</h3>
        <p className="text-sm text-gray-600 mb-6">
          Escolha uma categoria que melhor descreve o tipo de NFTs que você cria.
        </p>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecione uma categoria</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </section>

      {/* Tags */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
        <p className="text-sm text-gray-600 mb-6">
          Adicione até 10 tags para ajudar as pessoas a encontrar sua página. (Máximo: 20 caracteres por tag)
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Digite uma tag e pressione Enter"
            maxLength={20}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button
            onClick={handleAddTag}
            disabled={!tagInput.trim() || tags.length >= 10}
            type="button"
          >
            Adicionar
          </Button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-blue-600 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {tags.length === 0 && (
          <p className="text-sm text-gray-500 italic">Nenhuma tag adicionada ainda.</p>
        )}
      </section>

      {/* Benefícios da Comunidade */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefícios da Comunidade</h3>
        <p className="text-sm text-gray-600 mb-6">
          Descreva os benefícios que os holders dos seus NFTs terão. Isso pode incluir acesso a eventos exclusivos,
          airdrops, conteúdo premium, etc.
        </p>

        <textarea
          value={benefitsText}
          onChange={(e) => setBenefitsText(e.target.value)}
          placeholder="Ex: Holders ganham acesso antecipado a novos lançamentos, participação em sorteios mensais e entrada em eventos exclusivos da comunidade."
          rows={5}
          maxLength={500}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="mt-2 text-right text-sm text-gray-500">
          {benefitsText.length}/500 caracteres
        </div>
      </section>

      {/* NFTs em Destaque */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <Star className="w-5 h-5 inline mr-2 text-yellow-500" />
          NFTs em Destaque
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Selecione até 4 NFTs para destacar na sua página. Eles aparecerão em destaque na aba Início.
        </p>

        {nftsLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500 mt-2">Carregando NFTs...</p>
          </div>
        ) : !nfts || nfts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Você ainda não criou nenhum NFT.</p>
            <p className="text-sm text-gray-400 mt-1">Crie seus primeiros NFTs para poder destacá-los aqui.</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {nfts.map((nft: { id: string; name: string; imageUrl: string; tokenId: string }) => {
                const isFeatured = featuredNftIds.includes(nft.id);
                const canSelect = featuredNftIds.length < 4 || isFeatured;

                return (
                  <button
                    key={nft.id}
                    onClick={() => canSelect && toggleFeaturedNft(nft.id)}
                    disabled={!canSelect}
                    className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                      isFeatured
                        ? 'border-yellow-500 ring-2 ring-yellow-200'
                        : canSelect
                        ? 'border-gray-200 hover:border-blue-300'
                        : 'border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="aspect-square relative bg-gray-100">
                      <Image
                        src={nft.imageUrl}
                        alt={nft.name}
                        fill
                        className="object-cover"
                      />
                      {isFeatured && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white rounded-full p-1">
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-sm font-medium text-gray-900 truncate">{nft.name}</p>
                      <p className="text-xs text-gray-500">#{nft.tokenId}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              {featuredNftIds.length}/4 NFTs selecionados
            </p>
          </div>
        )}
      </section>

      {/* Botão de salvar no final */}
      {dirty && (
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={isLoading} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Salvar alterações
          </Button>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
