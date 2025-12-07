import api from './api';
import type { components } from '@/types/api-schema';

type CreateMetadataDto = components['schemas']['CreateMetadataDto'];
type RegisterNftDto = components['schemas']['RegisterNftDto'];

interface PrepareNFTParams {
  image: File;
  name: string;
  description: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

interface PrepareNFTResult {
  imageCID: string;
  metadataCID: string;
  tokenURI: string;
  imageUrl: string;
  metadataUrl: string;
}

/**
 * Upload completo de NFT para IPFS via Pinata
 * Novo endpoint que faz upload de imagem + metadata
 */
export async function prepareMintNFT(
  params: PrepareNFTParams
): Promise<PrepareNFTResult> {
  const formData = new FormData();
  formData.append('image', params.image);
  formData.append('name', params.name);
  formData.append('description', params.description || '');

  if (params.attributes && params.attributes.length > 0) {
    formData.append('attributes', JSON.stringify(params.attributes));
  }

  const { data } = await api.post<{ success: boolean; data: PrepareNFTResult; message: string }>(
    '/nfts/prepare-mint',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000, // 10 minutos
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`[prepareMintNFT] Upload progress: ${percentCompleted}%`);
        }
      },
    }
  );

  return data.data;
}

/**
 * @deprecated Use prepareMintNFT instead
 * Mantido apenas para compatibilidade
 */
export async function generateMetadata(
  dto: CreateMetadataDto
): Promise<{ metadataUrl: string }> {
  const { data } = await api.post<{ metadataUrl: string }>('/nfts/generate-metadata', dto);
  return data;
}

export async function registerNft(
  dto: RegisterNftDto
): Promise<unknown> {
  const { data } = await api.post<unknown>('/nfts/register', dto);  // Endpoint correto
  return data;
}

/**
 * Busca NFTs de uma página com filtros opcionais
 */
export async function getPageNFTs(pageId: string, filters?: {
  status?: string;
  collectionId?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.collectionId) params.append('collectionId', filters.collectionId);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());

  const { data } = await api.get(`/nfts/page/${pageId}?${params.toString()}`);
  return data;
}

/**
 * Busca detalhes de uma NFT específica
 */
export async function getNFTById(id: string) {
  const { data } = await api.get(`/nfts/${id}`);
  return data;
}

/**
 * Atualiza informações de uma NFT (preço, status)
 */
export async function updateNFT(id: string, payload: {
  price?: number;
  status?: string;
}) {
  const { data } = await api.put(`/nfts/${id}`, payload);
  return data;
}

/**
 * Busca NFTs em destaque
 */
export async function getFeaturedNFTs(limit: number = 8) {
  const { data } = await api.get(`/nfts/featured`, { params: { limit } });
  return data;
}
