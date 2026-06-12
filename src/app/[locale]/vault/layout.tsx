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
      <div className="min-h-screen bg-background">
        <Navbar session={session} minutesRemaining={minutesRemaining} onLock={handleLock} />
      <SessionBar minutesRemaining={minutesRemaining} />
      <SessionExpiry minutesRemaining={minutesRemaining} />

      {/* Main content with sidebar */}
      <div className="pt-[74px] flex w-full max-w-[1400px] mx-auto min-h-[calc(100vh-74px)]">
        {/* Desktop sidebar */}
        <div className="hidden md:block border-border border-e ltr:pr-6 rtl:pl-6 lg:ltr:pr-8 lg:rtl:pl-8">
          <Sidebar />
        </div>

        {/* Page content wrapper */}
        <div className="flex-1 flex flex-col min-w-0">
          <main
            className="flex-1 min-w-0"
            id="main-content"
          >
          {children}
        </main>
          <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground mt-auto">
            &copy; {new Date().getFullYear()} Shhh. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
    </VaultProvider>
  );
}
