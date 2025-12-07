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
  // Auto-gerar slug a partir do nome
  let slug = payload.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens do início e fim

  // Se o slug ficar vazio, usar um padrão
  if (!slug) {
    slug = 'collection';
  }

  // Adicionar timestamp para garantir unicidade
  slug = `${slug}-${Date.now()}`;

  const { data } = await api.post(`/collections/page/${pageId}`, {
    ...payload,
    slug,
  });
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
