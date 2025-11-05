import { useQuery } from '@tanstack/react-query';
import { getPageStats } from '@/services/page';

/**
 * Hook para buscar estatísticas agregadas da página
 */
export function usePageStats(slug: string) {
  return useQuery({
    queryKey: ['pageStats', slug],
    queryFn: () => getPageStats(slug),
    enabled: !!slug,
  });
}
