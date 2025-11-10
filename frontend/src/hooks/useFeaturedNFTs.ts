import { useQuery } from '@tanstack/react-query';
import { getFeaturedNFTs } from '@/services/nfts';

export function useFeaturedNFTs(limit: number = 8) {
  return useQuery({
    queryKey: ['nfts', 'featured', limit],
    queryFn: () => getFeaturedNFTs(limit),
    staleTime: 1000 * 60 * 5,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
}
