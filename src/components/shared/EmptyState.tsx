'use client';

import { useTranslations } from 'next-intl';
import { RiShieldLine } from 'react-icons/ri';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddSecret: () => void;
}

export function EmptyState({ onAddSecret }: EmptyStateProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 text-muted-foreground">
        <RiShieldLine size={32} />
      </div>
      <h2 className="text-xl font-semibold mb-2">{t('vault.emptyVault')}</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        {t('vault.emptyVaultCta')}
      </p>
      <Button onClick={onAddSecret} aria-label={t('vault.addSecret')}>
        {t('vault.addSecret')}
      </Button>
    </div>
  );
}
