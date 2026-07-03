'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { RiArrowLeftLine, RiArrowRightLine, RiDeleteBinLine, RiPencilLine, RiDownloadLine } from 'react-icons/ri';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MaskToggle } from './MaskToggle';
import { CopyButton } from './CopyButton';
import { SecretTypeIcon } from './SecretTypeIcon';
import { SECRET_TYPE_CONFIG_MAP } from '@/lib/secret-types';
import { formatDate, cn } from '@/lib/utils';
import type { Secret } from '@/types';

interface SecretDetailProps {
  secret: Secret;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function SecretDetail({ secret, onDelete, onEdit }: SecretDetailProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const config = SECRET_TYPE_CONFIG_MAP[secret.secret_type];

  const fields = secret.decrypted_fields ?? {};

  const isRtl = locale === 'ar';
  const BackIcon = isRtl ? RiArrowRightLine : RiArrowLeftLine;

  const handleExportEnv = () => {
    const content = fields['content'];
    if (!content) return;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}`;
    a.download = `${secret.name}-${dateStr}.env`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.push(`/${locale}/vault`)}
        aria-label={t('common.back')}
        className={cn(
          'inline-flex items-center gap-2 text-sm text-muted-foreground',
          'hover:text-foreground transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded'
        )}
      >
        <BackIcon size={16} />
        <span>{t('common.back')}</span>
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-foreground shrink-0">
            <SecretTypeIcon type={secret.secret_type} size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{secret.name}</h1>
            {config && (
              <Badge
                variant="secondary"
                className={cn('mt-1 text-xs font-medium', config.badgeColor)}
              >
                {t(config.labelKey as Parameters<typeof t>[0])}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {secret.secret_type === 'env_variable' && (
            <Button
              variant="outline"
              size="sm"
              aria-label={t('vault.exportEnv')}
              onClick={handleExportEnv}
            >
              <RiDownloadLine size={14} className="ltr:mr-1.5 rtl:ml-1.5" />
              {t('vault.exportEnv')}
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              aria-label={t('vault.editSecret')}
              onClick={() => onEdit(secret.id)}
            >
              <RiPencilLine size={14} className="ltr:mr-1.5 rtl:ml-1.5" />
              {t('common.edit')}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              aria-label={t('vault.deleteSecret')}
              onClick={() => onDelete(secret.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <RiDeleteBinLine size={14} className="ltr:mr-1.5 rtl:ml-1.5" />
              {t('common.delete')}
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Fields */}
      <div className="space-y-5">
        {config?.fields.map((field) => {
          const value = fields[field.key] ?? '';
          if (!value && !field.required) return null;

          return (
            <div key={field.key}>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                {t(field.labelKey as Parameters<typeof t>[0])}
              </label>
              <div className="flex items-center gap-2">
                {field.masked ? (
                  <MaskToggle value={value} className="flex-1" />
                ) : (
                  <div
                    className={cn(
                      'flex-1 text-sm break-all max-h-[300px] overflow-y-auto scrollbar-thin bg-muted/30 p-2.5 rounded-md border border-border/50',
                      field.monospace && 'font-mono tracking-wide'
                    )}
                  >
                    {value || <span className="text-muted-foreground">—</span>}
                  </div>
                )}
                {field.copyable && value && (
                  <CopyButton value={value} size="sm" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
        <div>
          <p className="font-medium uppercase tracking-wider mb-1">{t('vault.created')}</p>
          <p>{formatDate(secret.created_at, locale)}</p>
        </div>
        <div>
          <p className="font-medium uppercase tracking-wider mb-1">
            {t('vault.lastUpdated', { time: '' }).replace(' ', '')}
          </p>
          <p>{formatDate(secret.updated_at, locale)}</p>
        </div>
        {(secret.tags ?? []).length > 0 && (
          <div className="col-span-2">
            <p className="font-medium uppercase tracking-wider mb-1.5">{t('vault.tags')}</p>
            <div className="flex flex-wrap gap-1.5">
              {(secret.tags ?? []).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[11px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
