'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Bar, BarChart, XAxis, Pie, PieChart, Cell, Label } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  RiShieldCheckLine,
  RiGroupLine,
  RiLockLine,
  RiKeyLine,
  RiSearchLine,
  RiFilterLine,
  RiDeleteBinLine,
  RiEditLine,
  RiAdminLine,
  RiLockUnlockLine,
  RiBarChartLine,
  RiUserLine,
  RiShieldLine,
  RiAlertLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiEyeLine,
  RiRefreshLine,
  RiCalendarLine,
  RiMailLine,
  RiGlobeLine,
  RiShieldStarLine,
} from 'react-icons/ri';

// ─── Mock Data ─────────────────────────────────────────────────────────────────

type UserRole = 'admin' | 'supervisor' | 'viewer' | 'user';
type UserStatus = 'active' | 'locked' | 'inactive';

interface MockUser {
  id: string;
  name: string;
  email: string;
  image: string;
  role: UserRole;
  status: UserStatus;
  secretsCount: number;
  mfaEnabled: boolean;
  preferredLocale: 'en' | 'ar';
  notificationsEnabled: boolean;
  joinedAt: string;
  lastActive: string;
}

const MOCK_USERS: MockUser[] = [
  {
    id: 'usr_001',
    name: 'Zaid Al-Rashidi',
    email: 'zaid.rashidi@gmail.com',
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Zaid&backgroundColor=b6e3f4',
    role: 'admin',
    status: 'active',
    secretsCount: 42,
    mfaEnabled: true,
    preferredLocale: 'ar',
    notificationsEnabled: true,
    joinedAt: '2024-01-15',
    lastActive: '2026-06-14',
  },
  {
    id: 'usr_002',
    name: 'Sara Al-Khalidi',
    email: 'sara.khalidi@outlook.com',
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sara&backgroundColor=ffd5dc',
    role: 'supervisor',
    status: 'active',
    secretsCount: 18,
    mfaEnabled: true,
    preferredLocale: 'en',
    notificationsEnabled: true,
    joinedAt: '2024-03-22',
    lastActive: '2026-06-13',
  },
  {
    id: 'usr_003',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@proton.me',
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ahmed&backgroundColor=c0aede',
    role: 'user',
    status: 'locked',
    secretsCount: 7,
    mfaEnabled: false,
    preferredLocale: 'ar',
    notificationsEnabled: false,
    joinedAt: '2024-05-10',
    lastActive: '2026-05-28',
  },
  {
    id: 'usr_004',
    name: 'Lina Mansour',
    email: 'lina.m@company.io',
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Lina&backgroundColor=d1f4d4',
    role: 'viewer',
    status: 'active',
    secretsCount: 31,
    mfaEnabled: true,
    preferredLocale: 'en',
    notificationsEnabled: true,
    joinedAt: '2024-07-05',
    lastActive: '2026-06-14',
  },
  {
    id: 'usr_005',
    name: 'Omar Farouk',
    email: 'omar.farouk@gmail.com',
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Omar&backgroundColor=ffd5a0',
    role: 'user',
    status: 'inactive',
    secretsCount: 3,
    mfaEnabled: false,
    preferredLocale: 'ar',
    notificationsEnabled: false,
    joinedAt: '2024-09-18',
    lastActive: '2025-11-02',
  },
  {
    id: 'usr_006',
    name: 'Nour Jabr',
    email: 'nour.jabr@hotmail.com',
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Nour&backgroundColor=c0e8ff',
    role: 'user',
    status: 'active',
    secretsCount: 24,
    mfaEnabled: true,
    preferredLocale: 'en',
    notificationsEnabled: true,
    joinedAt: '2024-11-03',
    lastActive: '2026-06-12',
  },
  {
    id: 'usr_007',
    name: 'Karim Saleh',
    email: 'k.saleh@enterprise.com',
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Karim&backgroundColor=ffeaa0',
    role: 'admin',
    status: 'active',
    secretsCount: 56,
    mfaEnabled: true,
    preferredLocale: 'en',
    notificationsEnabled: true,
    joinedAt: '2024-02-01',
    lastActive: '2026-06-14',
  },
  {
    id: 'usr_008',
    name: 'Dina Ramadan',
    email: 'dina.ramadan@yahoo.com',
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Dina&backgroundColor=e8c0ff',
    role: 'user',
    status: 'locked',
    secretsCount: 12,
    mfaEnabled: false,
    preferredLocale: 'ar',
    notificationsEnabled: false,
    joinedAt: '2025-01-14',
    lastActive: '2026-04-20',
  },
  {
    id: 'usr_009',
    name: 'Faris Al-Amin',
    email: 'faris.amin@tech.dev',
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Faris&backgroundColor=b6f4d4',
    role: 'user',
    status: 'active',
    secretsCount: 9,
    mfaEnabled: true,
    preferredLocale: 'en',
    notificationsEnabled: true,
    joinedAt: '2025-03-30',
    lastActive: '2026-06-10',
  },
  {
    id: 'usr_010',
    name: 'Hana Qasim',
    email: 'hana.q@startup.co',
    image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Hana&backgroundColor=ffd5f4',
    role: 'user',
    status: 'active',
    secretsCount: 15,
    mfaEnabled: false,
    preferredLocale: 'ar',
    notificationsEnabled: true,
    joinedAt: '2025-06-01',
    lastActive: '2026-06-11',
  },
];

