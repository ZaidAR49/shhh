'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useSession } from '@/hooks/useSession';
import { Loader } from '@/components/ui/loader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { session, isLoading } = useSession();
  const [mfaCheckDone, setMfaCheckDone] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);

  const isMfaPage = pathname?.endsWith('/admin/mfa') || pathname?.includes('/admin/mfa');

  // Guard — redirect to auth if no session, or to vault if not admin/supervisor/viewer
  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        router.replace(`/${locale}/auth`);
      } else if (!['admin', 'supervisor', 'viewer'].includes(session.user.role || 'user')) {
        router.replace(`/${locale}/vault`);
      }
    }
  }, [session, isLoading, locale, router]);

  // Check admin MFA cookie — skip for the MFA challenge page itself
  useEffect(() => {
    if (isLoading || !session) return;
    if (!['admin', 'supervisor', 'viewer'].includes(session.user.role || 'user')) return;
    if (isMfaPage) {
      // On the MFA page itself: don't check, just let it render
      setMfaCheckDone(true);
      setMfaVerified(true); // allow rendering the MFA page
      return;
    }

    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('/api/admin/mfa/status');
        const data = await res.json();
        if (cancelled) return;
        if (data.verified) {
          setMfaVerified(true);
        } else {
          // Redirect to the MFA challenge page
          router.replace(`/${locale}/admin/mfa`);
        }
      } catch {
        if (!cancelled) router.replace(`/${locale}/admin/mfa`);
      } finally {
        if (!cancelled) setMfaCheckDone(true);
      }
    };
    check();
    return () => { cancelled = true; };
  }, [session, isLoading, isMfaPage, locale, router]);

  // Show spinner while loading session or MFA check
  if (
    isLoading ||
    !session ||
    !['admin', 'supervisor', 'viewer'].includes(session.user.role || 'user') ||
    (!mfaCheckDone && !isMfaPage)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader size={128} />
          {!isLoading && session && (
            <p className="text-xs text-muted-foreground animate-pulse">Checking security credentials…</p>
          )}
        </div>
      </div>
    );
  }

  // For non-MFA pages, only render once MFA is verified
  if (!isMfaPage && !mfaVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader size={128} />
      </div>
    );
  }

  return <>{children}</>;
}
