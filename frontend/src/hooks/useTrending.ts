import { useQuery } from '@tanstack/react-query';
import { getTrendingPages } from '@/services/page';

export function useTrending(limit: number = 5) {
  return useQuery({
    queryKey: ['pages', 'trending', limit],
    queryFn: () => getTrendingPages(limit),
    staleTime: 1000 * 60 * 5,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
}
