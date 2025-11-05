'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getNFTById } from '@/services/nfts';
import Image from 'next/image';
import Link from 'next/link';
import { useMetaMask } from '@/hooks/useMetaMask';
import { useMarketplace } from '@/hooks/useMarketplace';
import { OffersPanel } from '@/components/Marketplace/OffersPanel';
import { TransactionHistory } from '@/components/TransactionHistory/TransactionHistory';

export default function NFTDetailPage() {
  const params = useParams();
  const nftId = params.id as string;
  const { address } = useMetaMask();
  const { buyItem, isBuying } = useMarketplace();

  const { data: nft, isLoading, refetch } = useQuery({
    queryKey: ['nft', nftId],
    queryFn: () => getNFTById(nftId),
  });

  const handleBuy = async () => {
    if (!nft || !nft.price) return;

    const confirmed = window.confirm(`Comprar ${nft.name} por ${nft.price} ETH?`);
    if (!confirmed) return;

    try {
      await buyItem({
        nftId: nft.id,
        tokenId: parseInt(nft.tokenId),
        price: nft.price.toString(),
      });

      alert('NFT comprado com sucesso!');
      refetch();
    } catch (error: any) {
      console.error('Erro ao comprar NFT:', error);
      alert(error?.message || 'Falha ao comprar NFT');
    }
  };

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

  const isOwner = address?.toLowerCase() === nft.owner?.address?.toLowerCase();
  const canBuy = nft.status === 'listed' && !isOwner && nft.price;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="relative aspect-square">
              <Image
                src={nft.imageUrl}
                alt={nft.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            {nft.collection && (
              <Link
                href={`/page/${nft.page?.slug}`}
                className="text-blue-600 hover:underline text-sm"
              >
                {nft.collection.name}
              </Link>
            )}

            <h1 className="text-4xl font-bold mt-2 mb-4">{nft.name}</h1>

            {nft.owner && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Owner</p>
                <p className="font-mono text-sm">
                  {nft.owner.username || `${nft.owner.address.slice(0, 6)}...${nft.owner.address.slice(-4)}`}
                </p>
              </div>
            )}

            {nft.description && (
              <div className="mb-6">
                <p className="text-gray-700">{nft.description}</p>
              </div>
            )}

            {nft.price && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Preço Atual</p>
                <p className="text-3xl font-bold">{nft.price} ETH</p>
              </div>
            )}

            <div className="space-y-3">
              {canBuy && (
                <button
                  onClick={handleBuy}
                  disabled={isBuying}
                  className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBuying ? 'Comprando...' : 'Comprar Agora'}
                </button>
              )}

              {isOwner && nft.status === 'minted' && (
                <Link
                  href={`/list-nft/${nft.id}`}
                  className="block w-full bg-green-600 text-white py-3 rounded-md text-center font-semibold hover:bg-green-700"
                >
                  Colocar à Venda
                </Link>
              )}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-2">Detalhes</h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">Token ID: <span className="text-gray-900">{nft.tokenId}</span></p>
                <p className="text-gray-600">Status: <span className="text-gray-900">{nft.status}</span></p>
                {nft.blockchainData && (
                  <p className="text-gray-600">
                    Tx:{' '}
                    <a
                      href={`https://sepolia.etherscan.io/tx/${nft.blockchainData.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {nft.blockchainData.transactionHash.slice(0, 10)}...
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <OffersPanel
            nftId={nft.id}
            nftPrice={nft.price ? Number(nft.price) : null}
            ownerId={nft.owner?.id}
          />

          <div className="flex justify-center items-start">
            <TransactionHistory nftId={nft.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
