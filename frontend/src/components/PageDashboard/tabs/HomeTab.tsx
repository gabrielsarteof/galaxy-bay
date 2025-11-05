'use client';

import React from 'react';
import { usePageStats } from '@/hooks/usePageStats';
import type { components } from '@/types/api-schema';
import type { NftEntity, ActivityEntity, PageStatsEntity } from '@/domain/entities';

type PageResponseDto = components['schemas']['PageResponseDto'];

interface HomeTabProps {
  page: PageResponseDto;
}

/**
 * Aba inicial da página do criador
 * Exibe estatísticas, NFTs destacadas e atividade recente
 */
const HomeTab: React.FC<HomeTabProps> = ({ page }) => {
  const { data: stats, isLoading } = usePageStats(page.slug);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pageStats = stats as PageStatsEntity | undefined;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Estatísticas em destaque */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Estatísticas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="NFTs Criadas"
            value={pageStats?.totalNfts || 0}
          />
          <StatCard
            label="NFTs Vendidas"
            value={pageStats?.totalSold || 0}
          />
          <StatCard
            label="Holders"
            value={pageStats?.totalHolders || 0}
          />
          <StatCard
            label="Volume Total"
            value={`${pageStats?.totalVolume || '0'} ETH`}
          />
        </div>
        {pageStats?.floorPrice && (
          <div className="mt-4 text-sm text-gray-600">
            Floor Price: <span className="font-semibold">{pageStats.floorPrice} ETH</span>
          </div>
        )}
      </section>

      {/* NFTs em destaque */}
      {pageStats?.featuredNfts && pageStats.featuredNfts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">NFTs em Destaque</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {pageStats.featuredNfts.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        </section>
      )}

      {/* Atividade recente - preview */}
      {pageStats?.recentActivities && pageStats.recentActivities.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Atividade Recente</h2>
            <button
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set('tab', 'atividade');
                window.location.href = `${window.location.pathname}?${params.toString()}`;
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Ver todas →
            </button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 divide-y">
            {pageStats.recentActivities.slice(0, 5).map((activity) => (
              <ActivityPreview key={activity.id} activity={activity} />
            ))}
          </div>
        </section>
      )}

      {/* Sobre - preview */}
      {page.description && (
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Sobre</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-700 line-clamp-3">{page.description}</p>
            <button
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set('tab', 'sobre');
                window.location.href = `${window.location.pathname}?${params.toString()}`;
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Saiba mais →
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

/**
 * Card de estatística individual
 */
const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <p className="text-sm text-gray-600 mb-2">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

/**
 * Card de NFT destacada
 */
interface NFTCardProps {
  nft: NftEntity;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
    <div className="aspect-square bg-gray-100 relative">
      {nft.imageUrl ? (
        <img
          src={nft.imageUrl}
          alt={nft.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          Sem imagem
        </div>
      )}
      {nft.status === 'sold' && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          VENDIDA
        </div>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 truncate">{nft.name}</h3>
      {nft.price && nft.status === 'listed' ? (
        <p className="text-sm text-blue-600 font-medium mt-1">{nft.price} ETH</p>
      ) : (
        <p className="text-sm text-gray-500 mt-1">Não listada</p>
      )}
    </div>
  </div>
);

/**
 * Preview de atividade individual
 */
interface ActivityPreviewProps {
  activity: ActivityEntity;
}

const ActivityPreview: React.FC<ActivityPreviewProps> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return '💰';
      case 'mint': return '🎨';
      case 'list': return '📝';
      case 'transfer': return '🔄';
      case 'offer': return '💵';
      case 'cancel': return '❌';
      default: return '•';
    }
  };

  const getActivityText = (activity: ActivityEntity) => {
    switch (activity.type) {
      case 'sale':
        return `"${activity.nft?.name}" vendida por ${activity.price} ETH`;
      case 'mint':
        return `"${activity.nft?.name}" mintada`;
      case 'list':
        return `"${activity.nft?.name}" listada por ${activity.price} ETH`;
      case 'transfer':
        return `"${activity.nft?.name}" transferida`;
      case 'offer':
        return `Oferta de ${activity.price} ETH em "${activity.nft?.name}"`;
      case 'cancel':
        return `Listagem de "${activity.nft?.name}" cancelada`;
      default:
        return 'Atividade';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins}min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    return `há ${diffDays}d`;
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
      <span className="text-2xl">{getActivityIcon(activity.type)}</span>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{getActivityText(activity)}</p>
        {activity.fromAddress && activity.toAddress && (
          <p className="text-xs text-gray-500 mt-1">
            De: {activity.fromAddress.slice(0, 6)}...{activity.fromAddress.slice(-4)} →
            Para: {activity.toAddress.slice(0, 6)}...{activity.toAddress.slice(-4)}
          </p>
        )}
      </div>
      <span className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</span>
    </div>
  );
};

export default HomeTab;
