import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createMetadata, createJsonLd } from '@/lib/metadata';
import ClientPage from './client-page';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'generator' });
  const seo = await getTranslations({ locale, namespace: 'seo' });

  return createMetadata({
    title: t('title'),
    description: seo('passwordGenerator.description'),
    locale,
    path: '/password-generator',
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'generator' });
  const seo = await getTranslations({ locale, namespace: 'seo' });

  const jsonLd = createJsonLd('WebApplication', {
    name: t('title'),
    description: seo('passwordGenerator.description'),
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Any',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd}
      />
      <ClientPage />
    </>
  );
}
