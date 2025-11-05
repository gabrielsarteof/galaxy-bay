import {
  HomeFillIcon,
  TelescopeFillIcon,
  CommentDiscussionIcon,
  BellFillIcon,
  GearIcon,
  FileMediaIcon,
  CreditCardIcon,
  ProjectRoadmapIcon,
  RocketIcon,
} from '@primer/octicons-react';
import { NavItem } from '@/types/sidebar';

export const mainNavItems: NavItem[] = [
  { label: 'Página inicial', href: '/', icon: HomeFillIcon },
  { label: 'Explorar', href: '/explore', icon: TelescopeFillIcon },
  { label: 'Comunidade', href: '/community', icon: CommentDiscussionIcon },
  { label: 'Notificações', href: '/notifications', icon: BellFillIcon },
  { label: 'Configurações', href: '/settings', icon: GearIcon },
];

export const creatorNavItems: NavItem[] = [
  { label: 'Minha página', href: '/', icon: HomeFillIcon },
  { label: 'Biblioteca', href: '/biblioteca', icon: FileMediaIcon },
  { label: 'Informações', href: '/informacoes', icon: ProjectRoadmapIcon },
  { label: 'Pagamentos', href: '/pagamentos', icon: CreditCardIcon },
  { label: 'Promoções', href: '/promocoes', icon: RocketIcon },
  { label: 'Comunidade', href: '/comunidade', icon: CommentDiscussionIcon },
  { label: 'Notificações', href: '/notificacoes', icon: BellFillIcon },
  { label: 'Configurações', href: '/configuracoes', icon: GearIcon },
];
