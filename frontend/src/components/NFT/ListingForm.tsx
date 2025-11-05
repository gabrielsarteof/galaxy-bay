'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useRouter } from 'next/navigation';

const listingSchema = z.object({
  price: z.string().min(1, 'Preço é obrigatório').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Preço deve ser maior que 0'
  ),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  nft: {
    id: string;
    tokenId: string;
    name: string;
    imageUrl: string;
    page?: {
      slug: string;
    };
  };
}

export function ListingForm({ nft }: ListingFormProps) {
  const router = useRouter();
  const { listItem, isListing } = useMarketplace();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
  });

  const onSubmit = async (data: ListingFormData) => {
    try {
      await listItem({
        nftId: nft.id,
        tokenId: parseInt(nft.tokenId),
        price: data.price,
      });

      alert('NFT listado com sucesso!');
      router.push(nft.page ? `/page/${nft.page.slug}` : '/');
    } catch (error: any) {
      console.error('Erro ao listar NFT:', error);
      alert(error?.message || 'Falha ao listar NFT');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Colocar NFT à Venda</h1>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">{nft.name}</h3>
          <p className="text-sm text-gray-600">Token ID: {nft.tokenId}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              Preço (ETH)
            </label>
            <input
              {...register('price')}
              type="text"
              step="0.001"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.1"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              O comprador pagará este valor em ETH
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">Processo de Listagem:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>Aprovar o marketplace para transferir seu NFT</li>
              <li>Listar o NFT no marketplace</li>
              <li>Aguardar confirmação na blockchain</li>
            </ol>
          </div>

          <button
            type="submit"
            disabled={isListing}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isListing ? 'Listando...' : 'Listar NFT'}
          </button>
        </form>
      </div>
    </div>
  );
}
