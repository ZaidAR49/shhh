'use client';

import { useTranslations } from 'next-intl';
import { RiAlertLine } from 'react-icons/ri';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: (mfaToken?: string) => void;
  onCancel: () => void;
  isDestructive?: boolean;
  isPending?: boolean;
  confirmTextRequired?: string;
  requireMfa?: boolean;
  mfaSessionActive?: boolean;
  error?: string;
}

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  isDestructive = true,
  isPending = false,
  confirmTextRequired,
  requireMfa,
  mfaSessionActive,
  error,
}: ConfirmDialogProps) {
  const t = useTranslations('common');
  const [textInput, setTextInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [currentStep, setCurrentStep] = useState<'text' | 'otp'>('text');

  const bothRequired = confirmTextRequired && requireMfa && !mfaSessionActive;
  const showText = bothRequired ? currentStep === 'text' : !!confirmTextRequired;
  const showOtp = bothRequired ? currentStep === 'otp' : !!(requireMfa && !mfaSessionActive);

  let isConfirmDisabled = isPending;
  if (showText && confirmTextRequired) {
    isConfirmDisabled = isConfirmDisabled || textInput !== confirmTextRequired;
  }
  if (showOtp && requireMfa && !mfaSessionActive) {
    isConfirmDisabled = isConfirmDisabled || otpInput.length !== 6;
  }

  const handleConfirmClick = () => {
    if (bothRequired && currentStep === 'text') {
      setCurrentStep('otp');
    } else {
      onConfirm((requireMfa && !mfaSessionActive) ? otpInput : undefined);
      // We don't reset inputs here in case the request fails and the dialog stays open
    }
  };

  const handleCancelClick = () => {
    setTextInput('');
    setOtpInput('');
    setCurrentStep('text');
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onCancel()}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          {isDestructive && (
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <RiAlertLine size={20} className="text-destructive" />
            </div>
          )}
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {showText && (
          <div className="my-4">
            <p className="text-sm text-foreground font-medium mb-2">
              {t('typeToConfirm', { text: confirmTextRequired })}
            </p>
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={confirmTextRequired}
              className="font-mono text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isConfirmDisabled) {
                  handleConfirmClick();
                }
              }}
              autoFocus
            />
          </div>
        )}

        {showOtp && (
          <div className="my-4">
            <p className="text-sm text-foreground font-medium mb-4 text-center">
              Enter 6-digit Authenticator Code to confirm
            </p>
            <div className="flex justify-center mb-2" dir="ltr">
              <InputOTP
                maxLength={6}
                value={otpInput}
                onChange={(val) => {
                  setOtpInput(val);
                }}
                disabled={isPending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && otpInput.length === 6 && !isConfirmDisabled) {
                    handleConfirmClick();
                  }
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
                          : otpInput.length > i && !error
                          ? 'border-primary text-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_12%,transparent)]'
                          : 'border-border focus-visible:border-ring'
                      }`}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && <p className="text-xs text-destructive text-center mt-2">{error}</p>}
          </div>
        )}

        <DialogFooter>
          {bothRequired && currentStep === 'otp' ? (
            <Button
              variant="outline"
              onClick={() => setCurrentStep('text')}
              disabled={isPending}
              aria-label={t('back')}
            >
              {t('back')}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleCancelClick}
              disabled={isPending}
              aria-label={t('cancel')}
            >
              {t('cancel')}
            </Button>
          )}
          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            className={isDestructive ? 'bg-red-600 hover:bg-red-700 text-white border-none' : ''}
            onClick={handleConfirmClick}
            disabled={Boolean(isConfirmDisabled)}
            aria-label={bothRequired && currentStep === 'text' ? t('next') : t('confirm')}
          >
            {bothRequired && currentStep === 'text' ? t('next') : t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
