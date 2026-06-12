'use client';

import { cn } from '@/lib/utils';

interface SessionBarProps {
  minutesRemaining: number;
}

/**
 * The Shhh signature design element:
 * A persistent 2px horizontal security status line below the navbar.
 * Color transitions: green (>20 min) → amber (5-20 min) → red + pulse (<5 min)
 */
export function SessionBar({ minutesRemaining }: SessionBarProps) {
  const isCritical = minutesRemaining < 5;
  const isWarning  = minutesRemaining >= 5 && minutesRemaining < 20;
  const isGood     = minutesRemaining >= 20;

  return (
    <div
      role="progressbar"
      aria-label={`Session expires in ${minutesRemaining} minutes`}
      aria-valuenow={minutesRemaining}
      aria-valuemin={0}
      aria-valuemax={60}
      style={{
        background: isCritical
          ? 'var(--vault-locked)'
          : isWarning
          ? 'var(--vault-warning)'
          : 'var(--vault-unlocked)',
      }}
      className={cn(
        'fixed top-[72px] left-0 right-0 h-0.5 z-40 transition-colors duration-1000',
        isCritical && 'session-bar-critical'
      )}
    />
  );
}
