'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { RiArrowLeftLine, RiAlertLine, RiCheckLine, RiShieldCheckLine, RiRefreshLine } from 'react-icons/ri';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ImportMode = 'replace' | 'merge';
type Step = 'mode' | 'confirm-replace' | 'mfa' | 'loading';

interface ParsedSecret {
  id: string;
  name: string;
  secret_type: string;
  decrypted_fields: Record<string, any>;
  is_sensitive: boolean;
  is_favorite: boolean;
  tags: string[];
}

interface ImportSecretsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  secrets: ParsedSecret[];
  /** True when the server already accepted the vault_mfa_ok cookie — skip OTP step */
  sessionMfaValid: boolean;
  onImportComplete: () => void;
}

export function ImportSecretsDialog({
  open,
  onOpenChange,
  secrets,
  sessionMfaValid,
  onImportComplete,
}: ImportSecretsDialogProps) {
  const t = useTranslations('settings');
  const tc = useTranslations('common');

  const [step, setStep] = useState<Step>('mode');
  const [mode, setMode] = useState<ImportMode | null>(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetAndClose = () => {
    setStep('mode');
    setMode(null);
    setOtp('');
    setOtpError('');
    setLoading(false);
    onOpenChange(false);
  };

  const handleModeSelect = (selected: ImportMode) => {
    setMode(selected);
    if (selected === 'replace') {
      setStep('confirm-replace');
    } else {
      // Merge: skip confirm, go directly to MFA or execute
      if (sessionMfaValid) {
        executeImport(selected, undefined);
      } else {
        setStep('mfa');
      }
    }
  };

  const handleReplaceConfirmed = () => {
    if (sessionMfaValid) {
      executeImport('replace', undefined);
    } else {
      setStep('mfa');
    }
  };

  const handleOtpSubmit = () => {
    if (otp.length !== 6) {
      setOtpError('Please enter a 6-digit code');
      return;
    }
    setOtpError('');
    executeImport(mode!, otp);
  };

  const executeImport = async (importMode: ImportMode, token: string | undefined) => {
    setStep('loading');
    setLoading(true);
    try {
      const res = await fetch('/api/secrets/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: importMode, secrets, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'MFA_REQUIRED') {
          // Should not happen, but gracefully fall back
          setStep('mfa');
          setLoading(false);
          return;
        }
        if (data.error?.includes('MFA token') || data.error?.includes('Invalid MFA')) {
          setOtpError(data.error);
          setStep('mfa');
          setLoading(false);
          return;
        }
        toast.error(data.error || t('importError'));
        resetAndClose();
        return;
      }

      const total = (data.imported || 0) + (data.updated || 0);
      toast.success(t('importSuccess', { imported: String(total) }));
      onImportComplete();
      resetAndClose();
    } catch (err) {
      toast.error(t('importError'));
      resetAndClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) resetAndClose(); }}>
      <DialogContent className="max-w-md" showCloseButton={false}>

        {/* ── Step: Mode Selection ── */}
        {step === 'mode' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">{t('importModeTitle')}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t('importModeDesc')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2">
              {/* Replace All card */}
              <button
                type="button"
                id="import-mode-replace"
                onClick={() => handleModeSelect('replace')}
                className={cn(
                  'w-full text-start rounded-xl border-2 p-4 transition-all duration-150',
                  'border-destructive/30 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/60',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                    <RiAlertLine size={16} className="text-destructive" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-destructive mb-1">{t('importModeReplace')}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t('importModeReplaceDesc')}</p>
                  </div>
                </div>
              </button>

              {/* Add & Merge card */}
              <button
                type="button"
                id="import-mode-merge"
                onClick={() => handleModeSelect('merge')}
                className={cn(
                  'w-full text-start rounded-xl border-2 p-4 transition-all duration-150',
                  'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/60',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <RiCheckLine size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-400 mb-1">{t('importModeMerge')}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t('importModeMergeDesc')}</p>
                  </div>
                </div>
              </button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetAndClose}>{tc('cancel')}</Button>
            </DialogFooter>
          </>
        )}

        {/* ── Step: Replace Confirmation ── */}
        {step === 'confirm-replace' && (
          <>
            <DialogHeader>
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                <RiAlertLine size={20} className="text-destructive" />
              </div>
              <DialogTitle className="text-xl">{t('importReplaceConfirmTitle')}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                {t('importReplaceConfirmDesc')}
              </DialogDescription>
            </DialogHeader>

            <div className="my-2 p-4 rounded-lg bg-destructive/5 border border-destructive/20 text-sm">
              <span className="text-destructive font-semibold">{secrets.length}</span>
              <span className="text-muted-foreground"> secret(s) will be imported after deletion.</span>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep('mode')}>
                <RiArrowLeftLine size={14} className="ltr:mr-1.5 rtl:ml-1.5" />
                {tc('back')}
              </Button>
              <Button
                id="import-replace-confirm-btn"
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white border-none"
                onClick={handleReplaceConfirmed}
              >
                {tc('confirm')}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ── Step: MFA OTP ── */}
        {step === 'mfa' && (
          <>
            <DialogHeader>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <RiShieldCheckLine size={20} className="text-primary" />
              </div>
              <DialogTitle className="text-xl">Verification Required</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t('importMfaPrompt')}
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 space-y-3">
              <div className="flex justify-center" dir="ltr">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(val) => { setOtp(val); setOtpError(''); }}
                  disabled={loading}
                  onKeyDown={(e) => { if (e.key === 'Enter' && otp.length === 6) handleOtpSubmit(); }}
                  autoFocus
                >
                  <InputOTPGroup className="gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className={`w-10 h-12 text-center text-lg font-bold rounded-xl border-2 transition-all duration-150 ${
                          otpError
                            ? 'border-destructive/70 text-destructive'
                            : otp.length > i && !otpError
                            ? 'border-primary text-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_12%,transparent)]'
                            : 'border-border focus-visible:border-ring'
                        }`}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {otpError && <p className="text-xs text-destructive text-center">{otpError}</p>}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(mode === 'replace' ? 'confirm-replace' : 'mode')} disabled={loading}>
                <RiArrowLeftLine size={14} className="ltr:mr-1.5 rtl:ml-1.5" />
                {tc('back')}
              </Button>
              <Button
                id="import-mfa-submit-btn"
                onClick={handleOtpSubmit}
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Importing...' : t('importSecrets')}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ── Step: Loading ── */}
        {step === 'loading' && (
          <div className="py-10 flex flex-col items-center gap-4">
            <RiRefreshLine size={36} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Importing your secrets…</p>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
