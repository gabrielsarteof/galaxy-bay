import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [search, setSearch] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(search);
  };

  return (
    <header className="flex items-center justify-center px-6 py-4 bg-surface transition-all">
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
        <input
          type="text"
          placeholder="Buscar criadores ou coleções"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-full bg-input border border-input text-input placeholder-input focus:outline-none focus:ring-2 focus:ring-brand transition-theme"
        />
      </form>
    </header>
  );
}
