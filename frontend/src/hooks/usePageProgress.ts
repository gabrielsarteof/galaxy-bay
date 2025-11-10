import { useMemo } from 'react';
import type { components } from '@/types/api-schema';

type PageResponseDto = components['schemas']['PageResponseDto'];

/**
 * Define os critérios de completude para cada item do checklist
 */
export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  tip?: string;
  completed: boolean;
  action?: () => void;
}

/**
 * Hook que calcula o progresso da página baseado nos campos preenchidos.
 * Retorna os itens do checklist e estatísticas de conclusão.
 */
export function usePageProgress(page: PageResponseDto | null | undefined) {
  const checklist = useMemo<ChecklistItem[]>(() => {
    if (!page) return [];

    return [
      {
        id: 'description',
        label: 'Descrever sua coleção',
        description: 'Conte sobre seu trabalho artístico e o que seus colecionadores podem esperar.',
        tip: 'Uma boa descrição ajuda colecionadores a conhecerem você melhor',
        completed: !!page.description && page.description.length >= 20,
      },
      {
        id: 'first-nft',
        label: 'Criar seu primeiro NFT',
        description: 'Mostre seu trabalho! Faça o mint da sua primeira obra de arte como NFT.',
        tip: 'Seu primeiro NFT é especial - escolha sua melhor obra',
        completed: false, // TODO: Implementar quando tiver sistema de NFTs
      },
      {
        id: 'publish',
        label: 'Publicar sua página',
        description: 'Tudo pronto! Publique sua página para que colecionadores possam descobrir seu trabalho.',
        completed: page.status === 'published',
      },
      {
        id: 'share',
        label: 'Compartilhar com seus fãs',
        description: 'Divulgue sua página nas redes sociais e mostre suas criações para o mundo.',
        tip: 'Compartilhe no Twitter, Instagram, Discord - onde sua comunidade está!',
        completed: false, // Pode ser marcado manualmente depois
      },
    ];
  }, [page]);

  const stats = useMemo(() => {
    const completed = checklist.filter((item) => item.completed).length;
    const total = checklist.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      total,
      percentage,
    };
  }, [checklist]);

  const canPublish = useMemo(() => {
    if (!page) return false;
    // Requisitos mínimos para publicar: descrição completa
    return !!page.description && page.description.length >= 20;
  }, [page]);

  return {
    checklist,
    stats,
    canPublish,
  };
}
