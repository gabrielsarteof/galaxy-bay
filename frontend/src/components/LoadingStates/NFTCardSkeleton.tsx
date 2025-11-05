export function NFTCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-300"></div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
      </div>
    </div>
  );
}

export function NFTGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <NFTCardSkeleton key={i} />
      ))}
    </div>
  );
}
