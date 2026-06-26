import { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';
import VaultClientLayout from './VaultClientLayout';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return createMetadata({
    title: 'Vault',
    description: 'Your secure, passwordless secrets vault.',
    locale,
    path: '/vault',
    noindex: true,
  });
}

export default function VaultLayout({ children }: Props) {
  return <VaultClientLayout>{children}</VaultClientLayout>;
}
