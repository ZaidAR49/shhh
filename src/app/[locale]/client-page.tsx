'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { RiLockLine, RiShieldCheckLine, RiFileShieldLine, RiGroupLine } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { TypewriterText } from '@/components/shared/TypewriterText';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';



export default function LandingPage() {
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <LandingHeader />

      {/* Hero */}
      <main className="flex-1 pt-[96px]">
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 max-w-5xl mx-auto text-center">
          {/* Shield */}
          <div className="flex justify-center mb-8" aria-hidden="true">
            <div className="relative">
              <Image src="/icon.png" alt="Shhh Logo" width={300} height={300} priority className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-[180px] xl:h-[180px] 2xl:w-[220px] 2xl:h-[220px] object-contain shrink-0 relative z-10" />
              <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl scale-150" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 max-w-3xl mx-auto leading-tight">
            {tc('appName')}
          </h1>
          <div className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed h-[80px] sm:h-[60px] flex items-start sm:items-center justify-center">
            <TypewriterText texts={tc.raw('taglines') as string[]} />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 min-h-[48px]">
            {status === 'loading' ? (
              <div className="h-12 w-48 bg-muted animate-pulse rounded-md" />
            ) : status === 'authenticated' ? (
              <Button
                size="lg"
                onClick={handleVault}
                aria-label={t('vault.myVault')}
                className="h-12 px-8 text-sm font-medium"
                id="hero-vault-cta"
              >
                {t('vault.myVault')}
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleUnlock}
                aria-label={t('auth.unlockVault')}
                className="h-12 px-8 text-sm font-medium"
                id="hero-unlock-cta"
              >
                {t('auth.unlockVault')}
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push(`/${locale}/password-generator`)}
              className="h-12 px-8 text-sm font-medium"
            >
              {t('generator.title')}
            </Button>
          </div>

          {/* Trust signal */}
          <p className="mt-8 text-xs text-muted-foreground">
            {t('auth.noPassword')} · {t('auth.securedBy')}
          </p>
        </section>

        {/* Features */}
        <section
          className="border-t border-border px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-5xl mx-auto"
          aria-label="Features"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                icon: RiLockLine,
                title: '100% Passwordless',
                desc: 'Access your vault with your Google account and Two-Factor Authentication — never a master password.',
              },
              {
                icon: RiFileShieldLine,
                title: '9 Secret Types',
                desc: 'Passwords, cards, API keys, bank accounts, identities, Wi-Fi credentials, secure notes, and more.',
              },
              {
                icon: RiShieldCheckLine,
                title: '1-Hour Sessions',
                desc: 'Every session automatically expires after 60 minutes. Your vault locks itself to keep your data safe.',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <h2 className="text-base font-semibold">{feature.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
