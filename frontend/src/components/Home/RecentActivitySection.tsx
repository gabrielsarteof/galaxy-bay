'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { getPageAvatarUrl } from '@/utils/imageUrls';

interface Activity {
  id: string;
  type: 'mint' | 'list' | 'sale' | 'transfer' | 'offer' | 'cancel';
  timestamp: string;
  price?: number;
  fromAddress?: string;
  toAddress?: string;
  transactionHash?: string;
  nft: {
    id: string;
    tokenId: string;
    name: string;
    imageUrl: string;
    page: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

const ACTIVITY_LABELS: Record<Activity['type'], { label: string; color: string }> = {
  mint: { label: 'Criado', color: 'bg-blue-500' },
  list: { label: 'Listado', color: 'bg-green-500' },
  sale: { label: 'Vendido', color: 'bg-purple-500' },
  transfer: { label: 'Transferido', color: 'bg-orange-500' },
  offer: { label: 'Oferta', color: 'bg-yellow-500' },
  cancel: { label: 'Cancelado', color: 'bg-red-500' },
};

function ActivityItem({ activity }: { activity: Activity }) {
  const [imageError, setImageError] = useState(false);
  const activityInfo = ACTIVITY_LABELS[activity.type];
  const timeAgo = getTimeAgo(activity.timestamp);
  const pageAvatarUrl = getPageAvatarUrl(activity.nft.page.id);

  return (
    <div className="flex gap-4 p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all group">
      <Link href={`/${activity.nft.page.slug}`} className="flex-shrink-0">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ring-2 ring-white shadow-md group-hover:ring-blue-400 group-hover:shadow-lg transition-all">
          {imageError ? (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-xl font-bold drop-shadow">
                {activity.nft.page.name.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <img
              src={pageAvatarUrl}
              alt={activity.nft.page.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link
              href={`/nft/${activity.nft.id}`}
              className="font-bold text-gray-900 hover:text-blue-600 truncate block transition-colors"
            >
              {activity.nft.name}
            </Link>
            <Link
              href={`/${activity.nft.page.slug}`}
              className="text-sm text-gray-600 hover:text-gray-900 truncate block transition-colors flex items-center gap-1 mt-0.5"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              {activity.nft.page.name}
            </Link>
          </div>
          <span
            className={`${activityInfo.color} text-white text-xs px-3 py-1.5 rounded-full font-bold flex-shrink-0 shadow-md`}
          >
            {activityInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-2 text-sm">
          <span className="text-gray-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {timeAgo}
          </span>
          {activity.price && (
            <>
              <span className="text-gray-300">•</span>
              <span className="font-bold text-blue-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {activity.price} ETH
              </span>
            </>
          )}
        </div>

        {activity.toAddress && (
          <div className="text-xs text-gray-400 mt-2 truncate font-mono bg-gray-50 px-2 py-1 rounded inline-block">
            → {formatAddress(activity.toAddress)}
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = new Date().getTime();
  const time = new Date(timestamp).getTime();
  const diff = Math.floor((now - time) / 1000);

  if (diff < 60) return 'agora mesmo';
  if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
  return new Date(timestamp).toLocaleDateString('pt-BR');
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function RecentActivitySection() {
  const { data: activities = [], isLoading, isError, refetch } = useRecentActivity(10);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-3">Erro ao carregar atividades recentes</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <div className="max-w-sm mx-auto">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma atividade recente
          </h3>
          <p className="text-sm text-gray-500">
            Atividades aparecerão aqui quando NFTs forem criados, listados ou vendidos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="divide-y divide-gray-100">
        {activities.map((activity: Activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}
