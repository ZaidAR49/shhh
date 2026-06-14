'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useSession } from '@/hooks/useSession';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const locale = useLocale();
  const { session, isLoading } = useSession();

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

  if (isLoading || !session || !['admin', 'supervisor', 'viewer'].includes(session.user.role || 'user')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
