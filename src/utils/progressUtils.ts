import { JournalEntry } from '../types';
import { TabType } from '../types';
import { UnlockState } from '../hooks/useUnlocks';

// ============================================
// PROGRESSIVE UNLOCK — Tab & Section Locking
// Tabs are locked until their first relevant
// unlock is triggered via a lesson action button.
// ============================================

/**
 * Returns the highest installation day where the user has written journal content.
 * Used for the installation progress counter, not for locking.
 */
export function getHighestCompletedDay(journalEntries: JournalEntry[]): number {
  let highest = 0;
  for (const entry of journalEntries) {
    if (!entry.dayNumber || entry.dayNumber < 1 || entry.dayNumber > 21) continue;
    const hasContent =
      (entry.content && entry.content.trim() !== '') ||
      (entry.answers && Object.values(entry.answers).some(a => a && a.trim() !== ''));
    if (hasContent && entry.dayNumber > highest) {
      highest = entry.dayNumber;
    }
  }
  return highest;
}

/**
 * Tab unlock rules — which unlock ID must be triggered to access the tab.
 * null = always accessible.
 */
const TAB_UNLOCK_REQUIREMENTS: Record<TabType, { unlockId: string | null; day: number; message: string }> = {
  installation: { unlockId: null, day: 0, message: '' },
  settings: { unlockId: null, day: 0, message: '' },
  system: { unlockId: 'system-direction', day: 1, message: 'Complete Day 1 to start building your system.' },
  today: { unlockId: 'today', day: 5, message: 'Complete Day 5 to activate your daily execution view.' },
  achievements: { unlockId: 'today', day: 5, message: 'Complete Day 5 to start tracking your milestones.' },
  reviews: { unlockId: 'reviews-weekly', day: 7, message: 'Complete Day 7 to unlock your review tools.' },
};

export interface TabLockInfo {
  locked: boolean;
  requiredDay: number | null;
  message: string;
}

/**
 * Get lock status for a specific tab based on unlock state.
 */
export function getTabLockInfo(tab: TabType, unlocks: UnlockState): TabLockInfo {
  const req = TAB_UNLOCK_REQUIREMENTS[tab];

  if (req.unlockId === null) {
    return { locked: false, requiredDay: null, message: '' };
  }

  if (unlocks[req.unlockId]) {
    return { locked: false, requiredDay: req.day, message: '' };
  }

  return {
    locked: true,
    requiredDay: req.day,
    message: req.message,
  };
}

/**
 * Check if a tab is locked.
 */
export function isTabLocked(tab: TabType, unlocks: UnlockState): boolean {
  return getTabLockInfo(tab, unlocks).locked;
}

/**
 * Get the default tab for a user based on their unlocks.
 * If Today is unlocked, go there. Otherwise Installation.
 */
export function getDefaultTab(unlocks: UnlockState): TabType {
  if (unlocks['today']) return 'today';
  return 'installation';
}
