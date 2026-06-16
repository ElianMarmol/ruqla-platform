'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { DEFAULT_WHATSAPP_NUMBER } from '@/lib/store-settings-defaults';

type StoreSettingsContextValue = {
  whatsappNumber: string;
};

const StoreSettingsContext = createContext<StoreSettingsContextValue>({
  whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
});

export function StoreSettingsProvider({
  whatsappNumber,
  children,
}: {
  whatsappNumber: string;
  children: ReactNode;
}) {
  return (
    <StoreSettingsContext.Provider value={{ whatsappNumber }}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
