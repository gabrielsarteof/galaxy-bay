import { useQuery } from '@tanstack/react-query';
import { discoverPages, DiscoverPageParams } from '@/services/page';

export function useDiscover(params: DiscoverPageParams = {}) {
  return useQuery({
    queryKey: ['pages', 'discover', params],
    queryFn: () => discoverPages(params),
    staleTime: 1000 * 60,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
}
