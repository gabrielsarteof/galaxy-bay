'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getNFTById } from '@/services/nfts';
import { ListingForm } from '@/components/NFT/ListingForm';

export default function ListNFTPage() {
  const params = useParams();
  const nftId = params.id as string;

  const { data: nft, isLoading } = useQuery({
    queryKey: ['nft', nftId],
    queryFn: () => getNFTById(nftId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">NFT não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ListingForm nft={nft} />
    </div>
  );
}
