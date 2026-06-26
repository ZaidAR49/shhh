import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shhh.episodicstack.com';

const locales = ['en', 'ar'];

const publicPaths = [
  '',
  '/about',
  '/contact',
  '/security',
  '/privacy',
  '/terms',
  '/help',
  '/password-generator',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of publicPaths) {
    const url = `${SITE_URL}/en${path}`;

    const alternateLanguages: Record<string, string> = {};
    for (const locale of locales) {
      alternateLanguages[locale] = `${SITE_URL}/${locale}${path}`;
    }

    entries.push({
      url,
      lastModified: new Date(),
      changeFrequency: path === '' ? 'weekly' : 'monthly',
      priority: path === '' ? 1 : 0.8,
      alternates: {
        languages: alternateLanguages,
      },
    });
  }

  return entries;
}
