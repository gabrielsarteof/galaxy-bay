import { useState, createContext, useContext } from 'react';
import { useTrending } from '@/hooks/useTrending';
import { getPageAvatarUrl } from '@/utils/imageUrls';

interface TrendingContextType {
  currentPage: number;
  totalPages: number;
  goToNext: () => void;
  goToPrevious: () => void;
}

const TrendingContext = createContext<TrendingContextType | null>(null);

interface TrendingItemProps {
  page: {
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    category: string | null;
  };
}

function TrendingItem({ page }: TrendingItemProps) {
  const [imageError, setImageError] = useState(false);
  const avatarUrl = getPageAvatarUrl(page.id);

  return (
    <a
      href={`/${page.slug}`}
      className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all">
        {imageError ? (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-base font-bold drop-shadow">
              {page.name.charAt(0).toUpperCase()}
            </span>
          </div>
        ) : (
          <img
            src={avatarUrl}
            alt={page.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {page.name}
        </h3>
        <p className="text-xs text-gray-600 truncate">
          {page.tagline || page.category || 'Criador NFT'}
        </p>
      </div>
    </a>
  );
}

export default function TrendingSection() {
  const { data: pages = [], isLoading, isError, refetch } = useTrending(12);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(pages.length / itemsPerPage);

  const currentItems = pages.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const goToNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-2 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-3">Erro ao carregar criadores em destaque</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <div className="max-w-sm mx-auto">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum criador em destaque</h3>
          <p className="text-sm text-gray-500 mb-4">
            Seja o primeiro! Crie sua página e comece a vender NFTs.
          </p>
          <a
            href="/create-page"
            className="inline-block px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
          >
            Criar minha página
          </a>
        </div>
      </div>
    );
  }

  return (
    <TrendingContext.Provider value={{ currentPage, totalPages, goToNext, goToPrevious }}>
      <div className="grid grid-cols-2 gap-1 bg-white rounded-lg">
        {currentItems.map(page => (
          <TrendingItem key={page.id} page={page} />
        ))}
      </div>
    </TrendingContext.Provider>
  );
}

export function TrendingNavigation() {
  const context = useContext(TrendingContext);

  if (!context || context.totalPages <= 1) {
    return null;
  }

  const { currentPage, totalPages, goToNext, goToPrevious } = context;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={goToPrevious}
        disabled={currentPage === 0}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="Página anterior"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        disabled={currentPage >= totalPages - 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="Próxima página"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
