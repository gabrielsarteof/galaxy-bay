import api from './api';

/**
 * Busca todas as coleções de uma página
 */
export async function getPageCollections(pageId: string) {
  const { data } = await api.get(`/collections/page/${pageId}`);
  return data;
}

/**
 * Busca detalhes de uma coleção específica
 */
export async function getCollectionById(id: string) {
  const { data } = await api.get(`/collections/${id}`);
  return data;
}

/**
 * Cria uma nova coleção
 */
export async function createCollection(pageId: string, payload: {
  name: string;
  description?: string;
  bannerUrl?: string;
}) {
  const { data } = await api.post(`/collections/page/${pageId}`, payload);
  return data;
}

/**
 * Atualiza uma coleção existente
 */
export async function updateCollection(id: string, payload: {
  name?: string;
  description?: string;
  bannerUrl?: string;
}) {
  const { data } = await api.put(`/collections/${id}`, payload);
  return data;
}

/**
 * Deleta uma coleção (apenas se não tiver NFTs)
 */
export async function deleteCollection(id: string) {
  const { data } = await api.delete(`/collections/${id}`);
  return data;
}

/**
 * Busca coleções em tendência (maior volume de vendas na última hora)
 */
export async function getTrendingCollections() {
  const { data } = await api.get('/collections/trending');
  return data;
}
