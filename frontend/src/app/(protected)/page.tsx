'use client';

import { Suspense } from 'react';
import Loading from '../loading';
import AuthenticatedHome from '@/components/AuthenticaticatedHome';

export default function HomePage() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthenticatedHome />
    </Suspense>
  );
}