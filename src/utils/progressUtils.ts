import { JournalEntry } from '../types';
import { TabType } from '../types';

// ============================================
// PROGRESSIVE UNLOCK — Installation Progress
// ============================================

/**
 * Returns the highest installation day where the user has written journal content.
 * This is the source of truth for what's been "completed."
 * Returns 0 if no days have been completed.
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
 * Tab unlock rules based on installation progress.
 * Returns the minimum completed day required to access each tab.
 * A tab is accessible when highestCompletedDay >= the required day.
 * null = always accessible.
 */
const TAB_UNLOCK_REQUIREMENTS: Record<TabType, number | null> = {
  installation: null,  // Always open
  settings: null,      // Always open
  system: 1,           // After Day 1 (direction statement)
  today: 2,            // After Day 2 (daily structure)
  reviews: 7,          // After Day 7 (first review)
  achievements: 21,    // After Day 21 (installation complete)
};

export interface TabLockInfo {
  locked: boolean;
  requiredDay: number | null;
  message: string;
}

/**
 * Get lock status for a specific tab.
 */
export function getTabLockInfo(tab: TabType, highestCompletedDay: number): TabLockInfo {
  const required = TAB_UNLOCK_REQUIREMENTS[tab];

  if (required === null) {
    return { locked: false, requiredDay: null, message: '' };
  }

  if (highestCompletedDay >= required) {
    return { locked: false, requiredDay: required, message: '' };
  }

  // Build a contextual unlock message
  const messages: Record<string, string> = {
    today: `Complete Day 2 to activate your daily execution view.`,
    system: `Complete Day 1 to start building your system.`,
    reviews: `Complete Day 7 to unlock your review tools.`,
    achievements: `Complete all 21 days to view your achievements.`,
  };

  return {
    locked: true,
    requiredDay: required,
    message: messages[tab] || `Activates after Day ${required}.`,
  };
}

/**
 * Check if any tab is locked given current progress.
 */
export function isTabLocked(tab: TabType, highestCompletedDay: number): boolean {
  return getTabLockInfo(tab, highestCompletedDay).locked;
}

/**
 * Get the default tab for a user based on their progress.
 * New users (day 0) go to Installation. Everyone else goes to Today (if unlocked) or Installation.
 */
export function getDefaultTab(highestCompletedDay: number): TabType {
  if (highestCompletedDay >= 2) return 'today';
  return 'installation';
}
