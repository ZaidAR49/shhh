'use client';

import { useTranslations } from 'next-intl';
import { RiShieldKeyholeLine, RiGoogleLine, RiFingerprint2Line } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UnlockScreenProps {
  onUnlock: () => Promise<void>;
  isLoading?: boolean;
}

export function UnlockScreen({ onUnlock, isLoading = false }: UnlockScreenProps) {
  const t = useTranslations('auth');
  const tc = useTranslations('common');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-background">
      {/* Shield — conceptual center of the page */}
      <div
        className={cn(
          'mb-8 text-primary transition-transform duration-700',
          isLoading && 'scale-90 opacity-60'
        )}
        aria-hidden="true"
      >
        <RiShieldKeyholeLine size={80} strokeWidth={1} />
      </div>

      {/* App identity */}
      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
        {tc('appName')}
      </h1>
      <p className="text-sm text-muted-foreground mb-12 max-w-xs text-center leading-relaxed">
        {tc('tagline')}
      </p>

      {/* Primary action */}
      <div className="w-full max-w-xs space-y-3">
        <Button
          id="unlock-with-google"
          size="lg"
          onClick={onUnlock}
          disabled={isLoading}
          aria-label={t('continueWithGoogle')}
          className="w-full gap-2.5 h-12 text-sm font-medium"
        >
          {isLoading ? (
            t('signingIn')
          ) : (
            <>
              <RiGoogleLine size={18} />
              {t('continueWithGoogle')}
            </>
          )}
        </Button>
      </div>

      {/* Trust signal */}
      <p className="mt-10 text-xs text-muted-foreground text-center">
        {t('securedBy')}
      </p>
    </div>
  );
}
