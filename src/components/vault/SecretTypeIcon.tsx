'use client';

import {
  RiLockPasswordLine,
  RiBankCardLine,
  RiTerminalLine,
  RiKey2Line,
  RiFileTextLine,
  RiPassportLine,
  RiBankLine,
  RiStickyNoteLine,
  RiWifiLine,
} from 'react-icons/ri';
import type { SecretType } from '@/types';

interface SecretTypeIconProps {
  type: SecretType;
  className?: string;
  size?: number;
}

const ICON_MAP: Record<SecretType, React.ComponentType<{ className?: string; size?: number }>> = {
  password:    RiLockPasswordLine,
  visa:        RiBankCardLine,
  env_variable:RiTerminalLine,
  api_key:     RiKey2Line,
  license:     RiFileTextLine,
  identity:    RiPassportLine,
  bank_account:RiBankLine,
  secure_note: RiStickyNoteLine,
  wifi:        RiWifiLine,
};

export function SecretTypeIcon({ type, className, size = 18 }: SecretTypeIconProps) {
  const Icon = ICON_MAP[type] ?? RiLockPasswordLine;
  return <Icon className={className} size={size} />;
}
