'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RiShieldKeyholeLine, RiCheckLine } from 'react-icons/ri';
import Image from 'next/image';
import { MfaPromptDialog } from '@/components/auth/MfaPromptDialog';
import { toast } from 'sonner';

interface MfaSettingsProps {
  mfaEnabled: boolean | null;
  setMfaEnabled: (enabled: boolean) => void;
}

export function MfaSettings({ mfaEnabled, setMfaEnabled }: MfaSettingsProps) {
  const t = useTranslations('settings');
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDisablePromptOpen, setIsDisablePromptOpen] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/mfa/setup', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setQrCodeUrl(data.qrCodeDataUrl);
        setSecret(data.secret);
        setIsSetupOpen(true);
      } else {
        const errMsg = data.error || 'Failed to start setup';
        setError(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      setError('An error occurred');
      toast.error('An error occurred while starting MFA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    if (!token || token.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/mfa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok) {
        setMfaEnabled(true);
        setIsSetupOpen(false);
        setToken('');
        setSecret('');
        setQrCodeUrl('');
        toast.success('MFA enabled successfully');
      } else {
        const errMsg = data.error || 'Invalid code';
        setError(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      setError('An error occurred');
      toast.error('An error occurred while enabling MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (disableToken: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: disableToken }),
      });
      if (res.ok) {
        setMfaEnabled(false);
        setIsDisablePromptOpen(false);
        toast.success('MFA disabled successfully');
      } else {
        setError('Failed to disable MFA. Invalid code.');
        toast.error('Failed to disable MFA. Invalid code.');
      }
    } catch (err) {
      setError('An error occurred');
      toast.error('An error occurred while disabling MFA');
    } finally {
      setLoading(false);
    }
  };

  if (mfaEnabled === null) return <div className="h-10 animate-pulse bg-muted rounded-md w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-sm font-medium leading-none">Two-Factor Authentication</p>
            {mfaEnabled ? (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-[10px] px-1.5 py-0">Enabled</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Disabled</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Protect your account with an extra layer of security using Microsoft Authenticator.
          </p>
        </div>
        <div>
          {mfaEnabled ? (
            <Button variant="outline" size="sm" onClick={() => setIsDisablePromptOpen(true)} disabled={loading} className="text-destructive border-destructive/30 hover:bg-destructive/10">
              Disable
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleSetup} disabled={loading || isSetupOpen}>
              <RiShieldKeyholeLine className="ltr:mr-1.5 rtl:ml-1.5" size={14} />
              Enable
            </Button>
          )}
        </div>
      </div>

      {isSetupOpen && (
        <div className="mt-4 p-4 rounded-lg border bg-muted/30 space-y-4 animate-in fade-in zoom-in-95">
          <div className="space-y-2">
            <p className="text-sm font-medium">1. Scan QR Code</p>
            <p className="text-xs text-muted-foreground">Open your Authenticator app and scan this QR code.</p>
            <div className="bg-white p-2 rounded-md inline-block">
              {qrCodeUrl ? (
                <Image src={qrCodeUrl} alt="QR Code" width={150} height={150} className="rounded-sm" />
              ) : (
                <div className="w-[150px] h-[150px] bg-muted animate-pulse rounded-sm" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">2. Enter Verification Code</p>
            <p className="text-xs text-muted-foreground">Enter the 6-digit code shown in your app to confirm.</p>
            <div className="flex items-center gap-2 max-w-[250px]">
              <Input
                placeholder="000000"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                className="text-center tracking-widest font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && token.length === 6) handleEnable();
                }}
              />
              <Button onClick={handleEnable} disabled={loading || token.length !== 6}>
                Verify
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>
      )}

      {isDisablePromptOpen && (
        <MfaPromptDialog
          open={isDisablePromptOpen}
          onOpenChange={setIsDisablePromptOpen}
          onSuccess={handleDisable}
          actionName="disable MFA"
        />
      )}
    </div>
  );
}
