import type { components } from '@/types/api-schema';

type PageResponseDto = components['schemas']['PageResponseDto'];

export interface PageRequirement {
  id: string;
  label: string;
  description?: string;
  tipText?: string;
  completed: boolean;
  action?: () => void;
}

export interface PageValidationResult {
  requirements: PageRequirement[];
  completedCount: number;
  totalCount: number;
  canPublish: boolean;
}

/**
 * Valida se a página atende todos os requisitos para publicação
 * Seguindo o modelo do Patreon
 */
export function validatePageRequirements(
  page: PageResponseDto | null | undefined
): PageValidationResult {
  if (!page) {
    return {
      requirements: [],
      completedCount: 0,
      totalCount: 3,
      canPublish: false
    };
  }

  const requirements: PageRequirement[] = [
    {
      id: 'name',
      label: 'Definir nome da página',
      completed: !!page.name && page.name.length >= 3
    },
    {
      id: 'tagline',
      label: 'Adicionar uma tagline',
      description: 'Uma frase curta que descreve o que você faz',
      completed: !!page.tagline && page.tagline.length >= 10
    },
    {
      id: 'description',
      label: 'Escrever uma descrição',
      description: 'Conte para as pessoas quem é você e o que compartilhará aqui',
      tipText: 'Dicas para escrever uma boa descrição',
      completed: !!page.description && page.description.length >= 50
    }
  ];

  const completedCount = requirements.filter(req => req.completed).length;
  const canPublish = completedCount === requirements.length;

  return {
    requirements,
    completedCount,
    totalCount: requirements.length,
    canPublish
  };
}

/**
 * Verifica se algum campo obrigatório está vazio
 */
export function hasEmptyRequiredFields(page: PageResponseDto | null | undefined): boolean {
  const validation = validatePageRequirements(page);
  return !validation.canPublish;
}

/**
 * Retorna mensagem de erro se não puder publicar
 */
export function getPublishBlockerMessage(page: PageResponseDto | null | undefined): string | null {
  const validation = validatePageRequirements(page);

  if (validation.canPublish) {
    return null;
  }

  const pending = validation.requirements.filter(req => !req.completed);
  const pendingLabels = pending.map(req => req.label.toLowerCase()).join(', ');

  return `Complete os seguintes requisitos antes de publicar: ${pendingLabels}`;
}
