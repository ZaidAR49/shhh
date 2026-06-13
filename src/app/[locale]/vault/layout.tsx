'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useSession } from '@/hooks/useSession';
import { Navbar } from '@/components/layout/Navbar';
import { SessionBar } from '@/components/layout/SessionBar';
import { SessionExpiry } from '@/components/auth/SessionExpiry';
import { VaultProvider } from '@/components/vault/VaultProvider';
import { Sidebar } from '@/components/layout/Sidebar';

interface VaultLayoutProps {
  children: React.ReactNode;
}

export default function VaultLayout({ children }: VaultLayoutProps) {
  const router = useRouter();
  const locale = useLocale();
  const { session, isLoading, minutesRemaining, lock } = useSession();

  // Guard — redirect to auth if no session
  useEffect(() => {
    if (!isLoading && !session) {
      router.replace(`/${locale}/auth`);
    }
  }, [session, isLoading, locale, router]);

  const handleLock = () => {
    lock();
    router.push(`/${locale}/auth`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <VaultProvider>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <div className="sticky top-0 z-50 w-full flex flex-col">
          <Navbar session={session} minutesRemaining={minutesRemaining} onLock={handleLock} />
          <SessionBar minutesRemaining={minutesRemaining} />
        </div>
        <SessionExpiry minutesRemaining={minutesRemaining} />

        {/* Main content with sidebar */}
        <div className="flex-1 min-h-0 flex w-full max-w-[1400px] mx-auto overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex flex-col border-border border-e ltr:pr-6 rtl:pl-6 lg:ltr:pr-8 lg:rtl:pl-8 overflow-y-auto h-full shrink-0 w-[260px] scrollbar-thin">
          <Sidebar />
        </div>

        {/* Page content wrapper */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto h-full scrollbar-thin relative">
          <main
            className="flex-1 min-w-0"
            id="main-content"
          >
          {children}
          </main>
          <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground mt-auto shrink-0">
            &copy; {new Date().getFullYear()} Shhh. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
    </VaultProvider>
  );
}