const MONTHLY_SIGNUPS = [
  { month: 'Jan', count: 2 },
  { month: 'Feb', count: 1 },
  { month: 'Mar', count: 1 },
  { month: 'Apr', count: 0 },
  { month: 'May', count: 1 },
  { month: 'Jun', count: 2 },
  { month: 'Jul', count: 1 },
  { month: 'Aug', count: 0 },
  { month: 'Sep', count: 1 },
  { month: 'Oct', count: 0 },
  { month: 'Nov', count: 1 },
  { month: 'Dec', count: 0 },
];

const SECRET_TYPE_BREAKDOWN = [
  { type: 'Password', count: 68, color: 'var(--accent)' },
  { type: 'API Key', count: 45, color: '#8b5cf6' },
  { type: 'Bank Account', count: 32, color: '#06b6d4' },
  { type: 'Secure Note', count: 28, color: 'var(--vault-unlocked)' },
  { type: 'Identity', count: 19, color: 'var(--vault-warning)' },
  { type: 'Wi-Fi', count: 14, color: 'var(--vault-locked)' },
  { type: 'Others', count: 11, color: 'var(--muted-foreground)' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'overview' | 'users' | 'admins';
type ConfirmActionType = 'delete' | 'lock' | 'unlock' | 'makeAdmin' | 'removeAdmin' | 'save';

interface ConfirmState {
  type: ConfirmActionType;
  user: MockUser;
  editDraft?: MockUser; // only for 'save'
}

function fmtDate(d: string, locale: string) {
  return new Date(d).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accentColor,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accentColor: string;
  trend?: { value: string; up: boolean };
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border bg-card p-5 flex items-start gap-4 transition-all duration-150 hover:-translate-y-px hover:shadow-md group"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 inset-x-0 h-0.5 opacity-70"
        style={{ background: accentColor }}
      />
      {/* Icon bubble */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `color-mix(in srgb, ${accentColor} 15%, transparent)`, color: accentColor }}
      >
        <Icon size={18} />
      </div>
      {/* Body */}
      <div className="flex-1 min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{label}</span>
        <span className="block text-2xl font-bold text-foreground leading-tight tracking-tight">{value}</span>
        {sub && <span className="block text-xs text-muted-foreground mt-1">{sub}</span>}
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] font-semibold mt-1.5 px-1.5 py-0.5 rounded ${
              trend.up
                ? 'bg-vault-unlocked/10 text-vault-unlocked'
                : 'bg-vault-locked/10 text-vault-locked'
            }`}
          >
            {trend.up ? <RiArrowUpLine size={11} /> : <RiArrowDownLine size={11} />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────

const chartConfigBar = {
  count: { label: "Signups", color: "var(--accent)" },
};

function MiniBarChart({ data }: { data: typeof MONTHLY_SIGNUPS }) {
  return (
    <div className="h-40 w-full mt-2">
      <ChartContainer config={chartConfigBar} className="h-full w-full">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} fontSize={10} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

// ─── Secret Donut ─────────────────────────────────────────────────────────────

const chartConfigPie = {
  count: { label: "Secrets" },
};

function SecretDonut({ data, secretsLabel }: { data: typeof SECRET_TYPE_BREAKDOWN; secretsLabel: string }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="h-44 w-44">
        <ChartContainer config={chartConfigPie} className="h-full w-full aspect-square">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="type"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {total}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-[10px] uppercase tracking-wider">
                          {secretsLabel}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
      <div className="flex-1 flex flex-col gap-1.5 w-full">
        {data.map((d) => (
          <div key={d.type} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
            <span className="text-muted-foreground flex-1">{d.type}</span>
            <span className="font-semibold text-foreground">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  confirm,
  onConfirm,
  onCancel,
  t,
}: {
  confirm: ConfirmState;
  onConfirm: () => void;
  onCancel: () => void;
  t: ReturnType<typeof useTranslations<'admin'>>;
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
  }[type] as Parameters<typeof t>[0];

  const bodyKey = {
    delete: 'modals.deleteBody',
    lock: 'modals.lockBody',
    unlock: 'modals.unlockBody',
    makeAdmin: 'modals.makeAdminBody',
    removeAdmin: 'modals.removeAdminBody',
    save: 'modals.saveBody',
  }[type] as Parameters<typeof t>[0];

  const subKey = {
    delete: 'modals.deleteSub',
    lock: 'modals.lockSub',
    unlock: 'modals.unlockSub',
    makeAdmin: 'modals.makeAdminSub',
    removeAdmin: 'modals.removeAdminSub',
    save: 'modals.saveSub',
  }[type] as Parameters<typeof t>[0];

  const confirmKey = {
    delete: 'modals.confirmDelete',
    lock: 'modals.confirmLock',
    unlock: 'modals.confirmUnlock',
    makeAdmin: 'modals.confirmMakeAdmin',
    removeAdmin: 'modals.confirmRemoveAdmin',
    save: 'modals.confirmSave',
  }[type] as Parameters<typeof t>[0];

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
          <img src={user.image} alt={user.name} className="w-14 h-14 rounded-full border-2 border-border mx-auto mb-4" />
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

// ─── View Modal ───────────────────────────────────────────────────────────────

function ViewModal({
  user,
  onClose,
  t,
}: {
  user: MockUser;
  onClose: () => void;
  t: ReturnType<typeof useTranslations<'admin'>>;
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
            <img src={user.image} alt={user.name} className="w-14 h-14 rounded-full border-2 border-border flex-shrink-0" />
            <div>
              <h3 className="text-base font-bold text-foreground">{user.name}</h3>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <RiMailLine size={12} /> {user.email}
              </p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <span className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}>
                  {t(`role.${user.role}` as Parameters<typeof t>[0])}
                </span>
                <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                  style={{ background: statusColors[user.status].bg, color: statusColors[user.status].color }}>
                  {t(`status.${user.status}` as Parameters<typeof t>[0])}
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

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  user,
  onClose,
  onRequestSave,
  t,
  simulatedRole,
}: {
  user: MockUser;
  onClose: () => void;
  onRequestSave: (draft: MockUser) => void;
  t: ReturnType<typeof useTranslations<'admin'>>;
  simulatedRole: UserRole;
}) {
  const [draft, setDraft] = useState<MockUser>({ ...user });

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
            <img src={draft.image} alt={draft.name} className="w-11 h-11 rounded-full border-2 border-border flex-shrink-0" />
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

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl animate-fade-in ${
        type === 'success'
          ? 'bg-card border-vault-unlocked/30 text-vault-unlocked'
          : 'bg-card border-destructive/30 text-destructive'
      }`}
    >
      {type === 'success' ? <RiCheckLine size={16} /> : <RiAlertLine size={16} />}
      {msg}
    </div>
  );
}

