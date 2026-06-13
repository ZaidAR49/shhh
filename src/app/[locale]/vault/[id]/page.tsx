'use client';

import { use, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { SecretDetail } from '@/components/vault/SecretDetail';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { Secret } from '@/types';

interface SecretPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function SecretPage({ params }: SecretPageProps) {
  const { id } = use(params);
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations();
  const [secret, setSecret] = useState<Secret | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/secrets/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setSecret(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    await fetch(`/api/secrets/${id}`, { method: 'DELETE' });
    setIsDeleting(false);
    router.push(`/${locale}/vault`);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-6 w-24" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!secret) {
    return (
      <div className="text-center py-12 sm:py-16 text-muted-foreground">
        {t('vault.secretNotFound')}
      </div>
    );
  }

  return (
    <>
      <SecretDetail
        secret={secret}
        onDelete={() => setDeleteOpen(true)}
        onEdit={() => router.push(`/${locale}/vault/${id}/edit`)}
      />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Secret"
        description={`Are you sure you want to permanently delete "${secret.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        isPending={isDeleting}
      />
    </>
  );
}
