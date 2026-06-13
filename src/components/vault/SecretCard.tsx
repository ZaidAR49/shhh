'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { RiPencilLine, RiFileCopyLine, RiDeleteBinLine, RiStarLine, RiStarFill, RiLock2Fill } from 'react-icons/ri';
import { Badge } from '@/components/ui/badge';
import { useGlobalVault } from '@/components/vault/VaultProvider';
import { CopyButton } from './CopyButton';
import { SecretTypeIcon } from './SecretTypeIcon';
import { SECRET_TYPE_CONFIG_MAP } from '@/lib/secret-types';
import { decodeBlob, timeAgo, cn } from '@/lib/utils';
import type { Secret } from '@/types';

interface SecretCardProps {
  secret: Secret;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function SecretCard({ secret, onView, onEdit, onDelete }: SecretCardProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const { toggleFavorite } = useGlobalVault();
  const config = SECRET_TYPE_CONFIG_MAP[secret.secret_type];

  // Decode primary field for preview
  const fields = secret.decrypted_fields ?? decodeBlob(secret.encrypted_blob);
  const primaryValue = config ? fields[config.primaryField] ?? '' : '';

  const handleCardClick = () => {
    if (onView) onView(secret.id);
    else router.push(`/${locale}/vault/${secret.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(secret.id);
    else router.push(`/${locale}/vault/${secret.id}/edit`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(secret.id);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(secret.id);
    } catch (err) {}
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${t('vault.viewSecret')}: ${secret.name}`}
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      className={cn(
        'group relative bg-card border border-border rounded-lg p-4 cursor-pointer',
        'transition-all duration-150 ease-in-out',
        'hover:border-ring/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'hover:shadow-sm'
      )}
    >
      {/* Top row: icon + name + badge */}
      <div className="flex items-start gap-3 mb-3">
        <div className="shrink-0 mt-0.5 text-muted-foreground">
          <SecretTypeIcon type={secret.secret_type} size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate leading-tight flex items-center gap-1.5">
            {secret.name}
            {secret.is_sensitive && (
              <RiLock2Fill size={14} className="text-destructive shrink-0" aria-label="Sensitive Secret" />
            )}
          </p>
          {config && (
            <Badge
              variant="secondary"
              className={cn(
                'mt-1 text-[10px] font-medium px-1.5 py-0 h-4 rounded-sm',
                config.badgeColor
              )}
            >
              {t(config.labelKey as Parameters<typeof t>[0])}
            </Badge>
          )}
        </div>
      </div>

      {/* Primary field masked preview */}
      <p className="secret-masked truncate mb-3" aria-label={t('common.hide')}>
        {primaryValue ? '••••••••••••' : '—'}
      </p>

      {/* Bottom row: timestamp + hover actions */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {t('vault.lastUpdated', { time: timeAgo(secret.updated_at, locale) })}
        </span>

        {/* Hover action row — visible on hover/focus-within */}
        <div
          className={cn(
            'flex items-center gap-0.5 opacity-0 translate-y-0.5',
            'group-hover:opacity-100 group-hover:translate-y-0',
            'group-focus-within:opacity-100 group-focus-within:translate-y-0',
            'transition-all duration-150'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {primaryValue && (
            <CopyButton value={primaryValue} size="sm" label={t('common.copy')} />
          )}
          <button
            type="button"
            aria-label={secret.is_favorite ? "Remove from favorites" : "Add to favorites"}
            onClick={handleFavorite}
            className={cn(
              'inline-flex items-center justify-center h-7 w-7 rounded-md',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              secret.is_favorite 
                ? 'text-amber-500 hover:bg-amber-500/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {secret.is_favorite ? <RiStarFill size={14} /> : <RiStarLine size={14} />}
          </button>
          <button
            type="button"
            aria-label={t('vault.editSecret')}
            onClick={handleEdit}
            className={cn(
              'inline-flex items-center justify-center h-7 w-7 rounded-md',
              'text-muted-foreground hover:text-foreground hover:bg-muted',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            <RiPencilLine size={14} />
          </button>
          <button
            type="button"
            aria-label={t('vault.deleteSecret')}
            onClick={handleDelete}
            className={cn(
              'inline-flex items-center justify-center h-7 w-7 rounded-md',
              'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            <RiDeleteBinLine size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
