'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { RiShieldKeyholeLine, RiAlertLine, RiArrowLeftLine, RiRefreshLine, RiCheckDoubleLine, RiTimeLine } from 'react-icons/ri';
import { signOut } from 'next-auth/react';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const CODE_LENGTH = 6;

export default function AdminMfaPage() {
  const router = useRouter();
  const locale = useLocale();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mfaNotEnabled, setMfaNotEnabled] = useState(false);
  
  const submitCode = async (codeToSubmit: string) => {
    if (codeToSubmit.length !== CODE_LENGTH) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: codeToSubmit }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setError(data.error || 'Too many attempts.');
        return;
      }

      if (res.status === 400 && data.error?.includes('not enabled')) {
        setMfaNotEnabled(true);
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Invalid code. Please try again.');
        setCode('');
        return;
      }

      // Success — redirect to admin dashboard
      router.replace(`/${locale}/admin`);
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: `/${locale}/auth` });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, var(--vault-locked) 0%, transparent 70%)' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div
          className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          style={{ animation: 'mfa-card-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <style>{`
            @keyframes mfa-card-in {
              from { opacity: 0; transform: scale(0.94) translateY(16px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes mfa-shake {
              0%, 100% { transform: translateX(0); }
              20%, 60% { transform: translateX(-6px); }
              40%, 80% { transform: translateX(6px); }
            }
            .mfa-shake { animation: mfa-shake 0.4s ease; }
          `}</style>

          {/* Top accent */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 60%, var(--vault-unlocked)))' }} />

          {/* Header */}
          <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 self-start">
              <Image src="/icon.png" alt="Shhh" width={32} height={32} className="object-contain" />
              <span className="text-base font-black tracking-tight text-foreground">Shhh</span>
              <span className="text-[9px] font-bold uppercase tracking-[3px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">Admin</span>
            </div>

            {/* Shield icon */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)', border: '1.5px solid color-mix(in srgb, var(--primary) 25%, transparent)' }}
            >
              <RiShieldKeyholeLine size={40} style={{ color: 'var(--primary)' }} />
            </div>

            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
              Admin Verification
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Enter the 6-digit code from your authenticator app to access the admin dashboard.
            </p>
          </div>

          {/* Body */}
          <div className="px-8 pb-8 flex flex-col gap-6">

            {mfaNotEnabled ? (
              /* MFA not enabled warning */
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-center">
                <RiAlertLine size={28} className="mx-auto mb-3 text-destructive" />
                <p className="text-sm font-semibold text-destructive mb-1">2FA Not Enabled</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You must enable Two-Factor Authentication in your vault settings before accessing the admin panel. This is a security requirement for all admin accounts.
                </p>
                <a
                  href={`/${locale}/vault`}
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Go to Vault Settings
                </a>
              </div>
            ) : (
              <>
                {/* OTP Inputs */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 text-center">
                    Authenticator Code
                  </label>
                  <div className="flex items-center justify-center" id="admin-mfa-inputs" dir="ltr">
                    <InputOTP
                      maxLength={CODE_LENGTH}
                      value={code}
                      onChange={(val) => {
                        setCode(val);
                        setError('');
                        if (val.length === CODE_LENGTH) submitCode(val);
                      }}
                      disabled={isLoading}
                      autoFocus
                    >
                      <InputOTPGroup className="gap-2.5">
                        {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-150 ${
                              error
                                ? 'border-destructive/70 text-destructive'
                                : code.length > i && !error
                                ? 'border-primary text-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_12%,transparent)]'
                                : 'border-border focus-visible:border-ring'
                            }`}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-destructive animate-fade-in">
                      <RiAlertLine size={13} />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                {/* Timer hint */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <RiTimeLine size={12} />
                  <span>Codes refresh every 30 seconds in your authenticator app</span>
                </div>

                {/* Submit button */}
                <button
                  id="admin-mfa-submit"
                  onClick={() => submitCode(code)}
                  disabled={code.length !== CODE_LENGTH || isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, var(--vault-unlocked)))', color: 'var(--primary-foreground)' }}
                >
                  {isLoading ? (
                    <><RiRefreshLine size={16} className="animate-spin" /> Verifying…</>
                  ) : (
                    <><RiCheckDoubleLine size={16} /> Verify &amp; Enter Dashboard</>
                  )}
                </button>
              </>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Sign out */}
            <button
              id="admin-mfa-signout"
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-muted-foreground border border-border hover:text-foreground hover:bg-muted/40 transition-all"
            >
              <RiArrowLeftLine size={15} />
              Sign out
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] text-muted-foreground mt-5 leading-relaxed">
          This is a sensitive area. All access attempts are logged. <br />
          Session expires in 2 hours after verification.
        </p>
      </div>
    </div>
  );
}
