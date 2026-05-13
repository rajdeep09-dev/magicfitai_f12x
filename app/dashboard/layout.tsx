'use client';

import { CampaignProvider } from '@/contexts/CampaignContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-lime-400 font-black text-xs tracking-widest">
        SYNCING...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <CampaignProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-[#050505]">
          <Header />
          <main className="pt-20">{children}</main>
        </div>
      </ErrorBoundary>
    </CampaignProvider>
  );
}