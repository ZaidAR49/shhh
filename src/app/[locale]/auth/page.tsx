'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useSession } from '@/hooks/useSession';
import { UnlockScreen } from '@/components/auth/UnlockScreen';
import { useEffect } from 'react';

export default function AuthPage() {
  const router = useRouter();
  const locale = useLocale();
  const { session, isLoading, unlock } = useSession();

  // If already unlocked, redirect to vault
  useEffect(() => {
    if (session && !isLoading) {
      router.replace(`/${locale}/vault`);
    }
  }, [session, isLoading, locale, router]);

  const handleUnlock = async (provider: 'google' | 'github' = 'google') => {
    await unlock(provider);
    router.push(`/${locale}/vault`);
  };

  return <UnlockScreen onUnlock={handleUnlock} isLoading={isLoading} />;
}
