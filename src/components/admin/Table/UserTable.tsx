import { UserAvatar } from '@/components/shared/UserAvatar';
import { RiAdminLine, RiArrowDownLine, RiArrowUpLine, RiDeleteBinLine, RiEditLine, RiEyeLine, RiLockUnlockLine, RiSearchLine, RiShieldCheckLine, RiShieldLine } from 'react-icons/ri';
import { AdminUser, UserRole, UserStatus } from '@/types/admin';
import { useLocale } from 'next-intl';

const STATUS_STYLE: Record<UserStatus, { color: string; bg: string }> = {
  active: { color: 'var(--vault-unlocked)', bg: 'color-mix(in srgb, var(--vault-unlocked) 12%, transparent)' },
  locked: { color: 'var(--vault-locked)', bg: 'color-mix(in srgb, var(--vault-locked) 12%, transparent)' },
  inactive: { color: 'var(--muted-foreground)', bg: 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)' },
};

function fmtDate(d: string | null, locale: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ActionBtn({
  children,
  title,
  onClick,
  id,
  hoverClass,
  active,
  activeClass,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  id: string;
  hoverClass: string;
  active?: boolean;
  activeClass?: string;
}) {
  return (
    <button
      id={id}
      title={title}
      onClick={onClick}
      className={`w-9 h-9 flex items-center justify-center rounded-md border text-muted-foreground transition-all duration-150 hover:scale-110 active:scale-100 ${
        active && activeClass ? `border-border/50 ${activeClass}` : `border-border bg-muted/10 ${hoverClass}`
      }`}
    >
      {children}
    </button>
  );
}

export function UserTable({
  users,
  sortBy,
  sortDir,
  onToggleSort,
  onView,
  onEdit,
  onRequestLockToggle,
  onRoleChange,
  onRequestDelete,
  t,
  simulatedRole,
}: {
  users: AdminUser[];
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onToggleSort: (col: 'name' | 'joinedAt' | 'secretsCount' | 'lastActive') => void;
  onView: (u: AdminUser) => void;
  onEdit: (u: AdminUser) => void;
  onRequestLockToggle: (u: AdminUser) => void;
  onRoleChange: (u: AdminUser, role: UserRole) => void;
  onRequestDelete: (u: AdminUser) => void;
  t: any;
  simulatedRole: UserRole;
}) {
  const locale = useLocale();
  const SortIcon = ({ col }: { col: string }) =>
    sortBy === col ? (
      sortDir === 'asc' ? <RiArrowUpLine size={10} /> : <RiArrowDownLine size={10} />
    ) : null;

  const thClass = "text-start text-xs font-bold text-muted-foreground uppercase tracking-widest px-5 py-4 border-b border-border whitespace-nowrap bg-muted/20";
  const sortThClass = `${thClass} cursor-pointer select-none hover:text-foreground transition-colors`;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" style={{ minWidth: 920 }}>
          <thead>
            <tr>
              <th className={sortThClass} onClick={() => onToggleSort('name')}>
                <span className="flex items-center gap-1">{t('table.user')} <SortIcon col="name" /></span>
              </th>
              <th className={thClass}>{t('table.role')}</th>
              <th className={thClass}>{t('table.status')}</th>
              <th className={thClass}>{t('table.mfa')}</th>
              <th className={sortThClass} onClick={() => onToggleSort('secretsCount')}>
                <span className="flex items-center gap-1">{t('table.secrets')} <SortIcon col="secretsCount" /></span>
              </th>
              <th className={thClass}>{t('table.lang')}</th>
              <th className={sortThClass} onClick={() => onToggleSort('joinedAt')}>
                <span className="flex items-center gap-1">{t('table.joined')} <SortIcon col="joinedAt" /></span>
              </th>
              <th className={sortThClass} onClick={() => onToggleSort('lastActive')}>
                <span className="flex items-center gap-1">{t('table.lastActive')} <SortIcon col="lastActive" /></span>
              </th>
              <th className={thClass}>{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16 text-muted-foreground">
                  <RiSearchLine size={24} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">{t('table.noResults')}</p>
                </td>
              </tr>
            ) : users.map((user) => {
              // Supervisors can only manage regular 'user' roles
              const canEdit = simulatedRole === 'admin' || (simulatedRole === 'supervisor' && user.role === 'user');
              const canDeleteLock = simulatedRole === 'admin' || (simulatedRole === 'supervisor' && user.role === 'user');

              return (
                <tr key={user.id} className="group border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  {/* User */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} className="w-10 h-10 border-2 border-border shrink-0" />
                      <div>
                        <p className="font-bold text-foreground text-sm leading-tight">{user.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Role */}
                  <td className="px-5 py-4">
                    <span
                      className="inline-flex text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                      style={
                        user.role === 'admin'
                          ? { background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }
                          : user.role === 'supervisor' || user.role === 'viewer'
                          ? { background: 'color-mix(in srgb, var(--vault-unlocked) 15%, transparent)', color: 'var(--vault-unlocked)' }
                          : { background: 'color-mix(in srgb, var(--muted-foreground) 12%, transparent)', color: 'var(--muted-foreground)' }
                      }
                    >
                      {t(`role.${user.role}`)}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-5 py-4">
                    <span
                      className="inline-flex text-[11px] font-bold px-3 py-1 rounded-full capitalize"
                      style={{ background: STATUS_STYLE[user.status].bg, color: STATUS_STYLE[user.status].color }}
                    >
                      {t(`status.${user.status}`)}
                    </span>
                  </td>
                  {/* MFA */}
                  <td className="px-5 py-4">
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md"
                      style={
                        user.mfaEnabled
                          ? { background: 'color-mix(in srgb, var(--vault-unlocked) 10%, transparent)', color: 'var(--vault-unlocked)' }
                          : { background: 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)', color: 'var(--muted-foreground)' }
                      }
                    >
                      {user.mfaEnabled ? <RiShieldCheckLine size={12} /> : <RiShieldLine size={12} />}
                      {user.mfaEnabled ? 'ON' : 'OFF'}
                    </span>
                  </td>
                  {/* Secrets */}
                  <td className="px-5 py-4 font-mono text-sm font-semibold text-foreground">{user.secretsCount}</td>
                  {/* Lang */}
                  <td className="px-5 py-4">
                    <span className="text-[11px] font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded tracking-wider">
                      {user.preferredLocale.toUpperCase()}
                    </span>
                  </td>
                  {/* Joined */}
                  <td className="px-5 py-4 text-xs text-muted-foreground">{fmtDate(user.joinedAt, locale)}</td>
                  {/* Last Active */}
                  <td className="px-5 py-4 text-xs text-muted-foreground">{fmtDate(user.lastActive, locale)}</td>
                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <ActionBtn
                        title={t('actions.view')}
                        onClick={() => onView(user)}
                        id={`action-view-${user.id}`}
                        hoverClass="hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                      >
                        <RiEyeLine size={16} />
                      </ActionBtn>
                      
                      {canEdit && (
                        <ActionBtn
                          title={t('actions.edit')}
                          onClick={() => onEdit(user)}
                          id={`action-edit-${user.id}`}
                          hoverClass="hover:bg-vault-warning/10 hover:text-vault-warning hover:border-vault-warning/30"
                        >
                          <RiEditLine size={16} />
                        </ActionBtn>
                      )}

                      {canDeleteLock && (
                        <ActionBtn
                          title={user.status === 'locked' ? t('actions.unlock') : t('actions.lock')}
                          onClick={() => onRequestLockToggle(user)}
                          id={`action-lock-${user.id}`}
                          active={user.status === 'locked'}
                          activeClass="bg-destructive/10 text-destructive border-destructive/20"
                          hoverClass="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        >
                          <RiLockUnlockLine size={16} />
                        </ActionBtn>
                      )}

                      {/* Only admins can change roles via dropdown */}
                      {simulatedRole === 'admin' && (
                        <div className="relative">
                          <select
                            id={`action-role-${user.id}`}
                            value={user.role}
                            onChange={(e) => onRoleChange(user, e.target.value as UserRole)}
                            className="appearance-none h-9 ps-2.5 pe-7 rounded-md border border-border bg-muted/10 text-muted-foreground text-xs font-semibold focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all cursor-pointer hover:bg-muted/30 hover:text-foreground"
                          >
                            <option value="user">{t('role.user')}</option>
                            <option value="viewer">{t('role.viewer')}</option>
                            <option value="supervisor">{t('role.supervisor')}</option>
                            <option value="admin">{t('role.admin')}</option>
                          </select>
                          <RiAdminLine size={11} className="absolute inset-e-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                        </div>
                      )}

                      {canDeleteLock && (
                        <ActionBtn
                          title={t('actions.delete')}
                          onClick={() => onRequestDelete(user)}
                          id={`action-delete-${user.id}`}
                          hoverClass="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        >
                          <RiDeleteBinLine size={16} />
                        </ActionBtn>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
