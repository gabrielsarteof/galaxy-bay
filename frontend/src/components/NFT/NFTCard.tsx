'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMetaMask } from '@/hooks/useMetaMask';
import { useMarketplace } from '@/hooks/useMarketplace';

interface NFTCardProps {
  nft: {
    id: string;
    tokenId: string;
    name: string;
    imageUrl: string;
    price?: number | null;
    status: string;
    owner?: {
      id: string;
      address: string;
      username?: string;
    };
    collection?: {
      id: string;
      name: string;
    };
    page?: {
      slug: string;
    };
  };
  onSuccess?: () => void;
}

export function NFTCard({ nft, onSuccess }: NFTCardProps) {
  const { address } = useMetaMask();
  const { buyItem, isBuying } = useMarketplace();
  const [showBuyModal, setShowBuyModal] = useState(false);

  const isOwner = address?.toLowerCase() === nft.owner?.address?.toLowerCase();
  const canBuy = nft.status === 'listed' && !isOwner && nft.price;

  const handleBuy = async () => {
    if (!nft.price) return;

    try {
      await buyItem({
        nftId: nft.id,
        tokenId: parseInt(nft.tokenId),
        price: nft.price.toString(),
      });

      setShowBuyModal(false);
      onSuccess?.();
      alert('NFT comprado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao comprar NFT:', error);
      alert(error?.message || 'Falha ao comprar NFT');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        <Link href={`/nft/${nft.id}`}>
          <div className="aspect-square relative">
            <Image
              src={nft.imageUrl}
              alt={nft.name}
              fill
              className="object-cover"
            />
            {nft.status === 'listed' && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                À Venda
              </div>
            )}
          </div>
        </Link>

        <div className="p-4">
          <Link href={`/nft/${nft.id}`}>
            <h3 className="font-bold text-lg truncate hover:text-blue-600">{nft.name}</h3>
          </Link>

          {nft.collection && (
            <p className="text-sm text-gray-600">{nft.collection.name}</p>
          )}

          {nft.price && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Preço</p>
              <p className="font-bold text-lg">{nft.price} ETH</p>
            </div>
          )}

          {canBuy && (
            <button
              onClick={() => setShowBuyModal(true)}
              disabled={isBuying}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {isBuying ? 'Comprando...' : 'Comprar Agora'}
            </button>
          )}

          {isOwner && nft.status === 'minted' && (
            <Link
              href={`/list-nft/${nft.id}`}
              className="mt-4 block w-full bg-green-600 text-white py-2 rounded-md text-center hover:bg-green-700 transition-colors font-semibold"
            >
              Colocar à Venda
            </Link>
          )}
        </div>
      </div>

      {showBuyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirmar Compra</h2>
            <p className="mb-2 text-gray-700">NFT: <span className="font-semibold">{nft.name}</span></p>
            <p className="mb-4 text-2xl font-bold text-blue-600">{nft.price} ETH</p>
            <div className="flex gap-2">
              <button
                onClick={handleBuy}
                disabled={isBuying}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isBuying ? 'Processando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setShowBuyModal(false)}
                disabled={isBuying}
                className="flex-1 bg-gray-300 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50 font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
