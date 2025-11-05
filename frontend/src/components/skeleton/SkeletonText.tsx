interface SkeletonTextProps {
  lines?: number;
  className?: string;
  widths?: string[];
}

export default function SkeletonText({
  lines = 1,
  className = '',
  widths
}: SkeletonTextProps) {
  const defaultWidths = ['w-full', 'w-5/6', 'w-4/5', 'w-full', 'w-3/4'];

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 rounded animate-pulse ${
            widths?.[index] || defaultWidths[index % defaultWidths.length]
          }`}
        />
      ))}
    </div>
  );
}
