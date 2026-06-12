'use client';

import { useState } from 'react';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MaskToggleProps {
  value: string;
  maskedDisplay?: string;
  className?: string;
}

export function MaskToggle({ value, maskedDisplay, className }: MaskToggleProps) {
  const [visible, setVisible] = useState(false);
  const t = useTranslations('common');

  const masked = maskedDisplay ?? '••••••••••••';

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'flex-1 min-w-0 break-all',
          visible ? 'secret-value' : 'secret-masked'
        )}
        aria-label={visible ? value : t('hide')}
      >
        {visible ? value : masked}
      </span>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label={visible ? t('hide') : t('show')}
              onClick={() => setVisible((v) => !v)}
              className={cn(
                'inline-flex items-center justify-center h-7 w-7 rounded-md shrink-0',
                'text-muted-foreground hover:text-foreground hover:bg-muted',
                'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
            />
          }
        >
          {visible ? <RiEyeOffLine size={14} /> : <RiEyeLine size={14} />}
        </TooltipTrigger>
        <TooltipContent>
          <p>{visible ? t('hide') : t('show')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
