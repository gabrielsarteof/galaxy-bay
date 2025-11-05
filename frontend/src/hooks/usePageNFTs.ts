import { useQuery } from '@tanstack/react-query';
import { getPageNFTs } from '@/services/nfts';

/**
 * Hook para buscar NFTs de uma página com filtros
 */
export function usePageNFTs(pageId: string, filters?: {
  status?: string;
  collectionId?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['pageNFTs', pageId, filters],
    queryFn: () => getPageNFTs(pageId, filters),
    enabled: !!pageId,
  });
}
