'use client';

import { useUserProfile } from '@/hooks/useUserProfile';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layouts/MainLayout';
import Header from '@/components/Header';
import CategoryTabs from '@/components/CategoryTabs';
import TrendingSection from '@/components/TrendingSection';
import TopicSection from '@/components/TopicSection';
import { useEffect } from 'react';

export default function AuthenticatedHome() {
  const router = useRouter();
  const { data: profile } = useUserProfile();

  useEffect(() => {
    if (!profile) {
      router.replace('/auth/login');
    }
  }, [profile, router]);

  if (!profile) {
    return null;
  }

  return (
    <MainLayout active="/">
      <Header />
      <CategoryTabs />
      <TrendingSection />
      <TopicSection />
    </MainLayout>
  );
}
