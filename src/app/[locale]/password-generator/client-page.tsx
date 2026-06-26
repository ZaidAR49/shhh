'use client';

import { useTranslations } from 'next-intl';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { PasswordGenerator } from '@/components/shared/PasswordGenerator';
import { RiShieldKeyholeLine } from 'react-icons/ri';

export default function PasswordGeneratorPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />

      <main className="flex-1 pt-[96px] pb-16 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <RiShieldKeyholeLine size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
              {t('generator.title')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('generator.description')}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <PasswordGenerator />
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
