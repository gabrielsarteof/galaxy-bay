'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useFeaturedNFTs } from '@/hooks/useFeaturedNFTs';

interface NFT {
  id: string;
  tokenId: string;
  name: string;
  imageUrl: string;
  price?: number;
  status: string;
  listedAt?: string;
  page?: {
    id: string;
    name: string;
    slug: string;
  };
  owner?: {
    id: string;
    username: string;
    address: string;
  };
  collection?: {
    id: string;
    name: string;
    slug: string;
  };
}

function NFTCard({ nft }: { nft: NFT }) {
  const [imageError, setImageError] = useState(false);

  const calculatePriceChange = () => {
    return Math.random() * 40 - 5;
  };

  const priceChange = calculatePriceChange();
  const priceChangeColor = priceChange >= 0 ? 'text-green-400' : 'text-red-400';
  const priceChangeSign = priceChange >= 0 ? '+' : '';

  return (
    <Link
      href={`/nft/${nft.id}`}
      className="group relative flex-shrink-0 w-[320px] h-[200px] rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300"
    >
      <div className="absolute inset-0">
        {imageError ? (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
            <span className="text-white text-6xl font-bold drop-shadow-2xl">
              {nft.name.charAt(0).toUpperCase()}
            </span>
          </div>
        ) : (
          <img
            src={nft.imageUrl}
            alt={nft.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-end gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-gray-900/80 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-base">
              {nft.collection?.name?.charAt(0).toUpperCase() || nft.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base truncate">
              {nft.name}
            </h3>
            <p className="text-white/70 text-xs truncate">
              {nft.collection?.name || nft.page?.name || 'NFT'}
            </p>
          </div>

          {nft.price && (
            <div className="text-right flex-shrink-0">
              <p className="text-white/70 text-[10px]">Price</p>
              <p className="text-white font-bold text-base">{nft.price} ETH</p>
              <p className={`text-xs font-semibold ${priceChangeColor}`}>
                {priceChangeSign}{priceChange.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>

      {nft.status === 'listed' && (
        <div className="absolute top-2.5 right-2.5 bg-green-500/90 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
          Listed
        </div>
      )}
    </Link>
  );
}

export default function FeaturedNFTsSection() {
  const { data: nfts = [], isLoading, isError, refetch } = useFeaturedNFTs(8);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newPosition = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[320px] h-[200px] bg-gray-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-3">Erro ao carregar NFTs em destaque</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (nfts.length === 0) {
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum NFT em destaque
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            NFTs à venda aparecerão aqui quando criadores listarem suas obras.
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
    <div className="relative group">
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2"
      >
        {nfts.map((nft: NFT) => (
          <NFTCard key={nft.id} nft={nft} />
        ))}
      </div>

      {nfts.length > 3 && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Próximo"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
