'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

export function LandingFooter() {
  const tc = useTranslations('common');
  const t = useTranslations('nav');
  const locale = useLocale();

  return (
    <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground text-center md:text-left">
          © {new Date().getFullYear()} {tc('appName')} — {(tc.raw('taglines') as string[])[0]}
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href={`/${locale}/about`} className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded">
            {t('about')}
          </Link>
          <Link href={`/${locale}/security`} className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded">
            {t('security')}
          </Link>
          <Link href={`/${locale}/help`} className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded">
            {t('help')}
          </Link>
          <Link href={`/${locale}/privacy`} className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded">
            {t('privacy')}
          </Link>
          <Link href={`/${locale}/terms`} className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded">
            {t('terms')}
          </Link>
          <Link href={`/${locale}/contact`} className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded">
            {t('contact')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
