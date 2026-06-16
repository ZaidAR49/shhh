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
import { LandingFooter } from '@/components/layout/LandingFooter';
import { Loader } from '@/components/ui/loader';

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
        <Loader size={128} />
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
        <div className="flex-1 min-h-0 flex w-full mx-auto overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex flex-col border-border border-e px-3 lg:px-4 overflow-y-auto h-full shrink-0 w-60 lg:w-64 scrollbar-thin">
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
        </div>
      </div>
      </div>
    </VaultProvider>
  );
}
