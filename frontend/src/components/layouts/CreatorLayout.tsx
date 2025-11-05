import { ReactNode } from 'react';
import CreatorPageSidebar from '@/components/CreatorPageSidebar';
import PageLayout from './PageLayout';

interface CreatorLayoutProps {
  children: ReactNode;
  active?: string;
}

/**
 * Layout para páginas de criadores
 * Usa a sidebar de criador com navegação específica
 */
export default function CreatorLayout({ children, active }: CreatorLayoutProps) {
  return (
    <PageLayout sidebar={<CreatorPageSidebar active={active} />}>
      {children}
    </PageLayout>
  );
}
