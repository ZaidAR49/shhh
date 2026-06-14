'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useSession } from 'next-auth/react';

export function LandingHeader() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const tc = useTranslations('common');
  const { status } = useSession();

  const handleUnlock = () => {
    router.push(`/${locale}/auth`);
  };

  const handleVault = () => {
    router.push(`/${locale}/vault`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[96px] bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
          <Image src="/icon.png" alt="Shhh Logo" width={80} height={80} priority className="shrink-0" style={{ width: 'auto', height: 'auto' }} />
          <span className="text-2xl font-bold tracking-tight">{tc('appName')}</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <LanguageSwitcher />
          {status === 'loading' ? (
            <div className="h-9 w-32 bg-muted animate-pulse rounded-md ltr:ml-2 rtl:mr-2" />
          ) : status === 'authenticated' ? (
            <Button
              size="sm"
              onClick={handleVault}
              aria-label={t('vault.myVault')}
              className="ltr:ml-2 rtl:mr-2"
            >
              {t('vault.myVault')}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleUnlock}
              aria-label={t('auth.unlockVault')}
              className="ltr:ml-2 rtl:mr-2"
            >
              {t('auth.unlockVault')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
