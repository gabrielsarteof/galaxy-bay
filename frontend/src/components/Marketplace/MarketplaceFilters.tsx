'use client';

import { useState } from 'react';

interface MarketplaceFiltersProps {
  filters: {
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  };
  onChange: (filters: any) => void;
}

export function MarketplaceFilters({ filters, onChange }: MarketplaceFiltersProps) {
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() || '');

  const handleApplyPriceFilter = () => {
    onChange({
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  };

  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    onChange({
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Filtros</h3>
      </div>

      <div>
        <h4 className="font-medium mb-3">Preço (ETH)</h4>
        <div className="space-y-2">
          <input
            type="number"
            step="0.001"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            step="0.001"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleApplyPriceFilter}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Aplicar
          </button>
        </div>
      </div>

      <div className="pt-4 border-t">
        <button
          onClick={handleClearFilters}
          className="w-full text-gray-600 hover:text-gray-800 font-medium"
        >
          Limpar filtros
        </button>
      </div>

      <div className="pt-4 border-t">
        <h4 className="font-medium mb-3">Status</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked
              disabled
              className="mr-2 rounded"
            />
            <span className="text-sm">À venda</span>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t text-xs text-gray-500">
        <p>Mostrando apenas NFTs listados para venda</p>
      </div>
    </div>
  );
}
