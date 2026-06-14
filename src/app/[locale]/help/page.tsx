import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { useTranslations } from 'next-intl';

export default function HelpPage() {
  const t = useTranslations('help');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      <main className="flex-1 pt-[120px] px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full pb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-8">{t('title')}</h1>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t('q1')}</h2>
            <p>{t('a1')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t('q2')}</h2>
            <p>{t('a2')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t('q3')}</h2>
            <p>{t('a3')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t('q4')}</h2>
            <p>{t('a4')}</p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
