import { useQuery } from '@tanstack/react-query';
import { getPageCommunity } from '@/services/page';

/**
 * Hook para buscar estatísticas da comunidade da página
 */
export function usePageCommunity(slug: string) {
  return useQuery({
    queryKey: ['pageCommunity', slug],
    queryFn: () => getPageCommunity(slug),
    enabled: !!slug,
  });
}
