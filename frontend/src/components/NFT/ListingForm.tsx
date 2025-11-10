'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createListingSchema, CreateListingFormData } from '@/schemas/listing.schema';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import FormInput from '@/components/FormInput';
import ErrorMessage from '@/components/ErrorMessage';

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
  const [formError, setFormError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
  });

  const onSubmit = async (data: CreateListingFormData) => {
    setFormError('');

    try {
      await listItem({
        nftId: nft.id,
        tokenId: parseInt(nft.tokenId),
        price: data.price,
      });

      router.push(nft.page ? `/page/${nft.page.slug}` : '/');
    } catch (error: any) {
      setFormError(error?.message || 'Falha ao listar NFT. Tente novamente.');
    }
  };

  const isFormLoading = isListing || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-2xl py-8 space-y-8">
        <div className="space-y-3">
          <h1 className="text-center text-2xl font-bold text-gray-900">
            Colocar NFT à Venda
          </h1>
          <p className="text-center text-gray-600 leading-relaxed">
            Defina um preço e liste seu NFT no marketplace.
          </p>
        </div>

        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-2 text-gray-900">{nft.name}</h3>
          <p className="text-sm text-gray-600">Token ID: {nft.tokenId}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <FormInput
              id="price"
              label="Preço (ETH)"
              type="text"
              placeholder="0.1"
              register={register('price')}
              error={errors.price?.message}
            />
            <p className="text-sm text-gray-500">
              O comprador pagará este valor em ETH
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Processo de Listagem:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Aprovar o marketplace para transferir seu NFT</li>
              <li>Listar o NFT no marketplace</li>
              <li>Aguardar confirmação na blockchain</li>
            </ol>
          </div>

          {formError && <ErrorMessage message={formError} onDismiss={() => setFormError('')} />}

          <Button
            type="submit"
            loading={isFormLoading}
            disabled={isFormLoading}
            fullWidth
          >
            {isListing ? 'Listando...' : 'Listar NFT'}
          </Button>
        </form>
      </div>
    </div>
  );
}
