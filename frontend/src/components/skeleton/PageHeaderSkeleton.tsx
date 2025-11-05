import SkeletonBox from './SkeletonBox';
import SkeletonText from './SkeletonText';

export default function PageHeaderSkeleton() {
  return (
    <div className="bg-surface border-b border-light px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SkeletonBox width={64} height={64} rounded="md" />
          <div className="space-y-2">
            <SkeletonText lines={1} widths={['w-48']} />
            <SkeletonText lines={1} widths={['w-32']} />
          </div>
        </div>
        <div className="flex gap-2">
          <SkeletonBox width={100} height={40} rounded="lg" />
          <SkeletonBox width={100} height={40} rounded="lg" />
        </div>
      </div>
    </div>
  );
}
