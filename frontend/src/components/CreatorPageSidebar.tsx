'use client';
import Link from 'next/link';
import { FeedPlusIcon } from '@primer/octicons-react';
import { creatorNavItems } from '@/config/sidebar.config';
import BaseSidebar from '@/components/BaseSidebar';
import SideBarCreatorPage from './SidebarCreatorPage';

interface SidebarProps {
  active?: string;
}

export default function CreatorPageSidebar({ active = '/' }: SidebarProps) {
  const createNFTButton = (
    <Link
      href="/create-nft"
      className="flex w-full items-center h-12 px-3 font-semibold text-sm border-2 border-gray-300 rounded-lg hover:border-gray-900 transition-all overflow-hidden"
    >
      <FeedPlusIcon className="h-5 w-5 flex-shrink-0" />
      <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Criar NFT
      </span>
    </Link>
  );

  return (
    <BaseSidebar
      navItems={creatorNavItems}
      active={active}
      profileComponent={<SideBarCreatorPage />}
      additionalContent={createNFTButton}
    />
  );
}
