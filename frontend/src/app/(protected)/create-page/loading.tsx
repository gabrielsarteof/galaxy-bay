import SkeletonBox from '@/components/skeleton/SkeletonBox';
import SkeletonText from '@/components/skeleton/SkeletonText';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <SkeletonText lines={1} widths={['w-full']} className="mb-2" />
          <SkeletonText lines={1} widths={['w-3/4 mx-auto']} />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <SkeletonBox height={48} rounded="none" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <SkeletonBox height={48} rounded="none" />
          </div>
          <SkeletonBox height={48} rounded="lg" />
        </div>
      </div>
    </div>
  );
}
