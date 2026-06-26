import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createMetadata, createJsonLd } from '@/lib/metadata';
import ClientPage from './client-page';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  const seo = await getTranslations({ locale, namespace: 'seo' });

  return createMetadata({
    title: t('title'),
    description: seo('contact.description'),
    locale,
    path: '/contact',
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });

  const jsonLd = createJsonLd('ContactPage', {
    name: t('title'),
    description: t('description'),
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
