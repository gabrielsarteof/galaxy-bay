'use client';
import Link from 'next/link';
import React from 'react';

interface SidebarNavItemProps {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  active?: boolean;
}

export default function SidebarNavItem({
  label,
  href,
  icon: Icon,
  active = false,
}: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      className={
        `flex items-center h-12 mb-1 font-medium text-sm hover:bg-surface-hover transition-all rounded-md overflow-hidden mx-4 px-3 ` +
        (active ? 'bg-surface-hover font-semibold text-primary' : 'text-secondary')
      }
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">{label}</span>
    </Link>
  );
}