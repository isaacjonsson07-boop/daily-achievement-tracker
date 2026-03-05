// ============================================
// STRUCTURED ACHIEVEMENT — Type Definitions
// ============================================

// === NAVIGATION ===

export type TabType = 'today' | 'installation' | 'reviews' | 'achievements' | 'system' | 'settings';

export type InstallationPhase = 'stabilize' | 'reconstruct' | 'install';

// === NON-NEGOTIABLES (Day 4) ===
// Core daily behaviors. Show up every day. The foundation of execution.

export interface NonNegotiable {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NonNegotiableCompletion {
  id: string;
  non_negotiable_id: string;
  user_id: string;
  completion_date: string; // YYYY-MM-DD
  created_at: string;
}

// === HABITS (Day 10 — Keystone Habits) ===
// Recurring behaviors tied to specific days. Installed during Phase II.

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_number: number;
  days_of_week: number[]; // 0=Sun, 1=Mon, ... 6=Sat
  time: string;
  starred?: boolean;
  linked_goal_id?: string;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completion_date: string; // YYYY-MM-DD
  completed_number: number;
  created_at: string;
}

// === DAILY TASKS ===
// One-off tasks for a specific date. Plan tomorrow tonight, execute today.

export interface DailyTask {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  task_date: string; // YYYY-MM-DD
  time?: string;
  completed: boolean;
  created_at: string;
}

// === GOALS ===
// Longer-term targets. Habits and tasks feed into these.

export interface Goal {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  unit: string; // 'tasks', 'days', 'times', or custom
  target_date?: string;
  created_at: string;
  completed: boolean;
  completed_at?: string;
}

// === JOURNAL ===
// Installation journal (21 days) + ongoing operational notes.

export interface JournalEntry {
  id: string;
  dayNumber?: number; // 1-21 for installation, undefined for operational
  title: string;
  content: string;
  entry_date: string; // YYYY-MM-DD
  entry_type: 'installation' | 'daily' | 'weekly_review' | 'monthly_review';
  answers?: { [key: string]: string };
  lastModified: string;
  userId?: string;
}

// === SYSTEM DOCUMENTS (Day 20 — Operating Manual) ===
// Living documents built during installation, updated during recalibrations.

export interface SystemDocument {
  id: string;
  user_id: string;
  doc_type: 'direction' | 'identity' | 'priorities' | 'decision_rules' | 'failure_protocol' | 'operating_manual';
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// === REVIEWS ===

// Day 18 — Weekly Review (10 minutes, every week)
export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start: string; // YYYY-MM-DD (Monday)
  nn_completion_rate: number; // 0-100
  habit_completion_rate: number; // 0-100
  task_completion_rate: number; // 0-100
  wins: string;
  adjustments: string;
  next_week_focus: string;
  created_at: string;
}

// Day 19 — Monthly Recalibration (30 minutes, every month)
export interface MonthlyReview {
  id: string;
  user_id: string;
  month: string; // YYYY-MM
  direction_still_valid: boolean;
  direction_update?: string;
  identity_alignment: number; // 1-10
  priorities_changed: boolean;
  priorities_update?: string;
  system_health: number; // 1-10
  biggest_win: string;
  biggest_challenge: string;
  next_month_focus: string;
  created_at: string;
}

// === SYSTEM REPORTS (Monthly Achievement Cards) ===
// Generated at the end of each month. Stored in the Achievements tab.

export type ReportTier = 'diamond' | 'gold' | 'silver' | 'bronze';

export interface SystemReport {
  id: string;
  user_id: string;
  month: string; // YYYY-MM
  score: number; // 0-100
  tier: ReportTier;
  meetsMinimums: boolean; // 3 habits, 3 tasks/day avg, 2 NNs
  scoreCapped: boolean; // true if below minimums (capped at 75)
  
  // Category breakdowns
  habitsScore: number; // 0-100 completion %
  habitsCount: number;
  tasksScore: number; // 0-100 completion %
  tasksAvgPerDay: number;
  nnScore: number; // 0-100 completion %
  nnCount: number;
  
  // Highlights
  totalTasksCompleted: number;
  totalDaysActive: number;
  longestStreak: number;
  personalHighlight: string;
  
  // Month-over-month
  scoreDelta?: number; // difference from previous month
  
  created_at: string;
  isInstallationReport?: boolean; // true for the Day 21 report
}

// === INSTALLATION PROGRESS ===

export interface InstallationProgress {
  current_day: number; // 1-21
  start_date: string;
  completed_days: number[];
  phase: InstallationPhase;
  activated: boolean; // true after Day 21 completion
}

// === LEGACY TYPES ===
// Kept for backward compatibility with existing localStorage data.
// Will be removed once migration to SA data model is complete.

export interface Entry {
  id: string;
  date: string;
  category: string;
  amount: number;
  unit: string;
  note?: string;
}

export interface Category {
  name: string;
  type: string;
  displayUnit: string;
  isHabit?: boolean;
  activityRecord?: number;
}

export interface Converter {
  unit: string;
  type: string;
  baseUnit: string;
  factorToBase: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  completedDates: string[];
  createdAt: string;
}

export interface ScheduleItem {
  id: string;
  day: string;
  task_date?: string;
  time: string;
  title: string;
  description?: string;
  targetNumber?: number;
  duration?: string;
  distance?: string;
  weight?: string;
  linkedGoalId?: string;
  completed: boolean;
  completedDates: string[];
  completedCounts?: { [date: string]: number };
  createdAt: string;
}

export interface ParsedAmount {
  value: number;
  unit: string;
}
