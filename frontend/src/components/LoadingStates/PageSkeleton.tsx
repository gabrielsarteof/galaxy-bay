export function PageHeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-300 rounded-t-lg"></div>
      <div className="p-6 space-y-4">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-gray-300 rounded"></div>
          <div className="h-8 w-24 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-8 bg-gray-300 rounded w-3/4"></div>
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}
