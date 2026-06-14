'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MfaPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (token: string) => void;
  actionName?: string;
}

export function MfaPromptDialog({ open, onOpenChange, onSuccess, actionName }: MfaPromptDialogProps) {
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
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={token}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setToken(val);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleVerify();
            }}
            className="text-center tracking-[0.5em] font-mono text-lg"
          />
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
