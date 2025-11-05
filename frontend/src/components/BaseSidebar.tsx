'use client';
import Image from 'next/image';
import { ReactNode } from 'react';
import { NavItem } from '@/types/sidebar';
import SidebarNavItem from '@/components/SidebarNavItem';

interface BaseSidebarProps {
  navItems: NavItem[];
  active?: string;
  profileComponent: ReactNode;
  additionalContent?: ReactNode;
}

export default function BaseSidebar({
  navItems,
  active = '/',
  profileComponent,
  additionalContent,
}: BaseSidebarProps) {
  return (
    <aside className="w-20 hover:w-64 h-screen bg-surface border-r border-light fixed top-0 left-0 flex flex-col py-4 transition-all duration-300 ease-in-out group z-50">
      {/* Logo */}
      <div className="h-16 flex items-center overflow-hidden mb-2 mx-4 px-2">
        <Image
          src="/logo.png"
          alt="Galaxy Bay Logo"
          width={40}
          height={40}
          className="flex-shrink-0"
        />
        <div className="flex flex-col leading-tight font-poppins opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap ml-3">
          <span className="text-xl font-semibold text-gray-900">Galaxy</span>
          <span className="text-sm font-light text-gray-900">Bay</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map(({ label, href, icon }) => (
          <SidebarNavItem
            key={href}
            label={label}
            href={href}
            icon={icon}
            active={active === href}
          />
        ))}

        {/* Additional Content (e.g., Criar NFT button) */}
        {additionalContent && (
          <div className="mt-3 mx-4">
            {additionalContent}
          </div>
        )}
      </nav>

      {/* Profile Section */}
      <div className="mt-auto">
        {profileComponent}
      </div>
    </aside>
  );
}
