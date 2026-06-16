'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useSession } from '@/hooks/useSession';
import { UserAvatar } from '@/components/shared/UserAvatar';
import {
  RiGroupLine,
  RiShieldStarLine,
  RiShieldCheckLine,
  RiRefreshLine,
  RiCalendarLine,
  RiAddLine,
  RiLockLine,
  RiLogoutBoxRLine,
  RiSearchLine,
  RiFilterLine,
  RiCloseLine,
  RiBarChartLine,
  RiKeyLine,
  RiUserLine,
  RiShieldKeyholeLine,
  RiAlertLine,
  RiArrowUpLine,
  RiLineChartLine
} from 'react-icons/ri';

// Types
import { AdminUser, ConfirmState, TabId, UserRole, UserStatus } from '@/types/admin';

// Charts
import { StatCard } from '@/components/admin/Charts/StatCard';
import { MiniBarChart } from '@/components/admin/Charts/MiniBarChart';
import { SecretDonut } from '@/components/admin/Charts/SecretDonut';
import { AuthBarChart } from '@/components/admin/Charts/AuthBarChart';
import { PosthogBarChart, PosthogAreaChart } from '@/components/admin/Charts/PosthogCharts';
import { DemographicsDonut } from '@/components/admin/Charts/DemographicsDonut';

// Modals
import { ConfirmModal } from '@/components/admin/Modals/ConfirmModal';
import { ViewModal } from '@/components/admin/Modals/ViewModal';
import { EditModal } from '@/components/admin/Modals/EditModal';
import { AddUserModal } from '@/components/admin/Modals/AddUserModal';
import { MfaReVerifyModal } from '@/components/admin/Modals/MfaReVerifyModal';

