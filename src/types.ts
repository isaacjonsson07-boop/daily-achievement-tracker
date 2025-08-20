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
}

export type TabType = 'log' | 'stats' | 'tasks' | 'settings' | 'help';