import { useState } from 'react';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { RiCheckLine, RiCloseLine } from 'react-icons/ri';
import { AdminUser, UserRole, UserStatus } from '@/types/admin';

export function EditModal({
  user,
  onClose,
  onRequestSave,
  t,
  simulatedRole,
}: {
  user: AdminUser;
  onClose: () => void;
  onRequestSave: (draft: AdminUser) => void;
  t: any;
  simulatedRole: UserRole;
}) {
  const [draft, setDraft] = useState<AdminUser>({ ...user });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'modal-in 0.2s ease', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <span className="text-base font-bold text-foreground">{t('modals.editTitle')}</span>
          <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={onClose}>
            <RiCloseLine size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto">
          {/* Avatar row */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
            <UserAvatar user={draft} className="w-11 h-11 border-2 border-border shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">{draft.name}</p>
              <p className="text-xs text-muted-foreground">{draft.email}</p>
            </div>
          </div>

          {/* Form grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t('form.displayName')}
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t('form.email')}
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t('form.role')}
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-ring transition-colors cursor-pointer"
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value as UserRole })}
                disabled={simulatedRole !== 'admin'}
              >
                <option value="user">{t('role.user')}</option>
                {simulatedRole === 'admin' && (
                  <>
                    <option value="viewer">{t('role.viewer')}</option>
                    <option value="supervisor">{t('role.supervisor')}</option>
                    <option value="admin">{t('role.admin')}</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t('form.status')}
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-ring transition-colors cursor-pointer"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as UserStatus })}
              >
                <option value="active">{t('status.active')}</option>
                <option value="locked">{t('status.locked')}</option>
                <option value="inactive">{t('status.inactive')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t('form.language')}
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-ring transition-colors cursor-pointer"
                value={draft.preferredLocale}
                onChange={(e) => setDraft({ ...draft, preferredLocale: e.target.value as 'en' | 'ar' })}
              >
                <option value="en">{t('form.english')}</option>
                <option value="ar">{t('form.arabic')}</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                  checked={draft.mfaEnabled}
                  onChange={(e) => setDraft({ ...draft, mfaEnabled: e.target.checked })}
                />
                <span className="text-sm text-foreground">{t('form.mfaEnabled')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                  checked={draft.notificationsEnabled}
                  onChange={(e) => setDraft({ ...draft, notificationsEnabled: e.target.checked })}
                />
                <span className="text-sm text-foreground">{t('form.notificationsEnabled')}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 pb-5 pt-3 border-t border-border">
          <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-muted text-muted-foreground border border-border hover:text-foreground hover:bg-muted/80 transition-all" onClick={onClose}>
            {t('modals.cancel')}
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all"
            onClick={() => onRequestSave(draft)}
          >
            <RiCheckLine size={14} />
            {t('modals.saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}
