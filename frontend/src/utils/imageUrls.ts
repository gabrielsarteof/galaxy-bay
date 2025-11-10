/**
 * Utilitários para construir URLs de imagens de páginas e coleções.
 * As imagens seguem uma estrutura padronizada no storage:
 * - Avatars: storage/avatars/{id}/avatar.png
 * - Banners: storage/banners/{id}/banner.png
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Constrói a URL do avatar de uma página.
 * @param pageId - ID da página
 * @param version - Timestamp para cache busting (opcional)
 * @returns URL completa do avatar
 */
export function getPageAvatarUrl(pageId: string, version?: number): string {
  const url = `${API_URL}/uploads/avatars/${pageId}/avatar.png`;
  return version ? `${url}?v=${version}` : url;
}

/**
 * Constrói a URL do banner de uma página.
 * @param pageId - ID da página
 * @param version - Timestamp para cache busting (opcional)
 * @returns URL completa do banner
 */
export function getPageBannerUrl(pageId: string, version?: number): string {
  const url = `${API_URL}/uploads/banners/${pageId}/banner.png`;
  return version ? `${url}?v=${version}` : url;
}

/**
 * Constrói a URL do banner de uma coleção.
 * @param collectionId - ID da coleção
 * @param version - Timestamp para cache busting (opcional)
 * @returns URL completa do banner
 */
export function getCollectionBannerUrl(collectionId: string, version?: number): string {
  const url = `${API_URL}/uploads/collections/${collectionId}/banner.png`;
  return version ? `${url}?v=${version}` : url;
}

/**
 * Verifica se uma URL de imagem existe fazendo uma requisição HEAD.
 * @param url - URL da imagem
 * @returns Promise que resolve para true se a imagem existe
 */
export async function imageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
