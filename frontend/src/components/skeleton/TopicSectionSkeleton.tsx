import SkeletonBox from './SkeletonBox';
import SkeletonText from './SkeletonText';

export default function TopicSectionSkeleton() {
  return (
    <section className="px-6 py-8 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <SkeletonBox height={160} className="mb-3" rounded="lg" />
            <SkeletonText lines={2} widths={['w-full', 'w-2/3']} />
          </div>
        ))}
      </div>
    </section>
  );
}
