import { UserAvatar } from '@/components/shared/UserAvatar';
import { RiCloseLine, RiMailLine, RiShieldCheckLine } from 'react-icons/ri';
import { AdminUser, UserStatus } from '@/types/admin';
import { useLocale } from 'next-intl';

function fmtDate(d: string | null, locale: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ViewModal({
  user,
  onClose,
  t,
}: {
  user: AdminUser;
  onClose: () => void;
  t: any;
}) {
  const locale = useLocale();
  const statusColors: Record<UserStatus, { color: string; bg: string }> = {
    active: { color: 'var(--vault-unlocked)', bg: 'color-mix(in srgb, var(--vault-unlocked) 12%, transparent)' },
    locked: { color: 'var(--vault-locked)', bg: 'color-mix(in srgb, var(--vault-locked) 12%, transparent)' },
    inactive: { color: 'var(--muted-foreground)', bg: 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'modal-in 0.2s ease', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <span className="text-base font-bold text-foreground">{t('modals.viewTitle')}</span>
          <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={onClose}>
            <RiCloseLine size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto">
          {/* Profile row */}
          <div className="flex items-center gap-4 pb-4 mb-4 border-b border-border">
            <UserAvatar user={user} className="w-14 h-14 border-2 border-border shrink-0" />
            <div>
              <h3 className="text-base font-bold text-foreground">{user.name}</h3>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <RiMailLine size={12} /> {user.email}
              </p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <span className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}>
                  {t(`role.${user.role}`)}
                </span>
                <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                  style={{ background: statusColors[user.status].bg, color: statusColors[user.status].color }}>
                  {t(`status.${user.status}`)}
                </span>
                {user.mfaEnabled && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'color-mix(in srgb, var(--vault-unlocked) 12%, transparent)', color: 'var(--vault-unlocked)' }}>
                    <RiShieldCheckLine size={10} /> 2FA ON
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: t('profile.userId'), value: user.id },
              { label: t('profile.language'), value: user.preferredLocale.toUpperCase() },
              { label: t('profile.secrets'), value: user.secretsCount },
              { label: t('profile.notifications'), value: user.notificationsEnabled ? t('profile.enabled') : t('profile.disabled') },
              { label: t('profile.joined'), value: fmtDate(user.joinedAt, locale) },
              { label: t('profile.lastActive'), value: fmtDate(user.lastActive, locale) },
            ].map((row) => (
              <div key={row.label} className="bg-muted/30 border border-border/50 rounded-lg px-3 py-2.5">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{row.label}</span>
                <span className="block text-sm font-medium text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 pb-5 pt-3 border-t border-border">
          <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-muted text-muted-foreground border border-border hover:text-foreground hover:bg-muted/80 transition-all" onClick={onClose}>
            {t('modals.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
