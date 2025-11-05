// src/app/(protected)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';
import Loading from '@/app/loading';
import { useUserProfile } from '@/hooks/useUserProfile';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isError, isLoading } = useUserProfile();

  useEffect(() => {
    if (isError) {
      router.replace('/auth/login');
    }
  }, [isError, router]);

  if (isLoading || !data) {
    return <Loading />;
  }

  return <div className={inter.className}>{children}</div>;
}
