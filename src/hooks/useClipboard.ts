'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface UseClipboardReturn {
  copy: (value: string) => void;
  copied: boolean;
}

/**
 * Copy-to-clipboard hook with 30-second auto-clear.
 * After 30 seconds, the clipboard is overwritten with an empty string
 * and the `copied` state resets to false.
 */
export function useClipboard(clearDelayMs: number = 30_000): UseClipboardReturn {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    (value: string) => {
      if (!navigator?.clipboard) return;

      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        toast.success('Copied to clipboard');
        // Clear any existing timer
        if (timerRef.current) clearTimeout(timerRef.current);
        // Schedule auto-clear
        timerRef.current = setTimeout(() => {
          // Overwrite clipboard with empty string to clear sensitive data
          navigator.clipboard.writeText('').catch(() => {});
          setCopied(false);
        }, clearDelayMs);
      });
    },
    [clearDelayMs]
  );

  return { copy, copied };
}
