'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { AlertBanner } from '@/components/layout/AlertBanner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router             = useRouter();
  const { user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && !user) router.replace('/auth/login');
  }, [user, isHydrated, router]);

  if (!isHydrated || !user) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <AlertBanner />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
