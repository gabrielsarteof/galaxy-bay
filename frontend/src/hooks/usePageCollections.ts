import { useQuery } from '@tanstack/react-query';
import { getPageCollections } from '@/services/collection';

/**
 * Hook para buscar coleções de uma página
 */
export function usePageCollections(pageId: string) {
  return useQuery({
    queryKey: ['pageCollections', pageId],
    queryFn: () => getPageCollections(pageId),
    enabled: !!pageId,
  });
}
