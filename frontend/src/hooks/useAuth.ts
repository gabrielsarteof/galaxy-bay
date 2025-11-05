'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [address, setAddress] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('walletAddress');
    if (stored) setAddress(stored);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('walletAddress');
    router.replace('/auth/login');
  }, [router]);

  return { address, logout };
}
