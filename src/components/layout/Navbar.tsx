'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { RiShieldKeyholeLine, RiLockLine, RiMenuLine } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Sidebar } from '@/components/layout/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { cn } from '@/lib/utils';
import type { Session } from '@/types';

interface NavbarProps {
  session: Session | null;
  minutesRemaining?: number;
  onLock?: () => void;
}

export function Navbar({ session, minutesRemaining = 60, onLock }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations();

  const sessionStatus = minutesRemaining < 5
    ? 'critical'
    : minutesRemaining < 20
    ? 'warning'
    : 'active';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[72px] bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
      role="banner"
    >
      <div className="h-full px-4 sm:px-6 lg:px-8 mx-auto max-w-[1400px] flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          {/* Mobile menu trigger */}
          {session && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden shrink-0 ltr:-ml-2 rtl:-mr-2 ltr:mr-2 rtl:ml-2 text-foreground" />}>
                <RiMenuLine size={24} aria-hidden="true" />
                <span className="sr-only">Toggle menu</span>
              </SheetTrigger>
              <SheetContent side={locale === 'ar' ? 'right' : 'left'} className="w-[280px] p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="px-4 py-6 h-full overflow-y-auto">
                  <Sidebar onNavClick={() => setMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* Logo */}
          <Link
            href={`/${locale}/vault`}
            aria-label={t('common.appName')}
            className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full hover:opacity-80 transition-opacity"
          >
            <div className="bg-primary/10 p-2 rounded-xl">
              <RiShieldKeyholeLine
                size={26}
                className="text-primary shrink-0"
                aria-hidden="true"
              />
            </div>
          </Link>
        </div>

        {/* Right side controls (Left in RTL) */}
        <div className="flex items-center gap-2 md:gap-4 ms-auto">
          {/* Session status dot */}
          {session && (
            <span
              aria-label={t('auth.sessionActive')}
              className={cn(
                'h-3 w-3 rounded-full shrink-0 transition-colors duration-1000',
                sessionStatus === 'active'  && 'bg-vault-unlocked',
                sessionStatus === 'warning' && 'bg-vault-warning',
                sessionStatus === 'critical'&& 'bg-vault-locked animate-pulse'
              )}
            />
          )}

          <ThemeToggle />
          <LanguageSwitcher />

          {session && (
            <>
              {/* User avatar and Settings */}
              <Link
                href={`/${locale}/vault/settings`}
                aria-label={t('settings.title')}
                className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              >
                <Avatar className="h-9 w-9 transition-opacity hover:opacity-80" aria-label={session.user.name}>
                  <AvatarImage src={session.user.image} alt={session.user.name} />
                  <AvatarFallback className="text-sm font-medium">
                    {session.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>

              {/* Lock vault */}
              <Button
                variant="ghost"
                onClick={onLock}
                aria-label={t('auth.lockVault')}
                className="hidden sm:inline-flex gap-2 text-muted-foreground hover:text-foreground h-10 px-3"
              >
                <RiLockLine size={18} />
                <span className="text-sm font-medium">{t('auth.lockVault')}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
