'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import { useProgressBar } from '@/hooks/useProgressBar';
import '@/styles/nprogress-custom.css';

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useProgressBar();

  useEffect(() => {
    NProgress.configure({
      showSpinner: false,
      minimum: 0.1,
      speed: 400,
      trickleSpeed: 100
    });
  }, []);

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}
