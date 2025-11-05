'use client';

import React from 'react';
import { usePageCollections } from '@/hooks/usePageCollections';
import type { components } from '@/types/api-schema';
import type { CollectionEntity, CollectionStats } from '@/domain/entities';

type PageResponseDto = components['schemas']['PageResponseDto'];

interface CollectionsTabProps {
  page: PageResponseDto;
}

/**
 * Aba de coleções mostrando todas as coleções do criador
 */
const CollectionsTab: React.FC<CollectionsTabProps> = ({ page }) => {
  const { data: collections, isLoading } = usePageCollections(page.id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const collectionList = (collections as CollectionEntity[] | undefined) || [];

  if (collectionList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma coleção encontrada</h3>
        <p className="text-gray-500">Este criador ainda não criou nenhuma coleção.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Coleções</h2>

      <div className="space-y-6">
        {collectionList.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
};

/**
 * Card de coleção individual com preview de NFTs
 */
interface CollectionCardProps {
  collection: CollectionEntity;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  const previewNFTs = collection.nfts?.slice(0, 4) || [];
  const totalNFTs = collection.nfts?.length || 0;

  const calculateStats = (): CollectionStats => {
    if (!collection.nfts || collection.nfts.length === 0) {
      return { floorPrice: null, totalVolume: 0, totalNfts: 0 };
    }

    const listedNFTs = collection.nfts.filter((nft) => nft.status === 'listed' && nft.price);
    const floorPrice = listedNFTs.length > 0
      ? Math.min(...listedNFTs.map((nft) => Number(nft.price)))
      : null;

    const soldNFTs = collection.nfts.filter((nft) => nft.status === 'sold');
    const totalVolume = soldNFTs.reduce((sum, nft) => {
      return sum + (Number(nft.price) || 0);
    }, 0);

    return { floorPrice, totalVolume, totalNfts: collection.nfts.length };
  };

  const { floorPrice, totalVolume } = calculateStats();

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Banner da coleção */}
      {collection.bannerUrl ? (
        <div className="h-40 bg-gray-100 relative">
          <img
            src={collection.bannerUrl}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className="h-40"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        />
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{collection.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{totalNFTs} NFT{totalNFTs !== 1 ? 's' : ''}</span>
              {floorPrice && (
                <span>Floor: <span className="font-semibold">{floorPrice.toFixed(2)} ETH</span></span>
              )}
              {totalVolume > 0 && (
                <span>Volume: <span className="font-semibold">{totalVolume.toFixed(2)} ETH</span></span>
              )}
            </div>
          </div>
        </div>

        {/* Preview de NFTs */}
        {previewNFTs.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-4 gap-2">
              {previewNFTs.map((nft, index) => (
                <div
                  key={nft.id || index}
                  className="aspect-square bg-gray-100 rounded overflow-hidden"
                >
                  {nft.imageUrl ? (
                    <img
                      src={nft.imageUrl}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Descrição */}
        {collection.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {collection.description}
          </p>
        )}

        {/* Botão ver coleção */}
        <button
          onClick={() => {
            const params = new URLSearchParams(window.location.search);
            params.set('tab', 'nfts');
            params.set('collection', collection.id);
            window.location.href = `${window.location.pathname}?${params.toString()}`;
          }}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          Ver coleção completa
        </button>
      </div>
    </div>
  );
};

export default CollectionsTab;
