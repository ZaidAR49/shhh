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
  error,
}: ConfirmDialogProps) {
  const t = useTranslations('common');
  const [confirmInput, setConfirmInput] = useState('');

  const isConfirmDisabled = isPending || 
    (confirmTextRequired && confirmInput !== confirmTextRequired) ||
    (requireMfa && confirmInput.length !== 6);

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
        
        {confirmTextRequired && !requireMfa && (
          <div className="my-4">
            <p className="text-sm text-foreground font-medium mb-2">
              {t('typeToConfirm', { text: confirmTextRequired })}
            </p>
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={confirmTextRequired}
              className="font-mono text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isConfirmDisabled) {
                  onConfirm(requireMfa ? confirmInput : undefined);
                  if (!requireMfa) setConfirmInput('');
                }
              }}
              autoFocus
            />
          </div>
        )}

        {requireMfa && (
          <div className="my-4">
            <p className="text-sm text-foreground font-medium mb-2">
              Enter 6-digit Authenticator Code to confirm
            </p>
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              maxLength={6}
              maxLength={6}
              className="font-mono text-sm tracking-widest text-center"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isConfirmDisabled) {
                  onConfirm(requireMfa ? confirmInput : undefined);
                  if (!requireMfa) setConfirmInput('');
                }
              }}
              autoFocus
            />
            {error && <p className="text-xs text-destructive mt-2">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setConfirmInput('');
              onCancel();
            }}
            disabled={isPending}
            aria-label={t('cancel')}
          >
            {t('cancel')}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            className={isDestructive ? 'bg-red-600 hover:bg-red-700 text-white border-none' : ''}
            onClick={() => {
              onConfirm(requireMfa ? confirmInput : undefined);
              if (!requireMfa) setConfirmInput('');
            }}
            disabled={Boolean(isConfirmDisabled)}
            aria-label={t('confirm')}
          >
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
