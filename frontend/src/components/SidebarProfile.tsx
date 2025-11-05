'use client';

import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMyPage } from '@/hooks/useMyPage';
import { SignOutIcon } from '@primer/octicons-react';

export default function SidebarProfile() {
  const { address, logout } = useAuth();
  const { data: page, isLoading } = useMyPage();
  const router = useRouter();

  if (isLoading) {
    return <p>Carregando perfil…</p>;
  }

  const displayName = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Conectar';

  return (
    <div className="relative flex items-center">
      <Menu as="div" className="relative w-full mx-4">
        <MenuButton className="w-full flex items-center h-12 px-3 hover:bg-surface-hover rounded-lg focus:outline-none transition-all">
          <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
            {address ? (
              <Jazzicon
                diameter={32}
                seed={jsNumberForAddress(address)}
              />
            ) : (
              <img
                src="/default-avatar.png"
                alt="Avatar padrão"
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
          </div>
          <div className="ml-3 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
            <p className="text-sm font-medium text-primary">{displayName}</p>
            <p className="text-xs text-secondary">{page ? 'Criador' : 'Membro'}</p>
          </div>
        </MenuButton>

        <MenuItems className="origin-bottom-left w-65 absolute bottom-full left-0 pt-3 pb-1 mb-2 w-56 bg-surface border border-light focus:outline-none rounded-md shadow-menu z-20 transition-theme">
          {page ? (
            <MenuItem>
              {({ active }) => (
                <Link
                  href={`/page/${page.slug}`}
                  onMouseEnter={() => router.prefetch(`/page/${page.slug}`)}
                  className={`flex items-center px-4 py-3 text-sm font-medium text-primary hover:bg-surface-hover transition-theme ${active ? 'bg-surface-hover' : ''}`}
                >
                  <img
                    key={page.avatarUrl}
                    src={page.avatarUrl!}
                    alt={page.name}
                    className="w-8 h-8 rounded-md mr-2 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {page.name}
                </Link>
              )}
            </MenuItem>
          ) : (
            <MenuItem>
              {({ active }) => (
                <Link
                  href="/create-page"
                  className={`block p-4 text-sm text-secondary hover:bg-surface-hover transition-theme ${active ? 'bg-surface-hover' : ''}`}
                >
                  Criar Página
                </Link>
              )}
            </MenuItem>
          )}
          <MenuItem>
            {({ active }) => (
              <button
                onClick={logout}
                className={`flex items-center w-full text-left p-4 text-sm text-error hover:bg-surface-hover transition-theme ${active ? 'bg-surface-hover' : ''}`}
              >
                <SignOutIcon className="h-4 w-4 mr-3"/>
                Sair
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  );
}