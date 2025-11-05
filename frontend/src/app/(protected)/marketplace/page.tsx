'use client';

import { useState } from 'react';
import { useMarketplace } from '@/hooks/useMarketplace';
import { NFTGrid } from '@/components/NFT/NFTGrid';
import { MarketplaceFilters } from '@/components/Marketplace/MarketplaceFilters';

export default function MarketplacePage() {
  const [filters, setFilters] = useState({
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    sortBy: 'recent' as string,
    limit: 20,
    offset: 0,
  });

  const { useListings } = useMarketplace();
  const { data, isLoading, refetch } = useListings(filters);

  const nfts = data?.nfts || [];
  const total = data?.total || 0;

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters, offset: 0 });
  };

  const handleLoadMore = () => {
    setFilters({ ...filters, offset: filters.offset + filters.limit });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
          <p className="text-gray-600">Explore e compre NFTs de criadores incríveis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <MarketplaceFilters
              filters={filters}
              onChange={handleFilterChange}
            />
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {total} {total === 1 ? 'NFT' : 'NFTs'} disponíveis
              </p>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Mais recentes</option>
                <option value="oldest">Mais antigas</option>
                <option value="price_low">Menor preço</option>
                <option value="price_high">Maior preço</option>
              </select>
            </div>

            <NFTGrid nfts={nfts} isLoading={isLoading} onRefresh={refetch} />

            {!isLoading && nfts.length < total && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Carregar mais
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
