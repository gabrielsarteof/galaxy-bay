import { useQuery } from '@tanstack/react-query';
import { getTrendingCollections } from '@/services/collection';

export function useTrendingCollections() {
  return useQuery({
    queryKey: ['collections', 'trending'],
    queryFn: getTrendingCollections,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 3,
  });
}
