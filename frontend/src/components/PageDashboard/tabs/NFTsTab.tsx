'use client';

import React, { useState } from 'react';
import { usePageNFTs } from '@/hooks/usePageNFTs';
import { usePageCollections } from '@/hooks/usePageCollections';
import type { components } from '@/types/api-schema';
import type { NftEntity, CollectionEntity } from '@/domain/entities';

type PageResponseDto = components['schemas']['PageResponseDto'];

interface NFTsTabProps {
  page: PageResponseDto;
}

/**
 * Aba de NFTs com grid, filtros e ordenação
 */
const NFTsTab: React.FC<NFTsTabProps> = ({ page }) => {
  const [status, setStatus] = useState<string>('all');
  const [collectionId, setCollectionId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: collections } = usePageCollections(page.id);
  const { data: nfts, isLoading } = usePageNFTs(page.id, {
    status: status !== 'all' ? status : undefined,
    collectionId: collectionId !== 'all' ? collectionId : undefined,
    sortBy,
  });

  const nftList = (nfts as NftEntity[] | undefined) || [];
  const collectionList = (collections as CollectionEntity[] | undefined) || [];

  const filteredNfts = nftList.filter((nft) =>
    searchTerm ? nft.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Título e busca */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">NFTs</h2>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar NFTs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas</option>
              <option value="listed">À venda</option>
              <option value="sold">Vendidas</option>
              <option value="minted">Não listadas</option>
            </select>
          </div>

          {/* Coleção */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coleção
            </label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas as coleções</option>
              {collectionList.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigas</option>
              <option value="price_low">Menor preço</option>
              <option value="price_high">Maior preço</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de NFTs */}
      {filteredNfts.length > 0 && (
        <div className="text-center text-sm text-gray-600 mb-4">
          Exibindo {filteredNfts.length} {filteredNfts.length === 1 ? 'NFT' : 'NFTs'}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg animate-pulse">
              <div className="aspect-square bg-gray-300"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : filteredNfts.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <p className="text-gray-500 text-lg">Nenhuma NFT encontrada</p>
          </div>
        ) : (
          filteredNfts.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Card de NFT individual
 */
interface NFTCardProps {
  nft: NftEntity;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => (
  <a href={`/nft/${nft.id}`} className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
    <div className="aspect-square bg-gray-100 relative overflow-hidden">
      {nft.imageUrl ? (
        <img
          src={nft.imageUrl}
          alt={nft.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {nft.status === 'sold' && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
          VENDIDA
        </div>
      )}
      {nft.status === 'listed' && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
          À VENDA
        </div>
      )}
    </div>

    <div className="p-4">
      <h3 className="font-semibold text-gray-900 truncate mb-1">{nft.name}</h3>

      {nft.collection && (
        <p className="text-xs text-gray-500 mb-2 truncate">{nft.collection.name}</p>
      )}

      <div className="flex items-center justify-between">
        {nft.price && nft.status === 'listed' ? (
          <p className="text-sm text-blue-600 font-semibold">{nft.price} ETH</p>
        ) : nft.status === 'sold' ? (
          <p className="text-sm text-gray-500">-</p>
        ) : (
          <p className="text-sm text-gray-500">Não listada</p>
        )}
      </div>
    </div>
  </a>
);

export default NFTsTab;
