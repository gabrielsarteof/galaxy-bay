import { useQuery } from '@tanstack/react-query';
import { getRecentActivities } from '@/services/activity';

export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: ['activities', 'recent', limit],
    queryFn: () => getRecentActivities(limit),
    staleTime: 1000 * 60 * 2,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
}
