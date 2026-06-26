import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createMetadata, createJsonLd } from '@/lib/metadata';
import ClientPage from './client-page';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const seo = await getTranslations({ locale, namespace: 'seo' });

  return createMetadata({
    title: seo('home.title'),
    description: seo('home.description'),
    keywords: seo('home.keywords').split(', '),
    locale,
    path: '/',
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  
  const jsonLd = createJsonLd('WebSite', {
    name: 'Shhh',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://shhh.episodicstack.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://shhh.episodicstack.com'}/${locale}/help?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  });

  const orgJsonLd = createJsonLd('Organization', {
    name: 'Shhh',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://shhh.episodicstack.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://shhh.episodicstack.com'}/icon.png`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={orgJsonLd}
      />
      <ClientPage />
    </>
  );
}
