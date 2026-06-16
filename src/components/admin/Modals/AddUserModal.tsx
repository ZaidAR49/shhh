import { useState } from 'react';
import { RiAddLine, RiAlertLine, RiCloseLine, RiMailLine, RiRefreshLine, RiShieldKeyholeLine } from 'react-icons/ri';
import { AdminUser, UserRole } from '@/types/admin';
import { MfaReVerifyModal } from './MfaReVerifyModal';

export function AddUserModal({
  onClose,
  onCreated,
  t,
}: {
  onClose: () => void;
  onCreated: (user: AdminUser) => void;
  t: any;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingMfa, setPendingMfa] = useState(false);

  const isAdminTier = ['admin', 'supervisor', 'viewer'].includes(role);

  const handleSubmit = async (mfaCode?: string) => {
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    // If admin-tier role and no MFA code yet, show the MFA gate
    if (isAdminTier && !mfaCode) {
      setPendingMfa(true);
      return;
    }
    setIsLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (mfaCode) headers['x-admin-mfa-token'] = mfaCode;
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: name.trim() || undefined, email: email.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create user.');
        return;
      }
      const u = data.user;
      onCreated({
        id: u.id,
        name: u.name || 'Unknown',
        email: u.email,
        image: `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.name || u.email}&backgroundColor=b6e3f4`,
        role: u.role,
        status: 'active',
        secretsCount: 0,
        mfaEnabled: false,
        preferredLocale: u.preferredLocale || 'en',
        notificationsEnabled: true,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });
      onClose();
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {pendingMfa && (
        <MfaReVerifyModal
          title="Confirm Admin Creation"
          description="Creating an admin-tier account is a sensitive operation. Enter your 6-digit authenticator code to confirm."
          onVerified={(code) => { setPendingMfa(false); handleSubmit(code); }}
          onCancel={() => setPendingMfa(false)}
        />
      )}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          style={{ animation: 'modal-in 0.2s ease' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <RiAddLine size={16} />
              </div>
              <span className="text-base font-bold text-foreground">Create User</span>
            </div>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={onClose}
            >
              <RiCloseLine size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 flex flex-col gap-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Create a user account manually. The user can sign in via their email through any linked OAuth provider (Google, GitHub).
            </p>

            {error && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                <RiAlertLine size={14} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Display Name <span className="normal-case font-normal">(optional)</span>
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                id="add-user-name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Email <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <RiMailLine size={14} className="absolute inset-s-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  className="w-full ps-9 pe-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="add-user-email"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Role
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-ring transition-colors cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="admin">{t('role.admin')}</option>
                <option value="supervisor">{t('role.supervisor')}</option>
                <option value="viewer">{t('role.viewer')}</option>
                <option value="user">{t('role.user')}</option>
              </select>
              {isAdminTier && (
                <p className="flex items-center gap-1 mt-1.5 text-[10px] text-primary">
                  <RiShieldKeyholeLine size={11} />
                  Admin-tier role — you will be asked for your 2FA code to confirm.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 pb-5 pt-3 border-t border-border">
            <button
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-muted text-muted-foreground border border-border hover:text-foreground hover:bg-muted/80 transition-all"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-60 disabled:pointer-events-none"
              onClick={() => handleSubmit()}
              disabled={isLoading}
              id="add-user-submit"
            >
              {isLoading ? <RiRefreshLine size={14} className="animate-spin" /> : <RiAddLine size={14} />}
              {isLoading ? 'Creating...' : isAdminTier ? 'Continue →' : 'Create User'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
