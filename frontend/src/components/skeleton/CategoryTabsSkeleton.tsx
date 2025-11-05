export default function CategoryTabsSkeleton() {
  return (
    <nav className="flex gap-2 px-6 py-4 border-b border-light overflow-x-auto">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-10 w-24 bg-gray-200 rounded-full animate-pulse flex-shrink-0"
        />
      ))}
    </nav>
  );
}
