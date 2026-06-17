'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';

interface MfaPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (token: string) => void;
  actionName?: string;
  skipInternalVerify?: boolean;
}

export function MfaPromptDialog({ open, onOpenChange, onSuccess, actionName, skipInternalVerify }: MfaPromptDialogProps) {
  const tc = useTranslations('common');
  const t = useTranslations('settings'); // Reusing translation keys from MFA settings if possible
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    if (skipInternalVerify) {
      // Let the parent handle the verification
      onSuccess(token);
      setIsVerifying(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess(token);
        onOpenChange(false);
        setToken('');
        toast.success('Identity verified');
      } else {
        const errMsg = data.error || 'Invalid code';
        setError(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) setToken(''); // Reset on close
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verification Required</DialogTitle>
          <DialogDescription>
            This is a sensitive secret. Please enter your 6-digit authenticator code to {actionName || 'continue'}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex justify-center" dir="ltr">
            <InputOTP
              maxLength={6}
              value={token}
              onChange={(val) => {
                setToken(val);
                setError(null);
              }}
              disabled={isVerifying}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && token.length === 6) handleVerify();
              }}
              autoFocus
            >
              <InputOTPGroup className="gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className={`w-10 h-12 text-center text-lg font-bold rounded-xl border-2 transition-all duration-150 ${
                      error
                        ? 'border-destructive/70 text-destructive'
                        : token.length > i && !error
                        ? 'border-primary text-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_12%,transparent)]'
                        : 'border-border focus-visible:border-ring'
                    }`}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isVerifying}>
            {tc('cancel')}
          </Button>
          <Button onClick={handleVerify} disabled={isVerifying || token.length !== 6}>
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
