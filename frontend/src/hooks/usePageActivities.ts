import { useQuery } from '@tanstack/react-query';
import { getPageActivities } from '@/services/activity';

/**
 * Hook para buscar atividades de uma página com filtros
 */
export function usePageActivities(pageId: string, filters?: {
  type?: string;
  nftId?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['pageActivities', pageId, filters],
    queryFn: () => getPageActivities(pageId, filters),
    enabled: !!pageId,
  });
}
