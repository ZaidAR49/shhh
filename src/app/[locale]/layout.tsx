import type { Metadata, Viewport } from 'next';
import { Inter, Cairo } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Providers } from '@/components/providers';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import { createMetadata } from '@/lib/metadata';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const seo = await getTranslations({ locale, namespace: 'seo' });
  
  const base = createMetadata({
    title: seo('home.title'),
    description: seo('home.description'),
    keywords: seo('home.keywords').split(', '),
    locale,
  });

  return {
    ...base,
    title: {
      template: '%s | Shhh',
      default: base.title as string,
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: '/icon.png',
      apple: '/icon.png',
    },
    manifest: '/manifest.json',
    appleWebApp: {
      title: 'Shhh',
      statusBarStyle: 'black-translucent',
    },
  };
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
      className={`${inter.variable} ${cairo.variable}`}
    >
      <body suppressHydrationWarning>
        <Providers
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <NextIntlClientProvider messages={messages} locale={locale}>
            <TooltipProvider delay={300}>
              {children}
              <Toaster position="bottom-center" richColors theme="system" />
            </TooltipProvider>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
