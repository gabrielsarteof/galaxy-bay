import SkeletonBox from './SkeletonBox';
import SkeletonText from './SkeletonText';

export default function TrendingCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-40 mr-4">
      <SkeletonBox height={160} className="mb-3" rounded="lg" />
      <SkeletonText lines={2} widths={['w-3/4', 'w-1/2']} />
    </div>
  );
}
