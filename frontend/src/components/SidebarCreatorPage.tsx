'use client';

import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useAuth } from '@/hooks/useAuth';
import { useMyPage } from '@/hooks/useMyPage';
import { SignOutIcon } from '@primer/octicons-react';
import Link from 'next/link';

export default function SidebarCreatorPage() {
  const { address, logout } = useAuth();
  const { data: page, isLoading } = useMyPage();

  if (isLoading) {
    return <p>Carregando perfil…</p>;
  }

  if (!page) {
    return null;
  }

  // Backend garante que avatarUrl sempre existe (auto-healing)
  const displayName = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Conectar';

  return (
    <div className="relative flex items-center mx-4">
      <Menu as="div" className="relative w-full">
        <MenuButton className="w-full flex items-center h-12 px-2 hover:bg-surface-hover rounded-lg focus:outline-none transition-all overflow-hidden">
          <img
            key={page.avatarUrl}
            src={page.avatarUrl!}
            alt={page.name}
            className="w-8 h-8 rounded-md object-cover flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="ml-3 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <p className="text-sm font-medium text-gray-900">{page.name}</p>
            <p className="text-xs text-gray-500">Criador</p>
          </div>
        </MenuButton>
        <MenuItems className="origin-bottom-left w-65 absolute bottom-full left-0 pt-3 pb-1 mb-2 w-56 bg-white focus:outline-none rounded-md shadow-menu-dropdown z-20">
          <MenuItem>
            {({ active }) => (
              <Link
                href="/"
                className={`flex items-center px-4 py-3 text-sm font-medium text-gray-900 ${active ? 'bg-gray-100' : ''}`}
              >
                {address ? (
                  <Jazzicon diameter={30} seed={jsNumberForAddress(address)} />
                ) : (
                  <img
                    src="/default-avatar.png"
                    alt="Avatar padrão"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="ml-3">{displayName}</span>
              </Link>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                onClick={logout}
                className={`flex items-center w-full text-left p-4 text-sm text-red-600 ${active ? 'bg-gray-100' : ''}`}
              >
                <SignOutIcon className="h-4 w-4 mr-3" />
                Sair
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  );
}
