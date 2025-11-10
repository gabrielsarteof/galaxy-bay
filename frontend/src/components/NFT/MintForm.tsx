'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createNFTSchema, CreateNFTFormData } from '@/schemas/nft.schema';
import { useMint } from '@/hooks/useMint';
import { useRouter } from 'next/navigation';
import { useMyPage } from '@/hooks/useMyPage';
import Button from '@/components/Button';
import FormInput from '@/components/FormInput';
import ErrorMessage from '@/components/ErrorMessage';
import Image from 'next/image';

export function MintForm() {
  const router = useRouter();
  const { data: myPage } = useMyPage();
  const { mint, isLoading, status } = useMint();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CreateNFTFormData>({
    resolver: zodResolver(createNFTSchema),
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

  const onSubmit = async (data: CreateNFTFormData) => {
    if (!myPage?.id) {
      setFormError('Você precisa ter uma página criada primeiro');
      return;
    }

    setFormError('');

    try {
      const result = await mint({
        ...data,
        pageId: myPage.id,
      });
      router.push(`/page/${myPage.slug}`);
    } catch (error: any) {
      setFormError(error?.message || 'Falha ao mintar NFT. Tente novamente.');
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

  const isFormLoading = isLoading || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-2xl py-8 space-y-8">
        <div className="space-y-3">
          <h1 className="text-center text-2xl font-bold text-gray-900">
            Criar Novo NFT
          </h1>
          <p className="text-center text-gray-600 leading-relaxed">
            Faça upload da sua arte e crie um NFT único na blockchain.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Imagem *
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-gray-900 file:text-white
                hover:file:bg-gray-800 file:cursor-pointer"
            />
            {errors.image && (
              <p className="text-sm text-red-600">{errors.image.message}</p>
            )}
            {previewImage && (
              <div className="mt-4 relative w-full max-w-md mx-auto">
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={400}
                  height={400}
                  className="rounded-lg object-cover border border-gray-200"
                />
              </div>
            )}
          </div>

          <FormInput
            id="name"
            label="Nome"
            placeholder="Meu NFT Incrível"
            register={register('name')}
            error={errors.name?.message}
          />

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={4}
              placeholder="Descreva seu NFT..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="collectionId" className="block text-sm font-medium text-gray-700">
              Coleção *
            </label>
            <select
              id="collectionId"
              {...register('collectionId')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione uma coleção</option>
              {myPage?.collections?.map((collection: any) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
            {errors.collectionId && (
              <p className="text-sm text-red-600">{errors.collectionId.message}</p>
            )}
          </div>

          {isLoading && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-900 text-center">{getStatusMessage()}</p>
              <div className="mt-3 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-pulse w-full"></div>
              </div>
            </div>
          )}

          {formError && <ErrorMessage message={formError} onDismiss={() => setFormError('')} />}

          <Button
            type="submit"
            loading={isFormLoading}
            disabled={isFormLoading}
            fullWidth
          >
            {isLoading ? getStatusMessage() : 'Criar NFT'}
          </Button>
        </form>
      </div>
    </div>
  );
}
