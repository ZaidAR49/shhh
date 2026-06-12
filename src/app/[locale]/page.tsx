'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { RiLockLine, RiShieldCheckLine, RiFileShieldLine, RiGroupLine } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { cn } from '@/lib/utils';



export default function LandingPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const tc = useTranslations('common');

  const handleUnlock = () => {
    router.push(`/${locale}/auth`);
  };

  const handleVault = () => {
    router.push(`/${locale}/vault`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[96px] bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/icon.png" alt="Shhh Logo" width={80} height={80} priority className="shrink-0" />
            <span className="text-2xl font-bold tracking-tight">{tc('appName')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button
              size="sm"
              onClick={handleUnlock}
              aria-label={t('auth.unlockVault')}
              className="ltr:ml-2 rtl:mr-2"
            >
              {t('auth.unlockVault')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 pt-[96px]">
        <section className="px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 max-w-5xl mx-auto text-center">
          {/* Shield */}
          <div className="flex justify-center mb-8" aria-hidden="true">
            <div className="relative">
              <Image src="/icon.png" alt="Shhh Logo" width={240} height={240} priority className="shrink-0" />
              <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl scale-150" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 max-w-3xl mx-auto leading-tight">
            {tc('appName')}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {tc('tagline')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={handleUnlock}
              aria-label={t('auth.unlockVault')}
              className="h-12 px-8 text-sm font-medium"
              id="hero-unlock-cta"
            >
              {t('auth.unlockVault')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleVault}
              aria-label={t('vault.myVault')}
              className="h-12 px-8 text-sm"
              id="hero-vault-cta"
            >
              {t('vault.myVault')}
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
                desc: 'Access your vault with your Google account and device biometrics — never a master password.',
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

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-muted-foreground text-center">
          © 2026 {tc('appName')} — {tc('tagline')}
        </p>
      </footer>
    </div>
  );
}
