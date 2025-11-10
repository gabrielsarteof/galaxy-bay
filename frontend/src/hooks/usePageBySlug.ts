import { useQuery } from '@tanstack/react-query';
import { getPageBySlug } from '@/services/page';
import type { components } from '@/types/api-schema';

type PageResponseDto = components['schemas']['PageResponseDto'];

export function usePageBySlug(slug: string) {
  return useQuery<PageResponseDto, Error>({
    queryKey: ['page', slug],
    queryFn: () => getPageBySlug(slug),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnMount: true,
  });
}