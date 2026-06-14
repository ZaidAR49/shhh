'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  texts: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBeforeDelete?: number;
  delayBeforeType?: number;
}

export function TypewriterText({
  texts,
  className,
  typingSpeed = 50,
  deletingSpeed = 20,
  delayBeforeDelete = 2500,
  delayBeforeType = 500,
}: TypewriterTextProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // If we only have one text or texts is undefined, don't animate properly, just show it
    if (!texts || texts.length === 0) return;
    
    const fullText = texts[textIndex];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      if (currentText === '') {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
        timeout = setTimeout(() => {}, delayBeforeType);
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, deletingSpeed);
      }
    } else {
      if (currentText === fullText) {
        timeout = setTimeout(() => setIsDeleting(true), delayBeforeDelete);
      } else {
        timeout = setTimeout(() => {
          setCurrentText(fullText.slice(0, currentText.length + 1));
        }, typingSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, delayBeforeDelete, delayBeforeType]);

  return (
    <span className={cn('inline-flex items-center min-h-[1.5em]', className)}>
      <span>{currentText}</span>
      <span className="w-[2px] h-[1.2em] bg-primary ml-1 animate-[pulse_1s_infinite]" />
    </span>
  );
}
