'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { AddSecretWizard } from '@/components/vault/AddSecretWizard';
import { useVault } from '@/hooks/useVault';

export default function NewSecretPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('vault');
  const { createSecret } = useVault();

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">{t('addSecret')}</h1>
      <AddSecretWizard
        onSave={async (payload) => {
          await createSecret(payload as any);
          router.push(`/${locale}/vault`);
        }}
        onCancel={() => router.push(`/${locale}/vault`)}
      />
    </div>
  );
}
