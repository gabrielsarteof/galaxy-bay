import { useQuery } from '@tanstack/react-query';
import { getPageCategories } from '@/services/page';

export function useCategories() {
  return useQuery({
    queryKey: ['pages', 'categories'],
    queryFn: getPageCategories,
    staleTime: 1000 * 60 * 30,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    placeholderData: ['Tudo'],
  });
}
