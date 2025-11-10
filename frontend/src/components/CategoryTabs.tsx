import { useCategories } from '@/hooks/useCategories';

interface CategoryTabsProps {
  active: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryTabs({ active, onCategoryChange }: CategoryTabsProps) {
  const { data: categories = ['Tudo'], isLoading, isError } = useCategories();

  if (isLoading) {
    return (
      <div className="flex space-x-2 px-6 py-4 overflow-x-auto bg-gray-50 transition-all" role="tablist" aria-label="Categorias">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  if (isError || categories.length === 0) {
    return (
      <div className="flex space-x-2 px-6 py-4 overflow-x-auto bg-gray-50 transition-all" role="tablist" aria-label="Categorias">
        <button
          onClick={() => onCategoryChange('Tudo')}
          className="whitespace-nowrap px-4 py-2 rounded-full font-medium transition bg-black text-white"
          role="tab"
          aria-selected="true"
        >
          Tudo
        </button>
      </div>
    );
  }

  return (
    <nav className="flex space-x-2 px-6 py-4 overflow-x-auto bg-gray-50 transition-all" role="tablist" aria-label="Categorias de NFTs">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          role="tab"
          aria-selected={active === cat}
          aria-label={`Filtrar por ${cat}`}
          className={
            `whitespace-nowrap px-4 py-2 rounded-full font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ` +
            (active === cat
              ? 'bg-black text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
          }
        >
          {cat}
        </button>
      ))}
    </nav>
  );
}