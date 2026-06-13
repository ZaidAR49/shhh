'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { RiAddLine, RiMenuLine } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SecretGrid } from '@/components/vault/SecretGrid';
import { AddSecretWizard } from '@/components/vault/AddSecretWizard';
import { SearchBar } from '@/components/shared/SearchBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { MfaPromptDialog } from '@/components/auth/MfaPromptDialog';
import { useGlobalVault } from '@/components/vault/VaultProvider';
import { useRouter } from 'next/navigation';
import type { SecretType } from '@/types';

export default function VaultPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { secrets, isLoading, isLoadingMore, hasMore, loadSecrets, loadMoreSecrets, createSecret, deleteSecret, searchSecrets, mfaEnabled } = useGlobalVault();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [mfaPrompt, setMfaPrompt] = useState<{
    open: boolean;
    actionType: 'view' | 'edit' | 'delete';
    targetId: string | null;
  }>({ open: false, actionType: 'view', targetId: null });
  
  const activeFilter = searchParams.get('filter') || 'all';

  // Load secrets on mount
  useEffect(() => {
    loadSecrets();
  }, [loadSecrets]);

  // Filter secrets by type or favorites
  const filteredSecrets = useMemo(() => {
    if (activeFilter === 'all') return secrets;
    if (activeFilter === 'favorites') return secrets.filter(s => s.is_favorite);
    if (activeFilter === 'sensitive') return secrets.filter(s => s.is_sensitive);
    return secrets.filter((s) => s.secret_type === activeFilter);
  }, [secrets, activeFilter]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.trim()) {
        await searchSecrets(query);
      } else {
        await loadSecrets();
      }
    },
    [searchSecrets, loadSecrets]
  );

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteSecret(deleteId);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const deleteTarget = deleteId ? secrets.find((s) => s.id === deleteId) : null;

  const interceptAction = (id: string, actionType: 'view' | 'edit' | 'delete') => {
    const target = secrets.find(s => s.id === id);
    if (target?.is_sensitive && mfaEnabled) {
      setMfaPrompt({ open: true, actionType, targetId: id });
    } else {
      executeAction(id, actionType);
    }
  };

  const executeAction = (id: string, actionType: 'view' | 'edit' | 'delete') => {
    if (actionType === 'view') {
      router.push(`/${locale}/vault/${id}`);
    } else if (actionType === 'edit') {
      router.push(`/${locale}/vault/${id}/edit`);
    } else if (actionType === 'delete') {
      setDeleteId(id);
    }
  };

  return (
    <div className="flex px-4 sm:px-6 lg:px-8">
      {/* Page content */}
      <div className="flex-1 space-y-6 min-w-0 py-6 sm:py-8">
        {/* Vault header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {activeFilter === 'favorites' 
                  ? (t('vault.favorites') || 'Favorites') 
                  : activeFilter === 'sensitive'
                    ? 'Sensitive'
                    : activeFilter !== 'all' 
                      ? t(`secretTypes.${activeFilter}` as Parameters<typeof t>[0])
                      : t('vault.myVault')}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('vault.total', { count: filteredSecrets.length })}
              </p>
            </div>
          </div>
        <Button
          id="add-secret-button"
          onClick={() => setWizardOpen(true)}
          aria-label={t('vault.addSecret')}
          className="gap-1.5 shrink-0"
        >
          <RiAddLine size={16} />
          <span className="hidden sm:inline">{t('vault.addSecret')}</span>
        </Button>
      </div>

      {/* Search */}
      <SearchBar onSearch={handleSearch} className="max-w-sm" />

      {/* Grid or empty state */}
      {!isLoading && filteredSecrets.length === 0 ? (
        <EmptyState onAddSecret={() => setWizardOpen(true)} />
      ) : (
        <SecretGrid 
          secrets={filteredSecrets} 
          isLoading={isLoading} 
          onView={(id) => interceptAction(id, 'view')}
          onEdit={(id) => interceptAction(id, 'edit')}
          onDelete={(id) => interceptAction(id, 'delete')}
        />
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={loadMoreSecrets}
            disabled={isLoadingMore}
            className="w-full sm:w-auto"
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* Add Secret wizard in a Sheet */}
      <Sheet open={wizardOpen} onOpenChange={setWizardOpen}>
        <SheetContent
          side="right"
          className="w-[95vw] sm:max-w-lg overflow-y-auto px-4 py-6 sm:px-6 sm:py-8"
          aria-label={t('vault.addSecret')}
        >
          <SheetHeader className="mb-6 px-0">
            <SheetTitle>{t('vault.addSecret')}</SheetTitle>
          </SheetHeader>
          <AddSecretWizard
            onSave={async (payload) => {
              await createSecret(payload as any);
              setWizardOpen(false);
            }}
            onCancel={() => setWizardOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={!!deleteId}
        title={t('vault.deleteSecret')}
        description={
          deleteTarget
            ? t('vault.deleteConfirm', { name: deleteTarget.name })
            : t('vault.deleteSecret')
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        isPending={isDeleting}
      />

      {/* MFA Verification Prompt */}
      <MfaPromptDialog
        open={mfaPrompt.open}
        onOpenChange={(open) => setMfaPrompt(prev => ({ ...prev, open }))}
        onSuccess={() => {
          if (mfaPrompt.targetId) {
            executeAction(mfaPrompt.targetId, mfaPrompt.actionType);
          }
        }}
        actionName={mfaPrompt.actionType}
      />
      </div>
    </div>
  );
}
