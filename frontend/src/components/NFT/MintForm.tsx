'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMint } from '@/hooks/useMint';
import { useRouter } from 'next/navigation';
import { useMyPage } from '@/hooks/useMyPage';
import Image from 'next/image';

const mintSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().max(500).optional(),
  image: z.string().min(1, 'Imagem é obrigatória'),
  collectionId: z.string().min(1, 'Coleção é obrigatória'),
});

type MintFormData = z.infer<typeof mintSchema>;

export function MintForm() {
  const router = useRouter();
  const { data: myPage } = useMyPage();
  const { mint, isLoading, status } = useMint();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MintFormData>({
    resolver: zodResolver(mintSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreviewImage(base64);
      setValue('image', base64);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: MintFormData) => {
    if (!myPage?.id) {
      alert('Você precisa ter uma página criada primeiro');
      return;
    }

    try {
      const result = await mint({
        ...data,
        pageId: myPage.id,
      });
      alert(`NFT mintado com sucesso! Token ID: ${result.tokenId}`);
      router.push(`/page/${myPage.slug}`);
    } catch (error: any) {
      console.error('Erro ao mintar:', error);
      alert(error?.message || 'Falha ao mintar NFT');
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return 'Enviando para IPFS...';
      case 'minting':
        return 'Mintando na blockchain...';
      case 'registering':
        return 'Registrando no banco de dados...';
      default:
        return '';
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Mintar Novo NFT</h1>

      <div className="mb-6">
        <label className="block mb-2 font-semibold text-gray-700">Imagem</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {errors.image && (
          <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
        )}
        {previewImage && (
          <div className="mt-4 relative w-full max-w-xs">
            <Image
              src={previewImage}
              alt="Preview"
              width={400}
              height={400}
              className="rounded-lg object-cover"
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold text-gray-700">Nome</label>
        <input
          {...register('name')}
          type="text"
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Meu NFT Incrível"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold text-gray-700">Descrição</label>
        <textarea
          {...register('description')}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="Descreva seu NFT..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-semibold text-gray-700">Coleção</label>
        <select
          {...register('collectionId')}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecione uma coleção</option>
          {myPage?.collections?.map((collection: any) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
        {errors.collectionId && (
          <p className="text-red-500 text-sm mt-1">{errors.collectionId.message}</p>
        )}
      </div>

      {isLoading && (
        <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
          <p className="font-semibold text-blue-800">{getStatusMessage()}</p>
          <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? getStatusMessage() : 'Mintar NFT'}
      </button>
    </form>
  );
}
