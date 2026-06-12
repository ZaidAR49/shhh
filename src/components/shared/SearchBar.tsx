'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { RiSearchLine, RiCloseLine } from 'react-icons/ri';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  className?: string;
}

export function SearchBar({ onSearch, className }: SearchBarProps) {
  const [value, setValue] = useState('');
  const t = useTranslations('vault');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setValue(q);
      onSearch(q);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className={cn('relative', className)}>
      <RiSearchLine
        size={16}
        className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <Input
        id="vault-search"
        value={value}
        onChange={handleChange}
        placeholder={t('searchPlaceholder')}
        aria-label={t('searchPlaceholder')}
        className="ltr:pl-9 ltr:pr-8 rtl:pr-9 rtl:pl-8"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={handleClear}
          className={cn(
            'absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2',
            'h-5 w-5 rounded flex items-center justify-center',
            'text-muted-foreground hover:text-foreground transition-colors'
          )}
        >
          <RiCloseLine size={14} />
        </button>
      )}
    </div>
  );
}
