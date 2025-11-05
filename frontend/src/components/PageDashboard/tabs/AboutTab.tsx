'use client';

import React from 'react';
import { usePageStats } from '@/hooks/usePageStats';
import type { components } from '@/types/api-schema';

type PageResponseDto = components['schemas']['PageResponseDto'];

interface AboutTabProps {
  page: PageResponseDto;
}

/**
 * Aba sobre o criador com descrição completa, links sociais e estatísticas
 */
const AboutTab: React.FC<AboutTabProps> = ({ page }) => {
  const { data: stats } = usePageStats(page.slug);

  // Type assertion para acessar campos extras não definidos no schema gerado
  const pageWithSocial = page as PageResponseDto & {
    twitterUrl?: string;
    instagramUrl?: string;
    websiteUrl?: string;
    discordUrl?: string;
    benefitsText?: string;
  };

  const socialLinks = [
    { type: 'twitter', url: pageWithSocial.twitterUrl, label: 'Twitter', icon: '𝕏' },
    { type: 'instagram', url: pageWithSocial.instagramUrl, label: 'Instagram', icon: '📷' },
    { type: 'website', url: pageWithSocial.websiteUrl, label: 'Website', icon: '🌐' },
    { type: 'discord', url: pageWithSocial.discordUrl, label: 'Discord', icon: '💬' },
  ].filter(link => link.url);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Sobre</h2>

      {/* Descrição completa */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Sobre o Criador</h3>
        {page.description ? (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {page.description}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 italic">
            Este criador ainda não adicionou uma descrição.
          </p>
        )}
      </section>

      {/* Links sociais */}
      {socialLinks.length > 0 && (
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.type}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all group"
              >
                <span className="text-2xl">{link.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{link.label}</p>
                  <p className="text-xs text-gray-500 truncate group-hover:text-blue-600">
                    {link.url}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Estatísticas do criador */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Estatísticas</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <StatItem
            label="Membro desde"
            value={new Date(page.createdAt).toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric',
            })}
          />
          <StatItem
            label="Total de NFTs criadas"
            value={stats?.totalNfts || 0}
          />
          <StatItem
            label="Total de vendas"
            value={stats?.totalSold || 0}
          />
          <StatItem
            label="Volume total"
            value={`${stats?.totalVolume || '0'} ETH`}
          />
          {stats?.floorPrice && (
            <StatItem
              label="Floor price"
              value={`${stats.floorPrice} ETH`}
            />
          )}
          <StatItem
            label="Holders únicos"
            value={stats?.totalHolders || 0}
          />
        </div>
      </section>

      {/* Informações adicionais */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Informações da Página</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Nome:</span>
            <span className="font-medium text-gray-900">{page.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Slug:</span>
            <span className="font-mono text-sm text-blue-600">{page.slug}</span>
          </div>
          {page.tagline && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tagline:</span>
              <span className="font-medium text-gray-900">{page.tagline}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Status:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                page.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {page.status === 'published' ? 'Publicada' : 'Rascunho'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

/**
 * Item de estatística
 */
const StatItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="text-lg font-bold text-gray-900">{value}</p>
  </div>
);

export default AboutTab;
