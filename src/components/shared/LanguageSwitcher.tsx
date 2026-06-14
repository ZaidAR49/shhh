'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { RiGlobalLine } from 'react-icons/ri';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('settings');

  const switchLocale = (next: 'en' | 'ar') => {
    const segments = pathname.split('/');
    segments[1] = next;
    router.push(segments.join('/'));
  };

  return (
    <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Change Language"
              className={cn(
                'inline-flex h-10 items-center justify-center gap-2 rounded-md px-3',
                'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm font-medium',
                className
              )}
            >
              <RiGlobalLine size={20} />
              <span>{locale === 'ar' ? 'العربية' : 'EN'}</span>
            </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => switchLocale('en')}
          aria-label={t('languageEnglish')}
          className={cn(locale === 'en' && 'font-semibold')}
        >
          {t('languageEnglish')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLocale('ar')}
          aria-label={t('languageArabic')}
          className={cn(locale === 'ar' && 'font-semibold')}
        >
          {t('languageArabic')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
