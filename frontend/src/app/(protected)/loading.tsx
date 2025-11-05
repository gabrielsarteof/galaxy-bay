import MainLayout from '@/components/layouts/MainLayout';
import CategoryTabsSkeleton from '@/components/skeleton/CategoryTabsSkeleton';
import TrendingSectionSkeleton from '@/components/skeleton/TrendingSectionSkeleton';
import TopicSectionSkeleton from '@/components/skeleton/TopicSectionSkeleton';

export default function Loading() {
  return (
    <MainLayout active="/">
      <div className="h-16 bg-surface border-b border-light px-6 flex items-center">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
      <CategoryTabsSkeleton />
      <TrendingSectionSkeleton />
      <TopicSectionSkeleton />
    </MainLayout>
  );
}
