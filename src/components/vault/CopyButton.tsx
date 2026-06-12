'use client';

import { RiFileCopyLine, RiCheckLine } from 'react-icons/ri';
import { useClipboard } from '@/hooks/useClipboard';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CopyButtonProps {
  value: string;
  className?: string;
  size?: 'sm' | 'md';
  label?: string;
}

export function CopyButton({ value, className, size = 'sm', label }: CopyButtonProps) {
  const { copy, copied } = useClipboard(30_000);
  const t = useTranslations('common');

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label ?? (copied ? t('copied') : t('copy'))}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              copy(value);
            }}
            className={cn(
              'inline-flex items-center justify-center rounded-md transition-colors',
              'text-muted-foreground hover:text-foreground hover:bg-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
              className
            )}
          />
        }
      >
        {copied ? (
          <RiCheckLine size={size === 'sm' ? 14 : 16} className="text-[var(--vault-unlocked)]" />
        ) : (
          <RiFileCopyLine size={size === 'sm' ? 14 : 16} />
        )}
      </TooltipTrigger>
      <TooltipContent>
        <p>{copied ? t('copied') : t('copy')}</p>
      </TooltipContent>
    </Tooltip>
  );
}
