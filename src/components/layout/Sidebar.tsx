'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useSession } from '@/hooks/useSession';
import {
  RiSafe2Line,
  RiLockPasswordLine,
  RiBankCardLine,
  RiTerminalLine,
  RiKey2Line,
  RiFileTextLine,
  RiPassportLine,
  RiBankLine,
  RiStickyNoteLine,
  RiWifiLine,
  RiSettings3Line,
  RiStarLine,
  RiLock2Line,
  RiLockLine,
} from 'react-icons/ri';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { SecretType } from '@/types';
import { useGlobalVault } from '@/components/vault/VaultProvider';

interface SidebarProps {
  onNavClick?: () => void;
}

const TYPE_ICONS: Record<SecretType, React.ComponentType<{ size?: number; className?: string }>> = {
  password:     RiLockPasswordLine,
  visa:         RiBankCardLine,
  env_variable: RiTerminalLine,
  api_key:      RiKey2Line,
  license:      RiFileTextLine,
  identity:     RiPassportLine,
  bank_account: RiBankLine,
  secure_note:  RiStickyNoteLine,
  wifi:         RiWifiLine,
};

const SECRET_TYPES: SecretType[] = [
  'password', 'visa', 'env_variable', 'api_key', 'license',
  'identity', 'bank_account', 'secure_note', 'wifi',
];

export function Sidebar({ onNavClick }: SidebarProps) {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeFilter = searchParams.get('filter') || 'all';
  
  const { lock } = useSession();
  const { secrets } = useGlobalVault();
  
  const secretCounts = useMemo(() => {
    const counts: Record<string, number> = { all: secrets.length };
    secrets.forEach(s => {
      counts[s.secret_type] = (counts[s.secret_type] || 0) + 1;
    });
    return counts;
  }, [secrets]);

  const navItem = (
    filter: SecretType | 'all' | 'favorites' | 'sensitive',
    label: string,
    Icon: React.ComponentType<{ size?: number; className?: string }>,
    count?: number
  ) => {
    const isActive = activeFilter === filter;
    const href = filter === 'all' ? `/${locale}/vault` : `/${locale}/vault?filter=${filter}`;
    
    return (
      <Link
        key={filter}
        href={href}
        onClick={onNavClick}
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-[15px]',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive
            ? 'bg-secondary text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        )}
      >
        <Icon size={18} className="shrink-0" />
        <span className="ltr:text-left rtl:text-right truncate">{label}</span>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground tabular-nums ltr:pl-2 rtl:pr-2">{count}</span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className="flex flex-col h-full w-56 shrink-0 py-6"
      aria-label={t('vault.myVault')}
    >
      <div className="flex-1 overflow-y-auto space-y-1 scrollbar-none pr-2">
        {/* All secrets */}
      {navItem('all', t('vault.allSecrets'), RiSafe2Line, secretCounts['all'])}
      
      {/* Favorites */}
      {navItem('favorites', t('vault.favorites') || 'Favorites', RiStarLine, secrets.filter(s => s.is_favorite).length)}

      {/* Sensitive */}
      {navItem('sensitive', 'Sensitive', RiLock2Line, secrets.filter(s => s.is_sensitive).length)}

      <Separator className="my-3 mx-4 w-auto" />

      {/* Per-type filters */}
      {SECRET_TYPES.map((type) => {
        const Icon = TYPE_ICONS[type];
        return navItem(
          type,
          t(`secretTypes.${type}` as Parameters<typeof t>[0]),
          Icon,
          secretCounts[type]
        );
      })}

      </div>

      <div className="shrink-0 space-y-1 pt-4 mt-2 border-t border-border/50 pr-2">
        {/* Settings Link */}
      <Link
        href={`/${locale}/vault/settings`}
        onClick={onNavClick}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-[15px]',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        )}
      >
        <RiSettings3Line size={18} className="shrink-0" />
        <span className="ltr:text-left rtl:text-right truncate">{t('settings.title')}</span>
      </Link>

      <Separator className="my-3 mx-4 w-auto md:hidden" />

      {/* Lock Button (Mobile mostly) */}
      <button
        onClick={() => {
          if (onNavClick) onNavClick();
          lock();
          router.push(`/${locale}/auth`);
        }}
        className={cn(
          'w-full flex md:hidden items-center gap-3 px-4 py-2.5 rounded-md text-[15px]',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'text-destructive hover:bg-destructive/10'
        )}
      >
        <RiLockLine size={18} className="shrink-0" />
        <span className="ltr:text-left rtl:text-right truncate">{t('auth.lockVault')}</span>
      </button>
      </div>
    </aside>
  );
}
