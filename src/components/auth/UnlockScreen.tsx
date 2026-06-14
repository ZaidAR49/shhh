'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { RiGoogleLine, RiFingerprint2Line } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface UnlockScreenProps {
  onUnlock: () => Promise<void>;
  isLoading?: boolean;
}

export function UnlockScreen({ onUnlock, isLoading = false }: UnlockScreenProps) {
  const t = useTranslations('auth');
  const tc = useTranslations('common');

  const [rememberedUser, setRememberedUser] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('shhh_remembered_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.expiresAt > Date.now()) {
          setRememberedUser(parsed);
        } else {
          localStorage.removeItem('shhh_remembered_user');
        }
      } catch (e) {}
    }
  }, []);

  const formatEmail = (email: string) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (!domain) return email;
    const visibleChars = Math.min(3, username.length);
    return username.substring(0, visibleChars) + '***@' + domain;
  };

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
        <Image 
          src="/icon.png" 
          alt="Shhh Logo" 
          width={240} 
          height={240} 
          style={{ width: 'auto', height: 'auto' }}
          priority
        />
      </div>

      {/* App identity */}
      {rememberedUser ? (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 text-center">
            {t('welcomeBack', { name: rememberedUser.name.split(' ')[0] })}
          </h1>
          <p className="text-sm text-muted-foreground mb-12 max-w-xs text-center leading-relaxed font-medium">
            {formatEmail(rememberedUser.email)}
          </p>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2 text-center">
            {tc('appName')}
          </h1>
          <p className="text-sm text-muted-foreground mb-12 max-w-xs text-center leading-relaxed">
            {(tc.raw('taglines') as string[])[0]}
          </p>
        </>
      )}

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
