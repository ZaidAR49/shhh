import { useState } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { RiAlertLine, RiCheckLine, RiCloseLine, RiRefreshLine, RiShieldKeyholeLine } from 'react-icons/ri';

const MFA_DIGITS = 6;

export function MfaReVerifyModal({
  title,
  description,
  onVerified,
  onCancel,
}: {
  title: string;
  description: string;
  onVerified: (code: string) => Promise<string | void> | void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (codeToSubmit: string) => {
    if (codeToSubmit.length !== MFA_DIGITS) return;
    setIsChecking(true);
    setError('');
    try {
      const err = await onVerified(codeToSubmit);
      if (typeof err === 'string') {
        setError(err);
        setCode('');
      }
    } catch {
      setError('An error occurred. Please try again.');
      setCode('');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'modal-in 0.2s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 60%, var(--vault-unlocked)))' }} />

        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>
              <RiShieldKeyholeLine size={16} />
            </div>
            <span className="text-sm font-bold text-foreground">{title}</span>
          </div>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={onCancel}
          >
            <RiCloseLine size={15} />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>

          <div className="flex items-center justify-center mb-4" dir="ltr">
            <InputOTP
              maxLength={MFA_DIGITS}
              value={code}
              onChange={(val) => {
                setCode(val);
                setError('');
                if (val.length === MFA_DIGITS) handleSubmit(val);
              }}
              disabled={isChecking}
              autoFocus
            >
              <InputOTPGroup className="gap-2.5">
                {Array.from({ length: MFA_DIGITS }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className={`w-10 h-12 text-center text-lg font-bold rounded-xl border-2 transition-all duration-150 ${
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

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-destructive">
              <RiAlertLine size={12} />
              {error}
            </div>
          )}

          <button
            id="mfa-reverify-submit"
            onClick={() => handleSubmit(code)}
            disabled={code.length !== MFA_DIGITS || isChecking}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {isChecking ? <><RiRefreshLine size={14} className="animate-spin" /> Verifying…</> : <><RiCheckLine size={14} /> Confirm</>}
          </button>
        </div>
      </div>
    </div>
  );
}
