'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { RiAlertLine, RiCloseLine } from 'react-icons/ri';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SessionExpiryProps {
  minutesRemaining: number;
  onExtend?: () => void;
}

/**
 * Warning banner shown when session has < 5 minutes remaining.
 * Dismissible. Shows live countdown.
 */
export function SessionExpiry({ minutesRemaining, onExtend }: SessionExpiryProps) {
  const [dismissed, setDismissed] = useState(false);
  const t = useTranslations('auth');

  if (dismissed || minutesRemaining >= 5) return null;

  return (
    <div className="fixed top-[61px] left-0 right-0 z-40 px-4 sm:px-6 lg:px-8 pt-3">
      <Alert
        className={cn(
          'border-vault-warning/40 bg-vault-warning/5 text-foreground',
          'flex items-start gap-3 pr-10 relative'
        )}
      >
        <RiAlertLine size={18} className="text-vault-warning shrink-0 mt-0.5" />
        <div className="flex-1">
          <AlertTitle className="text-sm font-semibold">
            {t('sessionWarning')}
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground mt-0.5">
            {t('sessionExpiresIn', { minutes: minutesRemaining })}
          </AlertDescription>
        </div>
        <button
          type="button"
          aria-label="Dismiss warning"
          onClick={() => setDismissed(true)}
          className={cn(
            'absolute top-3 ltr:right-3 rtl:left-3',
            'h-5 w-5 flex items-center justify-center rounded',
            'text-muted-foreground hover:text-foreground transition-colors'
          )}
        >
          <RiCloseLine size={14} />
        </button>
      </Alert>
    </div>
  );
}
