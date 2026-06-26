import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shhh.episodicstack.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Shhh';

export const metadataBase = new URL(SITE_URL);

interface CreateMetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  locale?: string;
  noindex?: boolean;
  type?: 'website' | 'article' | 'profile';
  image?: string;
}

export function createMetadata({
  title,
  description,
  keywords = [],
  path = '',
  locale = 'en',
  noindex = false,
  type = 'website',
  image = '/icon.png',
}: CreateMetadataProps = {}): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;

  return {
    title: title || SITE_NAME,
    description: description || 'Your secrets, locked by who you are — not what you remember.',
    keywords: keywords.length > 0 ? keywords : undefined,
    metadataBase,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en${path}`,
        ar: `${SITE_URL}/ar${path}`,
      },
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      nocache: noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        noimageindex: noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: title || SITE_NAME,
      description: description || 'Your secrets, locked by who you are — not what you remember.',
      url,
      siteName: SITE_NAME,
      locale: locale === 'ar' ? 'ar_AR' : 'en_US',
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} - Passwordless Secrets Vault`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title || SITE_NAME,
      description: description || 'Your secrets, locked by who you are — not what you remember.',
      images: [image],
    },
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
  };
}

export function createJsonLd(schemaType: string, data: Record<string, unknown>) {
  return {
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': schemaType,
      ...data,
    }),
  };
}
