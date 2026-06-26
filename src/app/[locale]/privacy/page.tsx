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
  const t = await getTranslations({ locale, namespace: 'privacy' });
  const seo = await getTranslations({ locale, namespace: 'seo' });

  return createMetadata({
    title: t('title'),
    description: seo('privacy.description'),
    locale,
    path: '/privacy',
  });
}

export default function PrivacyPage() {
  const t = useTranslations('privacy');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      <main className="flex-1 pt-[120px] px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full pb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-8">{t('title')}</h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>{t('lastUpdated', { date: new Date().toLocaleDateString() })}</p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">{t('introTitle')}</h2>
          <p>{t('introContent')}</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">{t('zkTitle')}</h2>
          <p>
            {t.rich('zkContent', {
              important: (chunks) => <strong>{chunks}</strong>
            })}
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">{t('dataTitle')}</h2>
          <p>{t('dataContent')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {t.rich('dataAuth', {
                bold: (chunks) => <strong>{chunks}</strong>
              })}
            </li>
            <li>
              {t.rich('dataVault', {
                bold: (chunks) => <strong>{chunks}</strong>
              })}
            </li>
            <li>
              {t.rich('dataSettings', {
                bold: (chunks) => <strong>{chunks}</strong>
              })}
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">{t('usageTitle')}</h2>
          <p>{t('usageContent')}</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">{t('deletionTitle')}</h2>
          <p>{t('deletionContent')}</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">{t('changesTitle')}</h2>
          <p>{t('changesContent')}</p>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
