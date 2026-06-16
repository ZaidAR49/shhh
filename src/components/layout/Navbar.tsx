'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { RiLockLine, RiMenuLine } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserAvatar } from '@/components/shared/UserAvatar';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
      className="relative z-10 h-[96px] bg-background/95 backdrop-blur-md border-b border-border shadow-sm w-full"
      role="banner"
    >
      <div className="h-full px-4 sm:px-6 lg:px-8 mx-auto w-full flex items-center justify-between">
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
            href={`/${locale}`}
            aria-label={t('common.appName')}
            className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full hover:opacity-80 transition-opacity"
          >
            <div>
              <Image
                src="/icon.png"
                alt="Shhh Logo"
                width={80}
                height={80}
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 object-contain shrink-0"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Right side controls (Left in RTL) */}
        <div className="flex items-center gap-2 md:gap-4 ms-auto">
          {/* Session status dot */}
          {session && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span
                    aria-label="Session Status"
                    className={cn(
                      'h-3 w-3 rounded-full shrink-0 transition-colors duration-1000 cursor-help',
                      sessionStatus === 'active'  && 'bg-vault-unlocked',
                      sessionStatus === 'warning' && 'bg-vault-warning',
                      sessionStatus === 'critical'&& 'bg-vault-locked animate-pulse'
                    )}
                  />
                }
              />
              <TooltipContent side="bottom" align="center">
                <p className="text-xs font-medium">
                  {sessionStatus === 'active' ? 'Account Secure & Session Active' : 
                   sessionStatus === 'warning' ? 'Session expiring soon' : 
                   'Session ending critically soon'}
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          <ThemeToggle />
          <LanguageSwitcher />

          {session && (
            <>
              {/* User avatar and Settings */}
              <Link
                href={`/${locale}/vault/settings`}
                aria-label={t('settings.title')}
                className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full hover:opacity-80 transition-opacity"
              >
                <UserAvatar 
                  user={{ name: session.user.name, email: session.user.email, image: session.user.image }}
                  className="h-9 w-9" 
                  fallbackClassName="text-sm font-medium bg-primary/10 text-primary"
                />
                <span className="hidden sm:inline-flex text-sm font-medium text-foreground">
                  {session.user.name}
                </span>
              </Link>

              {/* Lock vault */}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      onClick={onLock}
                      aria-label={t('auth.lockVault')}
                      className="hidden sm:inline-flex gap-2 text-muted-foreground hover:text-foreground h-10 px-3"
                    >
                      <RiLockLine size={18} />
                      <span className="text-sm font-medium">{t('auth.lockVault')}</span>
                    </Button>
                  }
                />
                <TooltipContent side="bottom" align="end">
                  <p className="text-xs font-medium">Instantly lock your vault and end session</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
