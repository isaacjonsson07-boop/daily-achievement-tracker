import { Entry, Category, Converter, Task } from '../types';
import { Goal, JournalEntry, ScheduleItem, Habit, HabitCompletion } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_CONVERTERS, STORAGE_KEY } from '../constants';

export interface StorageData {
  entries: Entry[];
  categories: Category[];
  converters: Converter[];
  tasks: Task[];
  goals: Goal[];
  journalEntries: JournalEntry[];
  scheduleItems: ScheduleItem[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  month: string;
}

export function loadFromStorage(): Partial<StorageData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      const result: Partial<StorageData> = {};
      
      if (p.entries) result.entries = p.entries;
      if (p.converters) result.converters = p.converters;
      if (p.tasks) result.tasks = p.tasks;
      if (p.goals) result.goals = p.goals;
      if (p.journalEntries) result.journalEntries = p.journalEntries;
      if (p.scheduleItems) result.scheduleItems = p.scheduleItems;
      if (p.habits) result.habits = p.habits;
      if (p.habitCompletions) result.habitCompletions = p.habitCompletions;
      if (p.month) result.month = p.month;
      if (p.categories) {
        if (Array.isArray(p.categories) && typeof p.categories[0] === 'string') {
          result.categories = p.categories.map((n: string) => ({ name: n, type: 'Time', displayUnit: 'Auto' }));
        } else {
          result.categories = p.categories;
        }
      }
      return result;
    }
    
    // Check for legacy versions
    const legacy = localStorage.getItem("dj_pro_v2") || localStorage.getItem("dj_pro_v1");
    if (legacy) {
      const p = JSON.parse(legacy);
      const result: Partial<StorageData> = {};
      
      if (p.entries) result.entries = p.entries;
      if (p.converters) result.converters = p.converters;
      if (p.tasks) result.tasks = p.tasks;
      if (p.goals) result.goals = p.goals;
      if (p.journalEntries) result.journalEntries = p.journalEntries;
      if (p.scheduleItems) result.scheduleItems = p.scheduleItems;
      if (p.habits) result.habits = p.habits;
      if (p.habitCompletions) result.habitCompletions = p.habitCompletions;
      if (p.month) result.month = p.month;
      if (p.categories) {
        if (Array.isArray(p.categories) && typeof p.categories[0] === 'string') {
          result.categories = p.categories.map((n: string) => ({ name: n, type: 'Time', displayUnit: 'Auto' }));
        } else {
          result.categories = p.categories;
        }
      }
      return result;
    }
  } catch (e) {
    console.warn('Load failed', e);
  }
  return {};
}

export function saveToStorage(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...data,
    updated_at: new Date().toISOString()
  }));
}

export function getLocalUpdatedAt(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return p.updated_at || null;
    }
  } catch {
    // ignore
  }
  return null;
}