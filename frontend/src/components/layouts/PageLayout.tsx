import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export default function PageLayout({ children, sidebar }: PageLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {sidebar}
      <main className="flex-1 ml-20 h-screen overflow-y-auto page-transition">
        {children}
      </main>
    </div>
  );
}
