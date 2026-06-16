import { UserAvatar } from '@/components/shared/UserAvatar';
import { RiAlertLine, RiCheckLine, RiCloseLine } from 'react-icons/ri';
import { AdminUser, ConfirmState } from '@/types/admin';

export function ConfirmModal({
  confirm,
  onConfirm,
  onCancel,
  t,
}: {
  confirm: ConfirmState;
  onConfirm: () => void;
  onCancel: () => void;
  t: any; // Using any for t to avoid complex useTranslations generic typing here, or we can type it if needed
}) {
  const { type, user } = confirm;

  const isDanger = type === 'delete' || type === 'lock' || type === 'removeAdmin';

  const titleKey = {
    delete: 'modals.deleteTitle',
    lock: 'modals.lockTitle',
    unlock: 'modals.unlockTitle',
    makeAdmin: 'modals.makeAdminTitle',
    removeAdmin: 'modals.removeAdminTitle',
    save: 'modals.saveTitle',
  }[type];

  const bodyKey = {
    delete: 'modals.deleteBody',
    lock: 'modals.lockBody',
    unlock: 'modals.unlockBody',
    makeAdmin: 'modals.makeAdminBody',
    removeAdmin: 'modals.removeAdminBody',
    save: 'modals.saveBody',
  }[type];

  const subKey = {
    delete: 'modals.deleteSub',
    lock: 'modals.lockSub',
    unlock: 'modals.unlockSub',
    makeAdmin: 'modals.makeAdminSub',
    removeAdmin: 'modals.removeAdminSub',
    save: 'modals.saveSub',
  }[type];

  const confirmKey = {
    delete: 'modals.confirmDelete',
    lock: 'modals.confirmLock',
    unlock: 'modals.confirmUnlock',
    makeAdmin: 'modals.confirmMakeAdmin',
    removeAdmin: 'modals.confirmRemoveAdmin',
    save: 'modals.confirmSave',
  }[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'modal-in 0.2s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDanger ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              {isDanger ? <RiAlertLine size={16} /> : <RiCheckLine size={16} />}
            </div>
            <span className={`text-base font-bold ${isDanger ? 'text-destructive' : 'text-foreground'}`}>
              {t(titleKey)}
            </span>
          </div>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={onCancel}
          >
            <RiCloseLine size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 text-center">
          <UserAvatar user={user} className="w-14 h-14 border-2 border-border mx-auto mb-4" />
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {t(bodyKey, { name: user.name })}
          </p>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {t(subKey)}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 pb-5">
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-muted text-muted-foreground border border-border hover:text-foreground hover:bg-muted/80 transition-all"
            onClick={onCancel}
          >
            {t('modals.cancel')}
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:-translate-y-px active:translate-y-0 ${
              isDanger
                ? 'bg-destructive text-destructive-foreground hover:opacity-90'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
            onClick={onConfirm}
          >
            {t(confirmKey)}
          </button>
        </div>
      </div>
    </div>
  );
}
