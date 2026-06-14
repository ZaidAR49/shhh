'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';
import { RiSunLine, RiMoonLine, RiComputerLine, RiGlobalLine, RiDeleteBinLine, RiShieldLine, RiEditLine, RiCheckLine, RiCloseLine, RiLogoutBoxRLine, RiUser3Line, RiSettings3Line, RiAlertLine, RiMailSendLine } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useSession } from '@/hooks/useSession';
import { cn } from '@/lib/utils';
import { MfaSettings } from '@/components/settings/MfaSettings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

function SettingsCard({ title, icon: Icon, children, destructive }: { title: string, icon: React.ElementType, children: React.ReactNode, destructive?: boolean }) {
  return (
    <section className={cn("rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md", destructive && "border-destructive/30")}>
      <div className={cn("p-5 border-b flex items-center gap-2", destructive ? "bg-destructive/5" : "bg-muted/10")}>
        <Icon size={18} className={destructive ? "text-destructive" : "text-muted-foreground"} />
        <h2 className={cn("text-sm font-semibold tracking-tight", destructive && "text-destructive")}>{title}</h2>
      </div>
      <div className="p-5 flex-1 flex flex-col gap-6">
        {children}
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const t = useTranslations('settings');
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const { session, lock, updateName } = useSession();

  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [notificationLocale, setNotificationLocale] = useState<'en' | 'ar'>('en');
  const [deleteError, setDeleteError] = useState('');
  const [clearError, setClearError] = useState('');

  useEffect(() => {
    if (session?.user?.name) {
      setEditNameValue(session.user.name);
    }
  }, [session?.user?.name]);

  useEffect(() => {
    fetch('/api/auth/mfa/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.mfaEnabled === 'boolean') {
          setMfaEnabled(data.mfaEnabled);
        }
        if (data && typeof data.notificationsEnabled === 'boolean') {
          setNotificationsEnabled(data.notificationsEnabled);
        }
        if (data && data.preferredLocale) {
          setNotificationLocale(data.preferredLocale);
        }
      })
      .catch((err) => console.error('Failed to fetch MFA/Notification status:', err));
  }, []);

  const handleSignOut = () => {
    lock();
    router.replace(`/${locale}/auth`);
  };

  const handleSaveName = () => {
    if (editNameValue.trim()) {
      updateName(editNameValue.trim());
    }
    setIsEditingName(false);
  };

  const handleToggleNotifications = async (checked: boolean) => {
    setNotificationsEnabled(checked);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationsEnabled: checked }),
      });
      if (!res.ok) {
        // Revert on failure
        setNotificationsEnabled(!checked);
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to update notification settings');
      } else {
        toast.success(checked ? 'Notifications enabled' : 'Notifications disabled');
      }
    } catch (err) {
      setNotificationsEnabled(!checked);
      toast.error('Network error while updating notification settings');
    }
  };

  const handleNotificationLocaleChange = async (newLocale: 'en' | 'ar' | null) => {
    if (!newLocale) return;
    const prev = notificationLocale;
    setNotificationLocale(newLocale);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredLocale: newLocale }),
      });
      if (!res.ok) {
        setNotificationLocale(prev);
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to update preferred language');
      } else {
        toast.success('Preferred language updated');
      }
    } catch (err) {
      setNotificationLocale(prev);
      toast.error('Network error while updating language');
    }
  };

  const handleClearVaultClick = () => {
    setClearError('');
    setClearOpen(true);
  };

  const handleClearVault = async (token?: string) => {
    if (mfaEnabled && !token) {
      setClearError('Please enter your 6-digit code');
      return;
    }
    setClearing(true);
    try {
      const res = await fetch('/api/secrets/clear', { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errStr = data.error || 'Failed to clear vault.';
        setClearError(errStr);
        toast.error(errStr);
      } else {
        setClearOpen(false);
        toast.success('Vault cleared successfully');
      }
    } catch (err) {
      const errStr = 'Network error while clearing vault.';
      setClearError(errStr);
      toast.error(errStr);
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteAccountClick = () => {
    if (mfaEnabled === false) {
      toast.error("You must enable Two-Factor Authentication before you can delete your account.");
      return;
    }
    setDeleteError('');
    setDeleteAccountOpen(true);
  };

  const handleDeleteAccount = async (token?: string) => {
    if (!token) {
      setDeleteError('Please enter your 6-digit code');
      return;
    }
    
    setDeletingAccount(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        const errStr = data.error || 'Invalid code';
        setDeleteError(errStr);
        toast.error(errStr);
        setDeletingAccount(false);
        return;
      }

      await signOut({ redirect: false });
      localStorage.removeItem('shhh_remembered_user');
      setDeletingAccount(false);
      setDeleteAccountOpen(false);
      toast.success('Account deleted successfully');
      router.replace(`/${locale}/auth`);
    } catch (err) {
      setDeleteError('An error occurred');
      toast.error('An error occurred while deleting account');
      setDeletingAccount(false);
    }
  };

  const themeOptions = [
    { key: 'light' as const, label: t('themeLight'), Icon: RiSunLine },
    { key: 'dark'  as const, label: t('themeDark'),  Icon: RiMoonLine },
    { key: 'system'as const, label: t('themeSystem'),Icon: RiComputerLine },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 max-w-[1400px] mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
        
        {/* Profile Card */}
        <SettingsCard title={t('profile')} icon={RiUser3Line}>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 shadow-sm border">
              <AvatarImage src={session?.user?.image} alt={session?.user?.name} />
              <AvatarFallback className="text-lg">{session?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-2 mb-1">
                  <Input 
                    value={editNameValue} 
                    onChange={(e) => setEditNameValue(e.target.value)} 
                    className="h-8 text-sm w-full max-w-[200px]"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 shrink-0" onClick={handleSaveName} aria-label={t('saveName')}>
                    <RiCheckLine size={16} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground shrink-0" onClick={() => setIsEditingName(false)} aria-label={t('cancelEdit')}>
                    <RiCloseLine size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold truncate">{session?.user?.name}</p>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground shrink-0 hover:bg-muted" onClick={() => setIsEditingName(true)} aria-label={t('editName')}>
                    <RiEditLine size={14} />
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground truncate">{session?.user?.email}</p>
              <Badge variant="outline" className="mt-2 text-[10px] font-medium uppercase tracking-wider">
                {session?.user?.provider || 'Google'}
              </Badge>
            </div>
          </div>
        </SettingsCard>

        {/* Preferences Card */}
        <SettingsCard title={t('theme')} icon={RiSettings3Line}>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-3">{t('theme')}</p>
              <div className="flex gap-3">
                {themeOptions.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    aria-label={label}
                    aria-pressed={theme === key}
                    onClick={() => setTheme(key)}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-lg border text-sm',
                      'transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      theme === key
                        ? 'border-primary bg-primary/5 text-primary font-medium ring-1 ring-primary/20'
                        : 'border-border text-muted-foreground hover:border-foreground/30 hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    <Icon size={20} aria-hidden="true" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2 border-t">
              <div className="flex items-center gap-3">
                <RiGlobalLine size={18} className="text-muted-foreground" aria-hidden="true" />
                <div>
                  <span className="text-sm font-medium">Application Language</span>
                  <p className="text-xs text-muted-foreground mt-1">Changes the UI language immediately.</p>
                </div>
              </div>
              <LanguageSwitcher />
            </div>

            <div className="flex items-center justify-between gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <RiGlobalLine size={18} className="text-muted-foreground" aria-hidden="true" />
                <div>
                  <span className="text-sm font-medium">Notification Language</span>
                  <p className="text-xs text-muted-foreground mt-1">Language for security email alerts.</p>
                </div>
              </div>
              <Select value={notificationLocale} onValueChange={handleNotificationLocaleChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('languageEnglish')}</SelectItem>
                  <SelectItem value="ar">{t('languageArabic')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <RiMailSendLine size={18} className="text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium leading-none mb-1.5">Email Notifications</p>
                  <p className="text-xs text-muted-foreground max-w-[200px] sm:max-w-none">Receive security alerts when sensitive actions occur.</p>
                </div>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={handleToggleNotifications} />
            </div>
          </div>
        </SettingsCard>

        {/* Security Card */}
        <SettingsCard title={t('security')} icon={RiShieldLine}>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium leading-none mb-1.5">{t('sessionDuration')}</p>
                <p className="text-sm text-muted-foreground">{t('sessionDurationNote')}</p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-xs px-2.5 py-1">{t('sessionDurationValue')}</Badge>
            </div>
            
            <div className="pt-6 border-t">
              <MfaSettings mfaEnabled={mfaEnabled} setMfaEnabled={setMfaEnabled} />
            </div>
          </div>
        </SettingsCard>

        {/* Danger Zone Card */}
        <SettingsCard title={t('dangerZone')} icon={RiAlertLine} destructive>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t('signOut')}</p>
                <p className="text-xs text-muted-foreground truncate">{t('signOutDesc')}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="shrink-0">
                <RiLogoutBoxRLine size={14} className="ltr:mr-1.5 rtl:ml-1.5" aria-hidden="true" />
                {t('signOut')}
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-destructive truncate">{t('clearVault')}</p>
                <p className="text-xs text-destructive/70 truncate">{t('clearVaultConfirm').split('.')[0]}.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleClearVaultClick} className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <RiDeleteBinLine size={14} className="ltr:mr-1.5 rtl:ml-1.5" aria-hidden="true" />
                {t('clearVault')}
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-destructive truncate">{t('deleteAccount')}</p>
                <p className="text-xs text-destructive/70 truncate">{t('deleteAccountConfirm').split('?')[0]}?</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDeleteAccountClick} className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <RiDeleteBinLine size={14} className="ltr:mr-1.5 rtl:ml-1.5" aria-hidden="true" />
                {t('deleteAccount')}
              </Button>
            </div>
          </div>
        </SettingsCard>

      </div>

      <ConfirmDialog
        open={clearOpen}
        title={t('clearVault')}
        description={t('clearVaultConfirm')}
        onConfirm={handleClearVault}
        onCancel={() => {
          setClearOpen(false);
          setClearError('');
        }}
        isPending={clearing}
        requireMfa={!!mfaEnabled}
        error={clearError}
      />

      <ConfirmDialog
        open={deleteAccountOpen}
        title={t('deleteAccount')}
        description={t('deleteAccountConfirm')}
        onConfirm={handleDeleteAccount}
        onCancel={() => {
          setDeleteAccountOpen(false);
          setDeleteError('');
        }}
        isPending={deletingAccount}
        requireMfa={true}
        error={deleteError}
      />
    </div>
  );
}
