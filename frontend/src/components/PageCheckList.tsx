'use client';

import React, { useState } from 'react';
import {
  MinusIcon,
  UserCircleIcon,
  ChatBubbleOvalLeftIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShareIcon,
  ChevronRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { usePageProgress, ChecklistItem } from '@/hooks/usePageProgress';
import type { components } from '@/types/api-schema';

type PageResponseDto = components['schemas']['PageResponseDto'];

interface PageChecklistProps {
  page: PageResponseDto;
  onDescriptionClick?: () => void;
  onPublishClick?: () => void;
}

/**
 * Mapeia os ícones para cada item do checklist NFT
 */
const ICON_MAP: Record<string, React.ElementType> = {
  profile: UserCircleIcon,
  description: ChatBubbleOvalLeftIcon,
  'first-nft': SparklesIcon,
  publish: RocketLaunchIcon,
  share: ShareIcon,
};

/**
 * Componente de checklist que exibe o progresso de configuração da página.
 * Integra com usePageProgress para calcular status automaticamente.
 */
export default function PageChecklist({ page, onDescriptionClick, onPublishClick }: PageChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { checklist, stats } = usePageProgress(page);

  const handleItemClick = (item: ChecklistItem) => {
    if (item.completed) return;

    if (item.id === 'description' && onDescriptionClick) {
      onDescriptionClick();
    } else if (item.id === 'publish' && onPublishClick) {
      onPublishClick();
    }
    // TODO: Adicionar handlers para 'first-nft' quando sistema estiver pronto
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="max-w-1xl bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:bg-gray-50 transition-colors w-full text-left"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Checklist de configuração
          </h2>
          <p className="text-sm font-medium text-green-600">
            {stats.completed} de {stats.total} concluídos
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className="max-w-1xl bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-start justify-between p-6 border-b border-gray-200">
        <div className="pr-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Configure sua galeria NFT
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Prepare sua página para exibir suas criações e conectar com colecionadores ao redor do mundo.
          </p>
          <p className="text-sm font-medium text-green-600 mt-3">
            {stats.completed} de {stats.total} concluídos
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
          aria-label="Minimizar checklist"
        >
          <MinusIcon className="w-5 h-5" />
        </button>
      </div>

      <ul>
        {checklist.map((item, index) => {
          const Icon = ICON_MAP[item.id] || UserCircleIcon;
          const isClickable = !item.completed && (item.id === 'description' || item.id === 'publish');
          const isLast = index === checklist.length - 1;

          return (
            <li
              key={item.id}
              className={`flex items-start p-6 ${!isLast ? 'border-b border-gray-100' : ''} ${
                isClickable ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''
              }`}
              onClick={() => handleItemClick(item)}
            >
              <Icon className="w-6 h-6 text-gray-500 mt-1 flex-shrink-0" />
              <div className="ml-4 flex-1">
                <p className="font-medium text-gray-900">{item.label}</p>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                )}
                {item.tip && (
                  <p className="text-xs text-gray-400 italic mt-1">{item.tip}</p>
                )}
              </div>
              {item.completed ? (
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : isClickable ? (
                <ChevronRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 flex-shrink-0" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
