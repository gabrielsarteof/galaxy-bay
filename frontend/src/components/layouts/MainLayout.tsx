import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import PageLayout from './PageLayout';

interface MainLayoutProps {
  children: ReactNode;
  active?: string;
}

/**
 * Layout para páginas principais (usuários não-criadores)
 * Usa a sidebar padrão com navegação principal
 */
export default function MainLayout({ children, active }: MainLayoutProps) {
  return (
    <PageLayout sidebar={<Sidebar active={active} />}>
      {children}
    </PageLayout>
  );
}
