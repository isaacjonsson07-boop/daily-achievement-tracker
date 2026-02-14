import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type UnitSystem = 'metric' | 'imperial';

interface UnitSystemContextValue {
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => Promise<void>;
  loading: boolean;
}

const STORAGE_KEY = 'unit_system';

const UnitSystemContext = createContext<UnitSystemContextValue>({
  unitSystem: 'metric',
  setUnitSystem: async () => {},
  loading: true,
});

export function UnitSystemProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'metric' || stored === 'imperial') ? stored : 'metric';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('unit_system')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data?.unit_system) {
        const val = data.unit_system as UnitSystem;
        setUnitSystemState(val);
        localStorage.setItem(STORAGE_KEY, val);
      }
      setLoading(false);
    };

    load();
  }, [userId]);

  const setUnitSystem = useCallback(async (system: UnitSystem) => {
    setUnitSystemState(system);
    localStorage.setItem(STORAGE_KEY, system);

    if (userId) {
      await supabase
        .from('user_profiles')
        .update({ unit_system: system })
        .eq('id', userId);
    }
  }, [userId]);

  return (
    <UnitSystemContext.Provider value={{ unitSystem, setUnitSystem, loading }}>
      {children}
    </UnitSystemContext.Provider>
  );
}

export function useUnitSystem() {
  return useContext(UnitSystemContext);
}
