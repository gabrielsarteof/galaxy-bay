// frontend/src/hooks/usePage.ts
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { getMyPage } from '@/services/page';
import type { components } from '@/types/api-schema';

type PageResponseDto = components['schemas']['PageResponseDto'];

export function useMyPage(): UseQueryResult<PageResponseDto | null> {
  return useQuery<PageResponseDto | null>({
    queryKey: ['myPage'],
    queryFn: getMyPage,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  } as UseQueryOptions<PageResponseDto | null>);
}
