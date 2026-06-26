import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createMetadata } from '@/lib/metadata';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return createMetadata({
    title: t('unlockVault'),
    description: t('unlockVaultDescription'),
    locale,
    path: '/auth',
    noindex: true,
  });
}

export default function AuthLayout({ children }: Props) {
  return <>{children}</>;
}
