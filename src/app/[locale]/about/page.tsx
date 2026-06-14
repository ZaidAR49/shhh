import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      <main className="flex-1 pt-[120px] px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full pb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-8">{t('title')}</h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p className="text-lg">
            {t.rich('p1', {
              important: (chunks) => <strong>{chunks}</strong>
            })}
          </p>
          
          <p>{t('p2')}</p>

          <p>{t('p3')}</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">{t('missionTitle')}</h2>
          <p>{t('missionContent')}</p>

          <p className="mt-8">
            <em>{t('missionTagline')}</em>
          </p>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
