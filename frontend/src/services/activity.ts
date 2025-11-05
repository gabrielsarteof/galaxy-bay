import api from './api';

/**
 * Busca atividades de uma página com filtros opcionais
 */
export async function getPageActivities(pageId: string, filters?: {
  type?: string;
  nftId?: string;
  limit?: number;
  offset?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.nftId) params.append('nftId', filters.nftId);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());

  const { data } = await api.get(`/activities/page/${pageId}?${params.toString()}`);
  return data;
}

/**
 * Busca atividades de uma NFT específica
 */
export async function getNFTActivities(nftId: string) {
  const { data } = await api.get(`/activities/nft/${nftId}`);
  return data;
}

/**
 * Cria uma nova atividade (normalmente chamado pelo backend após eventos blockchain)
 */
export async function createActivity(payload: {
  nftId: string;
  pageId: string;
  type: string;
  fromAddress?: string;
  toAddress?: string;
  price?: number;
  transactionHash?: string;
  blockNumber?: number;
}) {
  const { data } = await api.post('/activities', payload);
  return data;
}
