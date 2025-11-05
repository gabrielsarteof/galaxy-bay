import SkeletonBox from '@/components/skeleton/SkeletonBox';
import SkeletonText from '@/components/skeleton/SkeletonText';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl space-y-8 p-6">
        <SkeletonText lines={1} widths={['w-64']} className="mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SkeletonBox height={300} rounded="lg" />
            <SkeletonText lines={2} />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <SkeletonBox height={48} rounded="md" />
              </div>
            ))}
            <SkeletonBox height={48} rounded="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
