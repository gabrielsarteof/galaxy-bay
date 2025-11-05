import SkeletonBox from './SkeletonBox';

export default function HeroSectionSkeleton() {
  return (
    <div className="relative">
      <SkeletonBox height={400} className="w-full" rounded="none" />
      <div className="absolute bottom-6 left-6 right-6">
        <div className="h-8 w-64 bg-white/80 rounded animate-pulse mb-2" />
        <div className="h-4 w-48 bg-white/80 rounded animate-pulse" />
      </div>
    </div>
  );
}
