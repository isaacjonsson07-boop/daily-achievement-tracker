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

export interface ParsedAmount {
  value: number;
  unit: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  completedDates: string[]; // Array of dates when this task was completed
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  unit: string;
  targetDate: string;
  createdAt: string;
  completed: boolean;
  completedAt?: string;
  goalType?: 'task' | 'time' | 'distance';
  duration?: string;
  distance?: string;
  durDays?: number;
  durWeeks?: number;
  durMonths?: number;
}

export interface JournalEntry {
  id: string;
  dayNumber: number;
  title: string;
  content: string;
  answers?: { [key: string]: string }; // For structured journal entries with multiple questions
  lastModified: string;
  userId?: string;
}

export type TabType = 'log' | 'stats' | 'tasks' | 'journaling' | 'settings' | 'help';

export interface ScheduleItem {
  id: string;
  day: string; // 'monday', 'tuesday', etc.
  time: string; // '09:00'
  title: string;
  description?: string;
  targetNumber?: number; // For task-based items, how many times to complete
  duration?: string; // For time-based tasks like "30min", "1h 30m"
  distance?: string; // For distance-based tasks like "5km", "3 miles"
  linkedGoalId?: string; // Link to a Goal ID to auto-update progress
  completed: boolean; // This will track completion for the current week
  completedDates: string[]; // Track which specific dates this was completed
  completedCounts?: { [date: string]: number }; // Track how many times completed on each date
  createdAt: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  target_number: number;
  days_of_week: number[]; // 0=Sunday, 1=Monday, 2=Tuesday, etc.
  time: string;
  description?: string;
  duration?: string;
  distance?: string;
  linked_goal_id?: string;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completion_date: string;
  completed_number: number;
  created_at: string;
}