'use client'

import React, { useMemo, ReactNode } from 'react'
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { ToastProvider } from '@/components/Toast/ToastContainer'

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 60 * 24,
          gcTime:    1000 * 60 * 60 * 24,
          retry:     1,
        },
      },
    })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </QueryClientProvider>
  )
}
