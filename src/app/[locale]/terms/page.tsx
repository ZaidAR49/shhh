import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });
  const seo = await getTranslations({ locale, namespace: 'seo' });

  return createMetadata({
    title: t('title'),
    description: seo('terms.description'),
    locale,
    path: '/terms',
  });
}

export default function TermsPage() {
  const t = useTranslations('terms');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      <main className="flex-1 pt-[120px] px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full pb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-8">{t('title')}</h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>{t('lastUpdated', { date: new Date().toLocaleDateString() })}</p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">{t('acceptanceTitle')}</h2>
          <p>{t('acceptanceContent')}</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">{t('descriptionTitle')}</h2>
          <p>{t('descriptionContent')}</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">{t('responsibilitiesTitle')}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('responsibilitiesAuth')}</li>
            <li>{t('responsibilitiesRecovery')}</li>
            <li>{t('responsibilitiesIllegal')}</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">{t('liabilityTitle')}</h2>
          <p>{t('liabilityContent')}</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">{t('terminationTitle')}</h2>
          <p>{t('terminationContent')}</p>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
