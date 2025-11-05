// src/app/auth/layout.tsx
import { ReactNode } from 'react'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Login',
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className={inter.className}>{children}</div>
}
