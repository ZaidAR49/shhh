'use client';

import { createContext, useContext, useEffect } from 'react';
import { useVault } from '@/hooks/useVault';

type VaultContextType = ReturnType<typeof useVault>;

const VaultContext = createContext<VaultContextType | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const vault = useVault();

  useEffect(() => {
    vault.loadSecrets();
  }, [vault.loadSecrets]);

  return <VaultContext.Provider value={vault}>{children}</VaultContext.Provider>;
}

export function useGlobalVault(): VaultContextType {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useGlobalVault must be used within a VaultProvider');
  }
  return context;
}
