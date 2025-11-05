// frontend/src/hooks/usePageMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePage } from '@/services/page';
import type { components } from '@/types/api-schema';

type PageResponseDto = components['schemas']['PageResponseDto'];

export function useUpdatePage() {
  const qc = useQueryClient();
  return useMutation<
    PageResponseDto,
    Error,
    { id: string; payload: Partial<components['schemas']['CreatePageDto']> | FormData }
  >({
    mutationFn: ({ id, payload }) => updatePage(id, payload),
    onSuccess: (_, vars) => {
      // Invalida GET /page/:slug e, se houver, ['myPage']
      qc.invalidateQueries({ queryKey: ['page', vars.id] });
      qc.invalidateQueries({ queryKey: ['myPage'] });
    },
  });
}