// ─── User Table ───────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<UserStatus, { color: string; bg: string }> = {
  active: { color: 'var(--vault-unlocked)', bg: 'color-mix(in srgb, var(--vault-unlocked) 12%, transparent)' },
  locked: { color: 'var(--vault-locked)', bg: 'color-mix(in srgb, var(--vault-locked) 12%, transparent)' },
  inactive: { color: 'var(--muted-foreground)', bg: 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)' },
};

function UserTable({
  users,
  sortBy,
  sortDir,
  onToggleSort,
  onView,
  onEdit,
  onRequestLockToggle,
  onRequestAdminToggle,
  onRequestDelete,
  t,
  simulatedRole,
}: {
  users: MockUser[];
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onToggleSort: (col: 'name' | 'joinedAt' | 'secretsCount' | 'lastActive') => void;
  onView: (u: MockUser) => void;
  onEdit: (u: MockUser) => void;
  onRequestLockToggle: (u: MockUser) => void;
  onRequestAdminToggle: (u: MockUser) => void;
  onRequestDelete: (u: MockUser) => void;
  t: ReturnType<typeof useTranslations<'admin'>>;
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
                      <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full border-2 border-border flex-shrink-0" />
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
                      {t(`role.${user.role}` as Parameters<typeof t>[0])}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-5 py-4">
                    <span
                      className="inline-flex text-[11px] font-bold px-3 py-1 rounded-full capitalize"
                      style={{ background: STATUS_STYLE[user.status].bg, color: STATUS_STYLE[user.status].color }}
                    >
                      {t(`status.${user.status}` as Parameters<typeof t>[0])}
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

                      {/* Only admins can manage admin roles */}
                      {simulatedRole === 'admin' && (
                        <ActionBtn
                          title={user.role === 'admin' ? t('actions.removeAdmin') : t('actions.makeAdmin')}
                          onClick={() => onRequestAdminToggle(user)}
                          id={`action-admin-${user.id}`}
                          active={user.role === 'admin'}
                          activeClass="bg-primary/10 text-primary border-primary/20"
                          hoverClass="hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                        >
                          <RiAdminLine size={16} />
                        </ActionBtn>
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

// Small reusable action button
function ActionBtn({
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

// ─── Main Dashboard Component ─────────────────────────────────────────────────

export default function AdminDashboard() {
  const t = useTranslations('admin');

  // Simulated active user role (to showcase RBAC functionality)
  const [simulatedRole, setSimulatedRole] = useState<UserRole>('admin');

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);

  // Filter / sort state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | UserStatus>('all');
  const [filterMfa, setFilterMfa] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'joinedAt' | 'secretsCount' | 'lastActive'>('joinedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Modal state
  const [viewUser, setViewUser] = useState<MockUser | null>(null);
  const [editUser, setEditUser] = useState<MockUser | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Analytics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const lockedUsers = users.filter((u) => u.status === 'locked').length;
  const adminUsers = users.filter((u) => u.role === 'admin' || u.role === 'supervisor').length;
  const mfaRate = Math.round((users.filter((u) => u.mfaEnabled).length / totalUsers) * 100);
  const totalSecrets = users.reduce((s, u) => s + u.secretsCount, 0);
  const avgSecrets = (totalSecrets / totalUsers).toFixed(1);

  // Filtered + sorted list for the current tab
  const filteredUsers = useMemo(() => {
    let list = [...users];
    
    // Tab filter
    if (activeTab === 'users') {
      list = list.filter((u) => u.role === 'user');
    } else if (activeTab === 'admins') {
      list = list.filter((u) => u.role === 'admin' || u.role === 'supervisor' || u.role === 'viewer');
    }
    
    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.includes(q));
    }
    // Status filter
    if (filterStatus !== 'all') list = list.filter((u) => u.status === filterStatus);
    // MFA filter
    if (filterMfa !== 'all') list = list.filter((u) => (filterMfa === 'enabled' ? u.mfaEnabled : !u.mfaEnabled));
    // Sort
    list.sort((a, b) => {
      let av: string | number = a[sortBy] as string | number;
      let bv: string | number = b[sortBy] as string | number;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
    });
    return list;
  }, [users, activeTab, search, filterStatus, filterMfa, sortBy, sortDir]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('desc'); }
  };

  // ── Action handlers (called AFTER confirmation) ──────────────────────────────

  const executeConfirm = () => {
    if (!confirmState) return;
    const { type, user, editDraft } = confirmState;

    if (type === 'delete') {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      showToast(t('toast.userDeleted', { name: user.name }));
    } else if (type === 'lock') {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: 'locked' } : u));
      showToast(t('toast.userLocked', { name: user.name }));
    } else if (type === 'unlock') {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: 'active' } : u));
      showToast(t('toast.userUnlocked', { name: user.name }));
    } else if (type === 'makeAdmin') {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: 'admin' } : u));
      showToast(t('toast.madeAdmin', { name: user.name }));
    } else if (type === 'removeAdmin') {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: 'user' } : u));
      showToast(t('toast.removedAdmin', { name: user.name }));
    } else if (type === 'save' && editDraft) {
      setUsers((prev) => prev.map((u) => u.id === editDraft.id ? editDraft : u));
      showToast(t('toast.userUpdated', { name: editDraft.name }));
    }

    setConfirmState(null);
    setEditUser(null);
  };

  // ── Pending action request handlers ─────────────────────────────────────────

  const handleRequestLockToggle = (user: MockUser) => {
    setConfirmState({ type: user.status === 'locked' ? 'unlock' : 'lock', user });
  };

  const handleRequestAdminToggle = (user: MockUser) => {
    setConfirmState({ type: user.role === 'admin' ? 'removeAdmin' : 'makeAdmin', user });
  };

  const handleRequestDelete = (user: MockUser) => {
    setConfirmState({ type: 'delete', user });
  };

  const handleRequestSaveEdit = (draft: MockUser) => {
    setEditUser(null); // close edit modal
    setConfirmState({ type: 'save', user: draft, editDraft: draft });
  };

  // ─ Nav items based on simulated role
  const navItems = useMemo(() => {
    const items: { id: TabId; label: string; icon: React.ElementType }[] = [
      { id: 'overview', label: t('userTabs.overview'), icon: RiBarChartLine }
    ];
    
    if (simulatedRole === 'admin' || simulatedRole === 'supervisor') {
      items.push({ id: 'users', label: t('userTabs.regular'), icon: RiGroupLine });
    }
    
    if (simulatedRole === 'admin') {
      items.push({ id: 'admins', label: t('userTabs.admins'), icon: RiShieldStarLine });
    }
    
    return items;
  }, [t, simulatedRole]);

  // Ensure active tab doesn't get stuck on a restricted tab when switching roles
  if (simulatedRole === 'viewer' && activeTab !== 'overview') setActiveTab('overview');
  if (simulatedRole === 'supervisor' && activeTab === 'admins') setActiveTab('users');

  return (
    <>
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {viewUser && <ViewModal user={viewUser} onClose={() => setViewUser(null)} t={t} />}

      {editUser && (
        <EditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onRequestSave={handleRequestSaveEdit}
          t={t}
          simulatedRole={simulatedRole}
        />
      )}

      {confirmState && (
        <ConfirmModal
          confirm={confirmState}
          onConfirm={executeConfirm}
          onCancel={() => setConfirmState(null)}
          t={t}
        />
      )}

      {/* Main Layout ensures font inheritance from layout.tsx variables */}
      <div className="flex min-h-screen bg-background text-foreground">

        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0 sticky top-0 h-screen flex flex-col bg-card border-e border-border overflow-y-auto">
          {/* Logo matches main application */}
          <div className="flex items-center gap-4 px-8 py-6 border-b border-border min-h-[96px]">
            <Image
              src="/icon.png"
              alt="Shhh Logo"
              width={72}
              height={72}
              className="object-contain shrink-0"
              priority
            />
            <div>
              <span className="block text-3xl font-black tracking-tight text-foreground leading-none">
                {t('title').split(' ')[0]}
              </span>
              <span className="block text-xs font-bold tracking-[2px] uppercase text-primary mt-1.5">
                {t('badge')}
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
            {navItems.map(({ id, label, icon: Icon }) => {
              const count = id === 'users' 
                ? users.filter(u => u.role === 'user').length 
                : id === 'admins' 
                ? users.filter(u => u.role !== 'user').length 
                : null;

              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-semibold transition-all text-start ${
                    activeTab === id
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-transparent'
                  }`}
                >
                  <Icon size={20} />
                  <span className="flex-1">{label}</span>
                  {count !== null && (
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      activeTab === id ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer: Simulated Role Viewer */}
          <div className="px-4 py-5 border-t border-border bg-muted/10">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="https://api.dicebear.com/9.x/avataaars/svg?seed=Admin&backgroundColor=b6e3f4"
                alt="Active User"
                className="w-10 h-10 rounded-full border border-border flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {t(`role.${simulatedRole}` as Parameters<typeof t>[0])}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                  {t('dashboardAccess')}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          
          {/* Top Header with App Toggles */}
          <header className="flex items-center justify-between px-10 border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-10 min-h-[96px] flex-shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {activeTab === 'overview' ? t('header.overview') : t('header.users')}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activeTab === 'overview'
                  ? t('header.overviewSub')
                  : t('header.usersSub', { shown: filteredUsers.length, total: users.length })}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Simulate Role Dropdown */}
              <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-lg border border-border">
                <span className="text-xs font-medium text-muted-foreground">
                  {t('simulateRole')}:
                </span>
                <select
                  value={simulatedRole}
                  onChange={(e) => setSimulatedRole(e.target.value as UserRole)}
                  className="bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="admin">{t('role.admin')}</option>
                  <option value="supervisor">{t('role.supervisor')}</option>
                  <option value="viewer">{t('role.viewer')}</option>
                </select>
              </div>

              {/* Main App Toggles */}
              <div className="h-6 w-px bg-border mx-1" />
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-10 py-8 bg-muted/5">

            {/* ── OVERVIEW TAB ────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6 animate-fade-in w-full">

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <StatCard
                    icon={RiGroupLine}
                    label={t('overview.totalUsers')}
                    value={totalUsers}
                    sub={t('overview.totalUsersActive', { count: activeUsers })}
                    accentColor="var(--accent)"
                    trend={{ value: t('overview.trendThisMonth'), up: true }}
                  />
                  <StatCard
                    icon={RiKeyLine}
                    label={t('overview.totalSecrets')}
                    value={totalSecrets}
                    sub={t('overview.totalSecretsAvg', { avg: avgSecrets })}
                    accentColor="#8b5cf6"
                    trend={{ value: t('overview.trendSecretsWeek'), up: true }}
                  />
                  <StatCard
                    icon={RiShieldCheckLine}
                    label={t('overview.mfaAdoption')}
                    value={`${mfaRate}%`}
                    sub={t('overview.mfaAdoptionSub', { count: users.filter((u) => u.mfaEnabled).length })}
                    accentColor="var(--vault-unlocked)"
                    trend={{ value: t('overview.trendMfaMonth'), up: true }}
                  />
                  <StatCard
                    icon={RiLockLine}
                    label={t('overview.lockedAccounts')}
                    value={lockedUsers}
                    sub={t('overview.lockedAccountsSub')}
                    accentColor="var(--vault-locked)"
                    trend={{ value: t('overview.trendLockedWeek'), up: false }}
                  />
                  <StatCard
                    icon={RiShieldStarLine}
                    label={t('overview.administrators')}
                    value={adminUsers}
                    sub={t('overview.administratorsSub')}
                    accentColor="var(--vault-warning)"
                  />
                  <StatCard
                    icon={RiUserLine}
                    label={t('overview.inactiveUsers')}
                    value={users.filter((u) => u.status === 'inactive').length}
                    sub={t('overview.inactiveUsersSub')}
                    accentColor="var(--muted-foreground)"
                  />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-6">
                      <RiCalendarLine size={16} className="text-muted-foreground" />
                      {t('overview.monthlySignups')}
                    </h2>
                    <MiniBarChart data={MONTHLY_SIGNUPS} />
                  </div>
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-6">
                      <RiKeyLine size={16} className="text-muted-foreground" />
                      {t('overview.secretTypes')}
                    </h2>
                    <SecretDonut data={SECRET_TYPE_BREAKDOWN} secretsLabel={t('donut.secrets')} />
                  </div>
                </div>
              </div>
            )}

            {/* ── USERS / ADMINS TABS ─────────────────────────────────────── */}
            {(activeTab === 'users' || activeTab === 'admins') && (
              <div className="flex flex-col gap-4 animate-fade-in w-full">

                {/* Filters */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="relative w-full max-w-sm">
                    <RiSearchLine className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                    <input
                      className="w-full ps-10 pe-8 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all shadow-sm"
                      placeholder={t('filter.searchPlaceholder')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      id="admin-user-search"
                    />
                    {search && (
                      <button className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSearch('')}>
                        <RiCloseLine size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
                    <RiFilterLine size={16} />
                    <select
                      className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring shadow-sm transition-all cursor-pointer"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                      id="admin-filter-status"
                    >
                      <option value="all">{t('filter.allStatuses')}</option>
                      <option value="active">{t('status.active')}</option>
                      <option value="locked">{t('status.locked')}</option>
                      <option value="inactive">{t('status.inactive')}</option>
                    </select>
                    <select
                      className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring shadow-sm transition-all cursor-pointer"
                      value={filterMfa}
                      onChange={(e) => setFilterMfa(e.target.value as typeof filterMfa)}
                      id="admin-filter-mfa"
                    >
                      <option value="all">{t('filter.allMfa')}</option>
                      <option value="enabled">{t('filter.mfaOn')}</option>
                      <option value="disabled">{t('filter.mfaOff')}</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <UserTable
                  users={filteredUsers}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onToggleSort={toggleSort}
                  onView={setViewUser}
                  onEdit={setEditUser}
                  onRequestLockToggle={handleRequestLockToggle}
                  onRequestAdminToggle={handleRequestAdminToggle}
                  onRequestDelete={handleRequestDelete}
                  t={t}
                  simulatedRole={simulatedRole}
                />

                {/* Table footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2 pt-2">
                  <span>
                    {t('table.showing', { shown: filteredUsers.length, total: users.length })}
                  </span>
                  <span className="flex items-center gap-1.5 opacity-80 bg-muted px-2 py-1 rounded-md border border-border">
                    <RiAlertLine size={12} /> {t('allActionsMock')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
