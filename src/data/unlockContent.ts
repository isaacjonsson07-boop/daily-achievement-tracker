// ============================================
// STRUCTURED ACHIEVEMENT — Unlock Definitions
// Each unlock maps to an action button in a lesson,
// a section in the app, and a popup shown once.
// ============================================

export interface UnlockDef {
  id: string;
  day: number;
  phase: 1 | 2 | 3;
  title: string;
  explanation: string;
  tab: string;           // which tab to navigate to
  section?: string;      // which section within the tab
  subTab?: string;       // for reviews tab
}

export const UNLOCK_DEFS: UnlockDef[] = [
  {
    id: 'system-direction',
    day: 1,
    phase: 1,
    title: 'Direction Statement Installed',
    explanation: 'The Direction Statement field is where your north star lives. Whatever you write here appears at the top of your Today view every morning — a daily reminder of what you\'re operating toward.',
    tab: 'system',
    section: 'direction',
  },
  {
    id: 'system-nns',
    day: 4,
    phase: 1,
    title: 'Non-Negotiables Installed',
    explanation: 'Non-negotiables appear as daily checkboxes in your Today view. Check them off every day — this is how the system tracks your consistency. They are the floor that holds on your worst day.',
    tab: 'system',
    section: 'non-negotiables',
  },
  {
    id: 'today',
    day: 5,
    phase: 1,
    title: 'Tracking System Online',
    explanation: 'The Today tab is your daily execution view. Your direction at the top, non-negotiables, habits, and tasks below. The sidebar tracks your completion rate, streak, and weekly consistency. Check items off during your evening close-out.',
    tab: 'today',
  },
  {
    id: 'reviews-weekly',
    day: 7,
    phase: 1,
    title: 'Review System Installed',
    explanation: 'The Reviews tab shows your system health — completion rates, consistency, and trends. Use the weekly review every Sunday to assess what worked, what didn\'t, and what to adjust for next week.',
    tab: 'reviews',
    subTab: 'weekly',
  },
  {
    id: 'system-identity',
    day: 8,
    phase: 2,
    title: 'Identity Statement Installed',
    explanation: 'Your identity statement appears alongside your direction at the top of Today. It answers "who am I operating as?" — not aspirational, but operational. Your daily actions are votes for this identity.',
    tab: 'system',
    section: 'identity',
  },
  {
    id: 'system-priorities',
    day: 9,
    phase: 2,
    title: 'Priority Stack Installed',
    explanation: 'Your priority stack is your decision filter. When something competes for your time, check it against these priorities. If it doesn\'t serve one of your top 3, the answer is no.',
    tab: 'system',
    section: 'priorities',
  },
  {
    id: 'system-habits',
    day: 10,
    phase: 2,
    title: 'Keystone Habits Installed',
    explanation: 'Habits appear in your Today view only on the days you schedule them. A Mon/Wed/Fri habit won\'t clutter your Tuesday. Each one is tied to a cue, routine, and reward — the loop that makes it automatic.',
    tab: 'system',
    section: 'habits',
  },
  {
    id: 'system-decisions',
    day: 13,
    phase: 2,
    title: 'Decision Framework Installed',
    explanation: 'Your decision rules eliminate daily decision fatigue. When you face a recurring choice, check the framework instead of deliberating. The goal is to make your defaults intentional instead of reactive.',
    tab: 'system',
    section: 'decisions',
  },
  {
    id: 'system-failure',
    day: 15,
    phase: 3,
    title: 'Failure Protocol Installed',
    explanation: 'When you miss a day, this protocol tells you exactly what to do — no thinking, no guilt, just the restart sequence. The rule is simple: never miss twice.',
    tab: 'system',
    section: 'failure',
  },
  {
    id: 'reviews-quarterly',
    day: 19,
    phase: 3,
    title: 'Recalibration Installed',
    explanation: 'The quarterly recalibration checks whether your direction, priorities, and identity still fit where you are. Things change — your system should change with them. Run this every 90 days.',
    tab: 'reviews',
    subTab: 'quarterly',
  },
  {
    id: 'system-manual',
    day: 20,
    phase: 3,
    title: 'Operating Manual Installed',
    explanation: 'Your operating manual is the consolidation of everything — direction, identity, priorities, decision rules, failure protocol, daily structure. One document, one tap away. This is what you reference when you need to recalibrate.',
    tab: 'system',
    section: 'manual',
  },
  {
    id: 'journal',
    day: 6,
    phase: 1,
    title: 'Journal Activated',
    explanation: 'Each day has structured journal prompts tied to that lesson. Your answers here are how you internalize and apply the system to your life. Complete the journal before moving to the next day.',
    tab: '_journal',
  },
];

export function getUnlockDef(id: string): UnlockDef | undefined {
  return UNLOCK_DEFS.find(u => u.id === id);
}
