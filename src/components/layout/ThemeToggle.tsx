'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { RiSunLine, RiMoonLine, RiComputerLine } from 'react-icons/ri';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('settings');

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              aria-label={t('theme')}
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-md',
                'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                className
              )}
            >
              {!mounted ? (
                <div className="h-5 w-5" />
              ) : theme === 'dark' ? (
                <RiMoonLine size={20} />
              ) : theme === 'light' ? (
                <RiSunLine size={20} />
              ) : (
                <RiComputerLine size={20} />
              )}
            </DropdownMenuTrigger>
          }
        />
        <TooltipContent side="bottom" align="center">
          <p className="text-xs font-medium">Toggle Theme</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          aria-label={t('themeLight')}
          className={cn('gap-2', theme === 'light' && 'font-semibold')}
        >
          <RiSunLine size={14} />
          {t('themeLight')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          aria-label={t('themeDark')}
          className={cn('gap-2', theme === 'dark' && 'font-semibold')}
        >
          <RiMoonLine size={14} />
          {t('themeDark')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          aria-label={t('themeSystem')}
          className={cn('gap-2', theme === 'system' && 'font-semibold')}
        >
          <RiComputerLine size={14} />
          {t('themeSystem')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
