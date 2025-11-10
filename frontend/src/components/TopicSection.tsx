import TopicCard from './TopicCard';
import { useCategories } from '@/hooks/useCategories';

const TOPIC_COLORS = [
  'bg-red-600',
  'bg-blue-600',
  'bg-orange-500',
  'bg-pink-600',
  'bg-indigo-600',
  'bg-purple-600',
  'bg-green-600',
  'bg-yellow-600',
];

interface TopicSectionProps {
  onCategoryClick: (category: string) => void;
}

export default function TopicSection({ onCategoryClick }: TopicSectionProps) {
  const { data: categories = [], isLoading, isError, refetch } = useCategories();

  if (isLoading) {
    return (
      <div className="flex overflow-x-auto gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-48 h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-3">Erro ao carregar categorias</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const topicsWithColors = categories
    .filter(cat => cat !== 'Tudo')
    .slice(0, 8)
    .map((cat, idx) => ({
      label: cat,
      bgColor: TOPIC_COLORS[idx % TOPIC_COLORS.length],
    }));

  if (topicsWithColors.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <div className="max-w-sm mx-auto">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria disponível</h3>
          <p className="text-sm text-gray-500">
            Categorias aparecerão aqui quando criadores publicarem suas páginas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-2">
      {topicsWithColors.map(t => (
        <TopicCard key={t.label} {...t} onClick={() => onCategoryClick(t.label)} />
      ))}
    </div>
  );
}