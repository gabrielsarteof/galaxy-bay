'use client';

import React from 'react';
import { usePageCommunity } from '@/hooks/usePageCommunity';
import type { components } from '@/types/api-schema';
import type { CommunityStatsEntity } from '@/domain/entities';

type PageResponseDto = components['schemas']['PageResponseDto'];

interface CommunityTabProps {
  page: PageResponseDto;
}

/**
 * Aba de comunidade mostrando holders e estatísticas
 */
const CommunityTab: React.FC<CommunityTabProps> = ({ page }) => {
  const { data: community, isLoading } = usePageCommunity(page.slug);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const communityStats = community as CommunityStatsEntity | undefined;

  // Type assertion para acessar campos extras não definidos no schema gerado
  const pageWithBenefits = page as PageResponseDto & {
    benefitsText?: string;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Comunidade</h2>

      {/* Estatísticas da comunidade */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Visão Geral</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Holders"
            value={communityStats?.totalHolders || 0}
            icon="👥"
          />
          <StatCard
            label="NFTs em Posse"
            value={communityStats?.totalNftsOwned || 0}
            icon="🎨"
          />
          <StatCard
            label="Seguidores"
            value="Em breve"
            icon="⭐"
            isComingSoon
          />
        </div>
      </section>

      {/* Top Holders */}
      {communityStats?.topHolders && communityStats.topHolders.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Colecionadores</h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endereço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NFTs Possuídas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Gasto
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {communityStats.topHolders.map((holder, index) => (
                  <tr key={holder.address} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index === 0 && <span className="text-xl mr-2">🥇</span>}
                        {index === 1 && <span className="text-xl mr-2">🥈</span>}
                        {index === 2 && <span className="text-xl mr-2">🥉</span>}
                        <span className="text-sm font-medium text-gray-900">
                          #{index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mr-3" />
                        <div className="text-sm font-mono text-gray-900">
                          {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-semibold">
                        {holder.nftsOwned}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-blue-600 font-semibold">
                        {holder.totalSpent || '0'} ETH
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Benefícios para holders */}
      {pageWithBenefits.benefitsText && (
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefícios para Holders</h3>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{pageWithBenefits.benefitsText}</p>
            </div>
          </div>
        </section>
      )}

      {/* Estado vazio */}
      {(!communityStats?.topHolders || communityStats.topHolders.length === 0) && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Comunidade em crescimento</h3>
          <p className="text-gray-500">Seja o primeiro a colecionar NFTs deste criador!</p>
        </div>
      )}
    </div>
  );
};

/**
 * Card de estatística da comunidade
 */
const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: string;
  isComingSoon?: boolean;
}> = ({ label, value, icon, isComingSoon = false }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <span className="text-3xl">{icon}</span>
      {isComingSoon && (
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
          Em breve
        </span>
      )}
    </div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className={`text-2xl font-bold ${isComingSoon ? 'text-gray-400' : 'text-gray-900'}`}>
      {value}
    </p>
  </div>
);

export default CommunityTab;
