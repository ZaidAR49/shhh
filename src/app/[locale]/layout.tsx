import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Providers } from '@/components/providers';
import { TooltipProvider } from '@/components/ui/tooltip';
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

export const metadata: Metadata = {
  title: 'Shhh — The Passwordless Secrets Vault',
  description:
    'Your secrets, locked by who you are — not what you remember. 100% passwordless. Access via Google OAuth and 2FA.',
  keywords: ['password manager', 'secrets vault', 'passwordless', '2fa', 'security'],
};

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
            </TooltipProvider>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
