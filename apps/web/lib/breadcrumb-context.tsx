'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface BreadcrumbContextValue {
  overrides: Record<string, string>;
  setOverride: (segment: string, label: string) => void;
  clearOverride: (segment: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  overrides: {},
  setOverride: () => {},
  clearOverride: () => {},
});

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const setOverride = useCallback((segment: string, label: string) => {
    setOverrides((prev) => ({ ...prev, [segment]: label }));
  }, []);

  const clearOverride = useCallback((segment: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[segment];
      return next;
    });
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ overrides, setOverride, clearOverride }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbOverrides() {
  return useContext(BreadcrumbContext).overrides;
}

export function useBreadcrumbOverride(segment: string, label: string | undefined) {
  const { setOverride, clearOverride } = useContext(BreadcrumbContext);

  useEffect(() => {
    if (label) setOverride(segment, label);
    return () => clearOverride(segment);
  }, [segment, label, setOverride, clearOverride]);
}
