'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { RiRefreshLine, RiFileCopyLine, RiCheckLine } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { generatePassword, PasswordOptions } from '@/lib/password';
import { toast } from 'sonner';

interface PasswordGeneratorProps {
  onApply?: (password: string) => void;
  className?: string;
}

export function PasswordGenerator({ onApply, className }: PasswordGeneratorProps) {
  const t = useTranslations();
  
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    special: true,
  });
  
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    // If somehow all options are false, fallback is handled in generatePassword
    // but visually we should prevent all being false if possible, or just generate.
    setPassword(generatePassword(options));
    setCopied(false);
  }, [options]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success(t('common.copied') || 'Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOptionChange = (key: keyof PasswordOptions, value: boolean | number) => {
    setOptions(prev => {
      const next = { ...prev, [key]: value };
      // Prevent unchecking the last option for character types
      if (!next.uppercase && !next.lowercase && !next.numbers && !next.special) {
        return prev;
      }
      return next;
    });
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Password Display */}
      <div className="relative flex items-center">
        <Input 
          value={password}
          readOnly
          className="ltr:pr-24 rtl:pl-24 font-mono text-lg h-14 bg-muted border-input text-foreground tracking-wider"
        />
        <div className="absolute ltr:right-2 rtl:left-2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGenerate}
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
            aria-label={t('generator.generate')}
          >
            <RiRefreshLine size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
            aria-label={t('generator.copy')}
          >
            {copied ? <RiCheckLine size={18} className="text-green-500" /> : <RiFileCopyLine size={18} />}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Length Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="password-length" className="text-sm font-medium">
              {t('generator.length')}
            </Label>
            <Input
              type="number"
              min={8}
              max={128}
              value={options.length}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  handleOptionChange('length', Math.min(128, Math.max(8, val)));
                }
              }}
              className="w-16 h-8 text-center font-mono text-sm px-1"
            />
          </div>
          <input
            id="password-length"
            type="range"
            min={8}
            max={128}
            step={1}
            value={options.length}
            onChange={(e) => handleOptionChange('length', parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted accent-primary"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="opt-uppercase" className="cursor-pointer">{t('generator.uppercase')}</Label>
            <Switch
              id="opt-uppercase"
              checked={options.uppercase}
              onCheckedChange={(checked) => handleOptionChange('uppercase', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="opt-lowercase" className="cursor-pointer">{t('generator.lowercase')}</Label>
            <Switch
              id="opt-lowercase"
              checked={options.lowercase}
              onCheckedChange={(checked) => handleOptionChange('lowercase', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="opt-numbers" className="cursor-pointer">{t('generator.numbers')}</Label>
            <Switch
              id="opt-numbers"
              checked={options.numbers}
              onCheckedChange={(checked) => handleOptionChange('numbers', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="opt-special" className="cursor-pointer">{t('generator.special')}</Label>
            <Switch
              id="opt-special"
              checked={options.special}
              onCheckedChange={(checked) => handleOptionChange('special', checked)}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {onApply && (
        <div className="pt-4 border-t border-border mt-6">
          <Button className="w-full" onClick={() => onApply(password)}>
            {t('generator.apply')}
          </Button>
        </div>
      )}
    </div>
  );
}
