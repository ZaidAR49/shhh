import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { useTranslations } from 'next-intl';

export default function SecurityPage() {
  const t = useTranslations('security');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      <main className="flex-1 pt-[120px] px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full pb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-8">{t('title')}</h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p className="text-lg text-foreground">
            {t('intro')}
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">{t('zkTitle')}</h2>
          <p>{t('zkContent1')}</p>
          <p>{t('zkContent2')}</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">{t('authTitle')}</h2>
          <p>{t('authContent1')}</p>
          <p>{t('authContent2')}</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">{t('sessionTitle')}</h2>
          <p>{t('sessionContent')}</p>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
