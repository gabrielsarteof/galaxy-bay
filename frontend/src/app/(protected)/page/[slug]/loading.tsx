import CreatorLayout from '@/components/layouts/CreatorLayout';
import PageHeaderSkeleton from '@/components/skeleton/PageHeaderSkeleton';
import HeroSectionSkeleton from '@/components/skeleton/HeroSectionSkeleton';
import SkeletonBox from '@/components/skeleton/SkeletonBox';
import SkeletonText from '@/components/skeleton/SkeletonText';

export default function Loading() {
  return (
    <CreatorLayout active="/">
      <div className="overflow-y-auto bg-gray-50 min-h-screen">
        <PageHeaderSkeleton />
        <HeroSectionSkeleton />

        {/* Secondary Nav Skeleton */}
        <div className="bg-surface border-b border-light px-6">
          <div className="flex gap-6 py-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="px-6 py-8 space-y-6">
          <div className="bg-white rounded-lg border border-light p-6">
            <SkeletonText lines={1} widths={['w-48']} className="mb-4" />
            <SkeletonBox height={200} rounded="lg" />
          </div>
          <div className="bg-white rounded-lg border border-light p-6">
            <SkeletonText lines={4} />
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
}
