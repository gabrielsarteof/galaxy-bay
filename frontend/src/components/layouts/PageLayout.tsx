import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

/**
 * Layout base para páginas com sidebar
 * Garante que o conteúdo seja posicionado corretamente ao lado da sidebar
 */
export default function PageLayout({ children, sidebar }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {sidebar}
      <main className="flex-1 ml-20 page-transition">
        {children}
      </main>
    </div>
  );
}
