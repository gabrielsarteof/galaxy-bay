'use client';

import { NFTCard } from './NFTCard';

interface NFTGridProps {
  nfts: any[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function NFTGrid({ nfts, isLoading, onRefresh }: NFTGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg animate-pulse">
            <div className="aspect-square bg-gray-300"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!nfts || nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nenhum NFT encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} onSuccess={onRefresh} />
      ))}
    </div>
  );
}
