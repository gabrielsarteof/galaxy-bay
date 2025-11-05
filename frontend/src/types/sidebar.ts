import { ComponentType, SVGProps } from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface SidebarConfig {
  navItems: NavItem[];
  profileComponent: ComponentType;
  additionalContent?: ComponentType;
}
