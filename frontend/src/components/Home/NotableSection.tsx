interface NotableSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  viewMoreHref?: string;
  navigationControls?: React.ReactNode;
}

export default function NotableSection({ title, subtitle, children, viewMoreHref, navigationControls }: NotableSectionProps) {
  return (
    <section className="px-6 py-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
          {navigationControls ? (
            navigationControls
          ) : viewMoreHref ? (
            <a
              href={viewMoreHref}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              Ver tudo
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