// Table & Shared
import { UserTable } from '@/components/admin/Table/UserTable';
import { Toast } from '@/components/shared/Toast';

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const tSettings = useTranslations('settings');
  const locale = useLocale();
  const { session, lock } = useSession();

  // Active user role
  const simulatedRole = (session?.user?.role || 'viewer') as UserRole;

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter / sort state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | UserStatus>('all');
  const [filterMfa, setFilterMfa] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [sortBy, setSortBy] = useState<'name' | 'joinedAt' | 'secretsCount' | 'lastActive'>('joinedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Reset filters when activeTab changes
  useEffect(() => {
    setFilterRole('all');
    setFilterStatus('all');
    setFilterMfa('all');
    setSearch('');
  }, [activeTab]);

  // Modal state
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);

  // MFA gate — holds a pending sensitive action waiting for 2FA confirmation
  const [mfaGate, setMfaGate] = useState<{
    title: string;
    description: string;
    onVerified: (code: string) => Promise<string | void> | void;
  } | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [stats, setStats] = useState<{ secretTypes: { type: string; count: number; color: string }[]; analytics?: any } | null>(null);
  const [posthogData, setPosthogData] = useState<any>(null);

  useEffect(() => {
    const fetchUsersAndStats = async () => {
      try {
        const [usersRes, statsRes, posthogRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/stats'),
          fetch('/api/admin/analytics/posthog')
        ]);
        
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        } else {
          throw new Error('Failed to fetch users');
        }
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (posthogRes.ok) {
          const posthogResult = await posthogRes.json();
          if (posthogResult.success) {
            setPosthogData(posthogResult.data);
          }
        }
      } catch (err) {
        setToast({ msg: 'Failed to load dashboard data', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsersAndStats();
  }, []);

  // Analytics
  const totalUsers = stats?.analytics ? parseInt(stats.analytics.total_users || '0', 10) : users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const lockedUsers = stats?.analytics ? parseInt(stats.analytics.locked_accounts || '0', 10) : users.filter((u) => u.status === 'locked').length;
  const adminUsers = stats?.analytics ? parseInt(stats.analytics.total_admins || '0', 10) : users.filter((u) => u.role === 'admin' || u.role === 'supervisor').length;
  const mfaRate = stats?.analytics ? parseFloat(stats.analytics.pct_users_with_2fa || '0') : (totalUsers > 0 ? Math.round((users.filter((u) => u.mfaEnabled).length / totalUsers) * 100) : 0);
  const totalSecrets = stats?.analytics ? parseInt(stats.analytics.total_secrets || '0', 10) : users.reduce((s, u) => s + u.secretsCount, 0);
  const avgSecrets = stats?.analytics ? parseFloat(stats.analytics.avg_secrets_per_user || '0').toFixed(1) : (totalUsers > 0 ? (totalSecrets / totalUsers).toFixed(1) : '0');

  const staleSecrets = stats?.analytics ? parseInt(stats.analytics.stale_secrets_90_days || '0', 10) : 0;
  const highRiskUsers = stats?.analytics ? parseInt(stats.analytics.high_risk_users || '0', 10) : 0;

  const monthlySignups = useMemo(() => {
    const monthKeys = t.raw('overview.months') as string[];
    const counts = monthKeys.map((m: string) => ({ month: m, count: 0 }));
    const currentYear = new Date().getFullYear();
    
    users.forEach(user => {
      if (user.joinedAt) {
        const date = new Date(user.joinedAt);
        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth(); // 0-11
          if (monthIndex >= 0 && monthIndex < 12) {
            counts[monthIndex].count += 1;
          }
        }
      }
    });
    return counts;
  }, [users, t]);

  const secretTypesData = useMemo(() => {
    if (stats?.secretTypes && stats.secretTypes.length > 0) {
      return stats.secretTypes;
    }
    return [
      { type: t('overview.noSecretsFound'), count: 0, color: 'var(--muted-foreground)' }
    ];
  }, [stats, t]);

  const authMethodsData = useMemo(() => {
    if (!stats?.analytics) return [];
    return [
      { provider: 'Credentials', count: parseInt(stats.analytics.accounts_credentials || '0', 10), color: 'var(--primary)' },
      { provider: 'Google', count: parseInt(stats.analytics.accounts_google || '0', 10), color: '#ea4335' },
      { provider: 'GitHub', count: parseInt(stats.analytics.accounts_github || '0', 10), color: '#333333' }
    ].filter(d => d.count > 0);
  }, [stats]);

  const demographicsData = useMemo(() => {
    if (!stats?.analytics) return [];
    return [
      { label: t('overview.english'), count: parseInt(stats.analytics.users_english || '0', 10), color: '#3b82f6' },
      { label: t('overview.arabic'), count: parseInt(stats.analytics.users_arabic || '0', 10), color: '#10b981' }
    ].filter(d => d.count > 0);
  }, [stats, t]);

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
    // Role filter
    if (filterRole !== 'all') list = list.filter((u) => u.role === filterRole);
    // Sort
    list.sort((a, b) => {
      let av: string | number | null = a[sortBy];
      let bv: string | number | null = b[sortBy];
      if (av === null) av = '';
      if (bv === null) bv = '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
    });
    return list;
  }, [users, activeTab, search, filterStatus, filterMfa, filterRole, sortBy, sortDir]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('desc'); }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const isAdminTier = (role: UserRole) => ['admin', 'supervisor', 'viewer'].includes(role);

  // ── Action handlers (called AFTER confirmation, optionally with MFA code) ────

  const executeConfirm = async (mfaCode?: string): Promise<string | void> => {
    if (!confirmState) return;
    const { type, user, editDraft } = confirmState;

    try {
      if (type === 'delete') {
        // Admin-tier deletions require MFA — intercept and show gate if no code yet
        if (isAdminTier(user.role) && !mfaCode) {
          setMfaGate({
            title: 'Confirm Admin Deletion',
            description: `Deleting "${user.name}" (${user.role}) is irreversible. Enter your authenticator code to confirm.`,
            onVerified: async (code) => {
               const err = await executeConfirm(code);
               if (err) return err;
               setMfaGate(null);
            },
          });
          return;
        }
        const headers: Record<string, string> = {};
        if (mfaCode) headers['x-admin-mfa-token'] = mfaCode;
        const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE', headers });
        const data = await res.json();
        if (!res.ok) { 
            if (mfaCode) return data.error || 'Failed to delete';
            showToast(data.error || 'Failed to delete', 'error'); 
            return; 
        }
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        showToast(t('toast.userDeleted', { name: user.name }));
      } else if (type === 'lock') {
        const res = await fetch(`/api/admin/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'locked' }) });
        const data = await res.json();
        if (!res.ok) { showToast(data.error || 'Failed to lock', 'error'); return; }
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: 'locked' } : u));
        showToast(t('toast.userLocked', { name: user.name }));
      } else if (type === 'unlock') {
        const res = await fetch(`/api/admin/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
        const data = await res.json();
        if (!res.ok) { showToast(data.error || 'Failed to unlock', 'error'); return; }
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: 'active' } : u));
        showToast(t('toast.userUnlocked', { name: user.name }));
      } else if (type === 'save' && editDraft) {
        // Saving an edit that changes to/from admin tier requires MFA
        const roleChangingToAdmin = isAdminTier(editDraft.role) && !isAdminTier(users.find(u => u.id === editDraft.id)?.role ?? 'user' as UserRole);
        const roleChangingFromAdmin = !isAdminTier(editDraft.role) && isAdminTier(users.find(u => u.id === editDraft.id)?.role ?? 'user' as UserRole);
        if ((roleChangingToAdmin || roleChangingFromAdmin) && !mfaCode) {
          setMfaGate({
            title: 'Confirm Role Change',
            description: `Changing ${editDraft.name}'s role requires 2FA verification. Enter your authenticator code.`,
            onVerified: async (code) => {
               const err = await executeConfirm(code);
               if (err) return err;
               setMfaGate(null);
            },
          });
          return;
        }
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (mfaCode) headers['x-admin-mfa-token'] = mfaCode;
        const res = await fetch(`/api/admin/users/${editDraft.id}`, { method: 'PATCH', headers, body: JSON.stringify(editDraft) });
        const data = await res.json();
        if (!res.ok) { 
            if (mfaCode) return data.error || 'Failed to update';
            showToast(data.error || 'Failed to update', 'error'); 
            return; 
        }
        setUsers((prev) => prev.map((u) => u.id === editDraft.id ? editDraft : u));
        showToast(t('toast.userUpdated', { name: editDraft.name }));
      }
    } catch {
      if (mfaCode) return 'Action failed. Please try again.';
      showToast('Action failed. Please try again.', 'error');
    }

    setConfirmState(null);
    setEditUser(null);
  };

  // ── Pending action request handlers ─────────────────────────────────────────

  const handleRequestLockToggle = (user: AdminUser) => {
    setConfirmState({ type: user.status === 'locked' ? 'unlock' : 'lock', user });
  };

  const handleRoleChange = async (user: AdminUser, newRole: UserRole) => {
    if (user.role === newRole) return;
    // Admin-tier role changes require MFA confirmation
    const needsMfa = isAdminTier(user.role) || isAdminTier(newRole);
    if (needsMfa) {
      setMfaGate({
        title: 'Confirm Role Change',
        description: `Changing ${user.name}'s role from ${user.role} to ${newRole} requires 2FA verification.`,
        onVerified: async (code) => {
          try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'x-admin-mfa-token': code },
              body: JSON.stringify({ role: newRole }),
            });
            const data = await res.json();
            if (!res.ok) { return data.error || 'Failed to change role'; }
            setMfaGate(null);
            setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
            showToast(t('toast.userUpdated', { name: user.name }));
          } catch { return 'Failed to change role'; }
        },
      });
      return;
    }
    // Non-admin role changes proceed without MFA
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed to change role', 'error'); return; }
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
      showToast(t('toast.userUpdated', { name: user.name }));
    } catch {
      showToast('Failed to change role', 'error');
    }
  };

  const handleRequestDelete = (user: AdminUser) => {
    setConfirmState({ type: 'delete', user });
  };

  const handleRequestSaveEdit = (draft: AdminUser) => {
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

      {/* MFA re-verification gate for sensitive admin operations */}
      {mfaGate && (
        <MfaReVerifyModal
          title={mfaGate.title}
          description={mfaGate.description}
          onVerified={mfaGate.onVerified}
          onCancel={() => setMfaGate(null)}
        />
      )}

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onCreated={(newUser) => {
            setUsers((prev) => [newUser, ...prev]);
            showToast(`User "${newUser.email}" created successfully.`);
          }}
          t={t}
        />
      )}

      {/* Main Layout ensures font inheritance from layout.tsx variables */}
      <div className="flex min-h-screen bg-background text-foreground">

        {/* Sidebar */}
        <aside className="w-72 shrink-0 sticky top-0 h-screen flex flex-col bg-card border-e border-border overflow-y-auto">
          {/* Logo matches main application */}
          <Link href={`/${locale}`} className="flex items-center gap-4 px-8 py-6 border-b border-border min-h-[96px] hover:opacity-80 transition-opacity">
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
          </Link>

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

          <div className="p-4 mt-auto border-t border-border flex flex-col gap-2">
            <Link
              href={`/${locale}/vault`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm hover:shadow-md"
            >
              <RiShieldKeyholeLine size={18} />
              {t('nav.openVault')}
            </Link>
            <button
              onClick={lock}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm hover:shadow-md"
            >
              <RiLogoutBoxRLine size={18} />
              {tSettings('signOut')}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          
          {/* Top Header with App Toggles */}
          <header className="flex items-center justify-between px-10 border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-10 min-h-[96px] shrink-0">
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
              {session?.user && (
                <div className="flex items-center gap-3 pe-2">
                  <div className="text-end hidden sm:block">
                    <p className="text-sm font-bold text-foreground leading-tight">{session.user.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                  </div>
                  <UserAvatar 
                    user={{ name: session.user.name, email: session.user.email, image: session.user.image }}
                    className="w-10 h-10 border-2 border-border" 
                  />
                </div>
              )}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={RiGroupLine}
                    label={t('overview.totalUsers')}
                    value={totalUsers}
                    sub={t('overview.totalUsersActive', { count: activeUsers })}
                    accentColor="var(--accent)"
                  />
                  <StatCard
                    icon={RiKeyLine}
                    label={t('overview.totalSecrets')}
                    value={totalSecrets}
                    sub={t('overview.totalSecretsAvg', { avg: avgSecrets })}
                    accentColor="#8b5cf6"
                  />
                  <StatCard
                    icon={RiShieldCheckLine}
                    label={t('overview.mfaAdoption')}
                    value={`${mfaRate}%`}
                    sub={t('overview.mfaAdoptionSub', { count: users.filter((u) => u.mfaEnabled).length })}
                    accentColor="var(--vault-unlocked)"
                  />
                  <StatCard
                    icon={RiLockLine}
                    label={t('overview.lockedAccounts')}
                    value={lockedUsers}
                    sub={t('overview.lockedAccountsSub')}
                    accentColor="var(--vault-locked)"
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
                  <StatCard
                    icon={RiKeyLine}
                    label={t('overview.staleSecrets')}
                    value={staleSecrets}
                    sub={t('overview.staleSecretsSub')}
                    accentColor="var(--vault-warning)"
                  />
                  <StatCard
                    icon={RiShieldCheckLine}
                    label={t('overview.highRiskUsers')}
                    value={highRiskUsers}
                    sub={t('overview.highRiskUsersSub')}
                    accentColor="var(--vault-locked)"
                  />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-6">
                      <RiCalendarLine size={16} className="text-muted-foreground" />
                      {t('overview.monthlySignups', { year: new Date().getFullYear() })}
                    </h2>
                    <MiniBarChart data={monthlySignups} />
                  </div>
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-6">
                      <RiKeyLine size={16} className="text-muted-foreground" />
                      {t('overview.secretTypes')}
                    </h2>
                    <SecretDonut data={secretTypesData} secretsLabel={t('donut.secrets')} />
                  </div>
                  {authMethodsData.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-6">
                        <RiShieldStarLine size={16} className="text-muted-foreground" />
                        {t('overview.authMethods')}
                      </h2>
                      <AuthBarChart data={authMethodsData} />
                    </div>
                  )}
                  {demographicsData.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-6">
                        <RiUserLine size={16} className="text-muted-foreground" />
                        {t('overview.demographics')}
                      </h2>
                      <DemographicsDonut data={demographicsData} label={t('overview.usersLabel')} />
                    </div>
                  )}
                </div>

                {/* PostHog Analytics UI */}
                {posthogData && (
                  <>
                    <h2 className="text-xl font-bold text-foreground mt-4 mb-2">PostHog Analytics</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StatCard
                        icon={RiBarChartLine}
                        label={t('overview.posthogVisits')}
                        value={posthogData.visits?.total || 0}
                        sub={t('overview.posthogVisitsSub')}
                        accentColor="#3b82f6"
                      />
                      <StatCard
                        icon={RiUserLine}
                        label={t('overview.posthogUnique')}
                        value={posthogData.uniqueVisitors?.total || 0}
                        sub={t('overview.posthogUniqueSub')}
                        accentColor="#10b981"
                      />
                      <StatCard
                        icon={RiArrowUpLine}
                        label={t('overview.posthogGrowth')}
                        value={`${posthogData.trafficGrowth?.currentPeriodTotal || 0} visits`}
                        sub={t('overview.posthogGrowthSub')}
                        accentColor="#f59e0b"
                        trend={{
                          value: `${Math.abs(posthogData.trafficGrowth?.growthPercentage || 0).toFixed(1)}%`,
                          up: posthogData.trafficGrowth?.isPositive ?? true
                        }}
                      />
                      <StatCard
                        icon={RiAlertLine}
                        label={t('overview.posthogErrors')}
                        value={`${posthogData.errorRates?.errorRatePercentage || 0}%`}
                        sub={t('overview.posthogErrorsSub')}
                        accentColor="var(--destructive)"
                        trend={
                          posthogData.errorRates?.errorRatePercentage > 5
                            ? { value: "High", up: false } // using 'up: false' to show red styling for errors
                            : undefined
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-2">
                      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-6">
                          <RiGroupLine size={16} className="text-muted-foreground" />
                          {t('overview.posthogCountries')}
                        </h2>
                        <PosthogBarChart data={posthogData.sources?.countries || []} color="#3b82f6" />
                      </div>
                      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex flex-col mb-6">
                           <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                             <RiLineChartLine size={16} className="text-muted-foreground" />
                             {t('overview.posthogTrafficTimeline')}
                           </h2>
                           <span className="text-xs text-muted-foreground mt-1 ps-6">{t('overview.posthogTrafficTimelineSub')}</span>
                        </div>
                        <PosthogAreaChart 
                          data={posthogData.visits?.labels?.map((label: string, i: number) => ({
                             date: label,
                             count: posthogData.visits.timeline[i] || 0
                          })) || []}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── USERS / ADMINS TABS ─────────────────────────────────────── */}
            {(activeTab === 'users' || activeTab === 'admins') && (
              <div className="flex flex-col gap-4 animate-fade-in w-full">

                {/* Filters */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="relative w-full max-w-sm">
                    <RiSearchLine className="absolute inset-s-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                    <input
                      className="w-full ps-10 pe-8 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all shadow-sm"
                      placeholder={t('filter.searchPlaceholder')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      id="admin-user-search"
                    />
                    {search && (
                      <button className="absolute inset-e-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSearch('')}>
                        <RiCloseLine size={16} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                    {/* Add Admin button — only admins, only in admins tab */}
                    {simulatedRole === 'admin' && activeTab === 'admins' && (
                      <button
                        id="admin-add-admin"
                        onClick={() => setShowAddUser(true)}
                        className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all shadow-sm"
                      >
                        <RiAddLine size={16} />
                        {t('overview.addAdmin')}
                      </button>
                    )}
                    <RiFilterLine size={16} />
                    {activeTab === 'admins' && (
                      <select
                        className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring shadow-sm transition-all cursor-pointer"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value as any)}
                        id="admin-filter-role"
                      >
                        <option value="all">{t('filter.allRoles')}</option>
                        <option value="admin">{t('role.admin')}</option>
                        <option value="supervisor">{t('role.supervisor')}</option>
                        <option value="viewer">{t('role.viewer')}</option>
                      </select>
                    )}
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
                {isLoading ? (
                  <div className="flex justify-center items-center py-20 text-muted-foreground bg-card border border-border rounded-xl">
                    <RiRefreshLine size={32} className="animate-spin" />
                  </div>
                ) : (
                  <UserTable
                    users={filteredUsers}
                    sortBy={sortBy}
                    sortDir={sortDir}
                    onToggleSort={toggleSort}
                    onView={setViewUser}
                    onEdit={setEditUser}
                    onRequestLockToggle={handleRequestLockToggle}
                    onRoleChange={handleRoleChange}
                    onRequestDelete={handleRequestDelete}
                    t={t}
                    simulatedRole={simulatedRole}
                  />
                )}

                {/* Table footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2 pt-2">
                  <span>
                    {t('table.showing', { shown: filteredUsers.length, total: users.length })}
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
