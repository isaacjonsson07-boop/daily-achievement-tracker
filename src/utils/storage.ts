import { Entry, Category, Converter, Task } from '../types';
import { Goal } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_CONVERTERS, STORAGE_KEY } from '../constants';

export interface StorageData {
  entries: Entry[];
  categories: Category[];
  converters: Converter[];
  tasks: Task[];
  goals: Goal[];
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}