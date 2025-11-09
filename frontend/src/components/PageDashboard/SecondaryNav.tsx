'use client';

import React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

const tabs = [
  { id: 'inicio', label: 'Início' },
  { id: 'nfts', label: 'NFTs' },
  { id: 'colecoes', label: 'Coleções' },
  { id: 'comunidade', label: 'Comunidade' },
  { id: 'atividade', label: 'Atividade' },
  { id: 'sobre', label: 'Sobre' },
  { id: 'configuracoes', label: 'Configurações' },
];

/**
 * Navegação secundária com tabs para página do criador
 * Gerencia estado de aba ativa via query params
 */
const SecondaryNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || 'inicio';

  const handleTabClick = (tabId: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    if (tabId === 'inicio') {
      params.delete('tab');
    } else {
      params.set('tab', tabId);
    }

    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <nav className="mt-6 shadow">
      <div className="px-75">
        <ul className="flex justify-between px-6 py-3 text-gray-700 font-medium text-sm">
          {tabs.map((tab) => (
            <li
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`pb-2 cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'hover:border-b-2 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default SecondaryNav;