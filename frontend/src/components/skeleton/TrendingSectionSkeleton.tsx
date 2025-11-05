import TrendingCardSkeleton from './TrendingCardSkeleton';

export default function TrendingSectionSkeleton() {
  return (
    <section className="px-6 py-8 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex overflow-x-auto">
        {Array.from({ length: 5 }).map((_, index) => (
          <TrendingCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
