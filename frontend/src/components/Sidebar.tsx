'use client';
import { mainNavItems } from '@/config/sidebar.config';
import BaseSidebar from '@/components/BaseSidebar';
import SidebarProfile from '@/components/SidebarProfile';

interface SidebarProps {
  active?: string;
}

export default function Sidebar({ active = '/' }: SidebarProps) {
  return (
    <BaseSidebar
      navItems={mainNavItems}
      active={active}
      profileComponent={<SidebarProfile />}
    />
  );
}
