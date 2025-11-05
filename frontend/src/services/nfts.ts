import api from './api';
import type { components } from '@/types/api-schema';

type CreateMetadataDto = components['schemas']['CreateMetadataDto'];
type RegisterNftDto = components['schemas']['RegisterNftDto'];

export async function generateMetadata(
  dto: CreateMetadataDto
): Promise<{ metadataUrl: string }> {
  const { data } = await api.post<{ metadataUrl: string }>('/nfts/generate-metadata', dto);  // Endpoint correto
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
