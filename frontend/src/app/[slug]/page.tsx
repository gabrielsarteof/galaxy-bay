'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePageBySlug } from '@/hooks/usePageBySlug';
import { Globe, Twitter, Instagram, MessageCircle } from 'lucide-react';
import Image from 'next/image';

/**
 * Página pública de visualização de perfil do criador.
 * Mostra a página sem opções de edição, como ficará quando publicada.
 */
export default function PublicPageView() {
  const { slug = '' } = useParams() as { slug?: string };
  const router = useRouter();
  const { data: page, isLoading, isError } = usePageBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Carregando página...</p>
        </div>
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
          <p className="text-gray-600 mb-6">
            A página que você está procurando não existe ou foi removida.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Ir para início
          </button>
        </div>
      </div>
    );
  }

  // Se a página não foi publicada, mostra mensagem
  if (page.status !== 'published') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Página em construção</h1>
          <p className="text-gray-600 mb-6">
            Esta página ainda não foi publicada pelo criador.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Ir para início
          </button>
        </div>
      </div>
    );
  }

  const socialLinks = [
    { url: page.websiteUrl, icon: Globe, label: 'Website' },
    { url: page.twitterUrl, icon: Twitter, label: 'Twitter' },
    { url: page.instagramUrl, icon: Instagram, label: 'Instagram' },
    { url: page.discordUrl, icon: MessageCircle, label: 'Discord' },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        {page.bannerUrl && (
          <Image
            src={page.bannerUrl}
            alt="Banner"
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 pb-8">
          {/* Avatar */}
          <div className="flex items-end gap-6">
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                {page.avatarUrl ? (
                  <Image
                    src={page.avatarUrl}
                    alt={page.name}
                    width={160}
                    height={160}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                    {page.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Name and tagline */}
            <div className="flex-1 pb-4">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{page.name}</h1>
              {page.tagline && (
                <p className="text-xl text-gray-600">{page.tagline}</p>
              )}
              {page.category && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {page.category}
                </span>
              )}
            </div>
          </div>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex gap-3 mt-6">
              {socialLinks.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                    aria-label={link.label}
                  >
                    <Icon className="w-5 h-5 text-gray-700" />
                  </a>
                );
              })}
            </div>
          )}

          {/* Description */}
          {page.description && (
            <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Sobre</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {page.description}
              </p>
            </div>
          )}

          {/* Benefits */}
          {page.benefitsText && (
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Benefícios da Comunidade
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {page.benefitsText}
              </p>
            </div>
          )}

          {/* Tags */}
          {page.tags && page.tags.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {page.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Placeholder for NFTs section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">NFTs</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">
                Nenhum NFT disponível no momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
