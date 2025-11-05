'use client';

import React, { useState } from 'react';
import { usePageActivities } from '@/hooks/usePageActivities';
import type { components } from '@/types/api-schema';
import type { ActivityEntity, ActivityConfig } from '@/domain/entities';

type PageResponseDto = components['schemas']['PageResponseDto'];

interface ActivityTabProps {
  page: PageResponseDto;
}

/**
 * Aba de atividades mostrando histórico completo de transações
 */
const ActivityTab: React.FC<ActivityTabProps> = ({ page }) => {
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: activities, isLoading } = usePageActivities(page.id, {
    type: typeFilter !== 'all' ? typeFilter : undefined,
    limit: 50,
  });

  const activityList = (activities as ActivityEntity[] | undefined) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Atividade</h2>

        {/* Filtro de tipo */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filtrar:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">Todas</option>
            <option value="mint">Mints</option>
            <option value="sale">Vendas</option>
            <option value="list">Listagens</option>
            <option value="transfer">Transferências</option>
            <option value="offer">Ofertas</option>
            <option value="cancel">Cancelamentos</option>
          </select>
        </div>
      </div>

      {/* Feed de atividades */}
      {activityList.length === 0 ? (
        <div className="text-center py-20">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma atividade ainda</h3>
          <p className="text-gray-500">As atividades aparecerão aqui quando houver transações.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
          {activityList.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Item individual de atividade
 */
interface ActivityItemProps {
  activity: ActivityEntity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getActivityConfig = (type: string): ActivityConfig => {
    const configs: Record<string, ActivityConfig> = {
      sale: { icon: '💰', color: 'text-green-700', bgColor: 'bg-green-50', label: 'Venda' },
      mint: { icon: '🎨', color: 'text-blue-700', bgColor: 'bg-blue-50', label: 'Mint' },
      list: { icon: '📝', color: 'text-purple-700', bgColor: 'bg-purple-50', label: 'Listagem' },
      transfer: { icon: '🔄', color: 'text-yellow-700', bgColor: 'bg-yellow-50', label: 'Transferência' },
      offer: { icon: '💵', color: 'text-indigo-700', bgColor: 'bg-indigo-50', label: 'Oferta' },
      cancel: { icon: '❌', color: 'text-red-700', bgColor: 'bg-red-50', label: 'Cancelamento' },
    };
    return configs[type] || configs.mint;
  };

  const getActivityDescription = (activity: ActivityEntity) => {
    const nftName = activity.nft?.name || 'NFT';
    switch (activity.type) {
      case 'sale':
        return (
          <span>
            <strong>{nftName}</strong> vendida por{' '}
            <span className="font-semibold text-blue-600">{activity.price} ETH</span>
          </span>
        );
      case 'mint':
        return (
          <span>
            <strong>{nftName}</strong> mintada
          </span>
        );
      case 'list':
        return (
          <span>
            <strong>{nftName}</strong> listada por{' '}
            <span className="font-semibold text-blue-600">{activity.price} ETH</span>
          </span>
        );
      case 'transfer':
        return (
          <span>
            <strong>{nftName}</strong> transferida
          </span>
        );
      case 'offer':
        return (
          <span>
            Oferta de <span className="font-semibold text-blue-600">{activity.price} ETH</span> em{' '}
            <strong>{nftName}</strong>
          </span>
        );
      case 'cancel':
        return (
          <span>
            Listagem de <strong>{nftName}</strong> cancelada
          </span>
        );
      default:
        return <span>Atividade em <strong>{nftName}</strong></span>;
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
    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays < 7) return `há ${diffDays}d`;
    return activityTime.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const formatAddress = (address: string) => {
    if (!address) return '-';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const config = getActivityConfig(activity.type);

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Ícone e tipo */}
        <div className={`flex-shrink-0 w-12 h-12 ${config.bgColor} rounded-full flex items-center justify-center`}>
          <span className="text-2xl">{config.icon}</span>
        </div>

        {/* Thumbnail da NFT */}
        {activity.nft?.imageUrl && (
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={activity.nft.imageUrl}
              alt={activity.nft.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Detalhes */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold uppercase ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</span>
          </div>

          <p className="text-sm text-gray-900 mb-2">{getActivityDescription(activity)}</p>

          {/* Endereços envolvidos */}
          {(activity.fromAddress || activity.toAddress) && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              {activity.fromAddress && (
                <span>
                  De: <span className="font-mono">{formatAddress(activity.fromAddress)}</span>
                </span>
              )}
              {activity.fromAddress && activity.toAddress && <span>→</span>}
              {activity.toAddress && (
                <span>
                  Para: <span className="font-mono">{formatAddress(activity.toAddress)}</span>
                </span>
              )}
            </div>
          )}

          {/* Hash da transação */}
          {activity.transactionHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${activity.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Ver no Etherscan
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTab;
