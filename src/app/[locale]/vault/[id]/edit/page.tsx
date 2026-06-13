'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { AddSecretWizard } from '@/components/vault/AddSecretWizard';
import { useVault } from '@/hooks/useVault';
import { Skeleton } from '@/components/ui/skeleton';
import type { Secret } from '@/types';

interface EditSecretPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function EditSecretPage({ params }: EditSecretPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('vault');
  const { updateSecret } = useVault();
  
  const [secret, setSecret] = useState<Secret | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/secrets/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setSecret(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!secret) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        Secret not found.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">{t('editSecret') || 'Edit Secret'}</h1>
      <AddSecretWizard
        initialSecret={secret}
        onSave={async (payload) => {
          await updateSecret(id, payload);
          router.back();
        }}
        onCancel={() => router.back()}
      />
    </div>
  );
}
