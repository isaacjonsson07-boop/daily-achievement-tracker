import { useState, useCallback } from 'react';

// ============================================
// STRUCTURED ACHIEVEMENT — Unlock State
// Tracks which features have been unlocked via
// lesson action buttons. Stored in localStorage.
// ============================================

const STORAGE_KEY = 'sa_unlocks';

export interface UnlockState {
  [unlockId: string]: boolean;
}

function loadUnlocks(): UnlockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUnlocks(state: UnlockState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useUnlocks() {
  const [unlocks, setUnlocks] = useState<UnlockState>(loadUnlocks);

  const isUnlocked = useCallback((id: string): boolean => {
    return !!unlocks[id];
  }, [unlocks]);

  const triggerUnlock = useCallback((id: string): boolean => {
    // Returns true if this is a NEW unlock (first time), false if already unlocked
    if (unlocks[id]) return false;
    const updated = { ...unlocks, [id]: true };
    setUnlocks(updated);
    saveUnlocks(updated);
    return true;
  }, [unlocks]);

  const resetUnlocks = useCallback(() => {
    setUnlocks({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { unlocks, isUnlocked, triggerUnlock, resetUnlocks };
}
