'use client';

import { useUserProfile } from '@/hooks/useUserProfile';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layouts/MainLayout';
import Header from '@/components/Header';
import CategoryTabs from '@/components/CategoryTabs';
import TrendingSection, { TrendingNavigation } from '@/components/TrendingSection';
import TopicSection from '@/components/TopicSection';
import HeroSection from '@/components/Home/HeroSection';
import NotableSection from '@/components/Home/NotableSection';
import FeaturedNFTsSection from '@/components/Home/FeaturedNFTsSection';
import TrendingCollectionsSection from '@/components/Home/TrendingCollectionsSection';
import RecentActivitySection from '@/components/Home/RecentActivitySection';
import { useEffect, useState } from 'react';

export default function AuthenticatedHome() {
  const router = useRouter();
  const { data: profile } = useUserProfile();
  const [activeCategory, setActiveCategory] = useState('Tudo');

  useEffect(() => {
    if (!profile) {
      router.replace('/auth/login');
    }
  }, [profile, router]);

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/marketplace?search=${encodeURIComponent(query)}`);
    }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category !== 'Tudo') {
      router.push(`/marketplace?category=${encodeURIComponent(category)}`);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <MainLayout active="/">
      <HeroSection />

      <Header onSearch={handleSearch} />

      <CategoryTabs active={activeCategory} onCategoryChange={handleCategoryChange} />

      <NotableSection
        title="Em alta esta semana"
        subtitle="Criadores em destaque com maior engajamento"
        navigationControls={<TrendingNavigation />}
      >
        <TrendingSection />
      </NotableSection>

      <NotableSection
        title="Featured Tokens"
        subtitle="This week's curated tokens"
        viewMoreHref="/marketplace"
      >
        <FeaturedNFTsSection />
      </NotableSection>

      <NotableSection
        title="Trending Collections"
        subtitle="Highest sales in the past hour"
        viewMoreHref="/marketplace"
      >
        <TrendingCollectionsSection />
      </NotableSection>

      <div className="bg-gray-50">
        <NotableSection
          title="Explore por categoria"
          subtitle="Encontre NFTs nas suas categorias favoritas"
        >
          <TopicSection onCategoryClick={handleCategoryChange} />
        </NotableSection>
      </div>

      <NotableSection
        title="Atividade recente"
        subtitle="Acompanhe as últimas transações da plataforma"
      >
        <RecentActivitySection />
      </NotableSection>
    </MainLayout>
  );
}
