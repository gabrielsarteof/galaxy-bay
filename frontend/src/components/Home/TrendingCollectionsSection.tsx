'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTrendingCollections } from '@/hooks/useTrendingCollections';
import { getCollectionBannerUrl } from '@/utils/imageUrls';

interface Collection {
  id: string;
  name: string;
  slug: string;
  page: {
    id: string;
    name: string;
    slug: string;
  };
  nftCount: number;
  floorPrice: number | null;
  volume: number;
  salesCount: number;
  priceChange: number;
}

function CollectionCard({ collection }: { collection: Collection }) {
  const [imageError, setImageError] = useState(false);
  const bannerUrl = getCollectionBannerUrl(collection.id);

  const priceChangeColor = collection.priceChange >= 0 ? 'text-green-400' : 'text-red-400';
  const priceChangeSign = collection.priceChange >= 0 ? '+' : '';

  return (
    <Link
      href={`/${collection.page.slug}/collection/${collection.slug}`}
      className="group relative flex flex-col bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
    >
      {/* Collection Image */}
      <div className="relative w-full h-32 overflow-hidden rounded-t-xl bg-gradient-to-br from-gray-100 to-gray-200">
        {imageError ? (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
            <span className="text-white text-4xl font-bold drop-shadow-2xl">
              {collection.name.charAt(0).toUpperCase()}
            </span>
          </div>
        ) : (
          <img
            src={bannerUrl}
            alt={collection.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        )}
      </div>

      {/* Collection Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base truncate group-hover:text-blue-600 transition-colors">
              {collection.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              by {collection.page.name}
            </p>
          </div>
          {/* Verified Badge (opcional) */}
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
          {/* Floor Price */}
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Floor</p>
            <p className="font-bold text-gray-900 text-sm">
              {collection.floorPrice !== null ? `${collection.floorPrice.toFixed(4)} ETH` : 'N/A'}
            </p>
          </div>

          {/* Volume */}
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Volume</p>
            <p className="font-bold text-gray-900 text-sm">
              {collection.volume > 0 ? `${collection.volume.toFixed(2)} ETH` : '0 ETH'}
            </p>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Items</p>
            <p className="font-bold text-gray-900 text-sm">
              {collection.nftCount}
            </p>
          </div>

          {/* Price Change */}
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Change</p>
            <p className={`font-bold text-sm ${priceChangeColor}`}>
              {priceChangeSign}{collection.priceChange.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function TrendingCollectionsSection() {
  const { data: collections = [], isLoading, isError, refetch } = useTrendingCollections();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
            <div className="w-full h-32 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 rounded w-12" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 rounded w-12" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 rounded w-12" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 rounded w-12" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-3">Erro ao carregar coleções em tendência</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (collections.length === 0) {
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma coleção em tendência
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Coleções com vendas recentes aparecerão aqui.
          </p>
          <a
            href="/create-page"
            className="inline-block px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
          >
            Criar minha página
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {collections.map((collection: Collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
