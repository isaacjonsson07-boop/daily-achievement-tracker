import React, { useMemo } from 'react';
import { Target, Zap, TrendingUp } from 'lucide-react';
import { Entry, Category, Converter } from '../types';
import { formatSingleUnit } from '../utils/formatting';

interface TodayTotalsProps {
  entries: Entry[];
  categories: Category[];
  converters: Converter[];
}

export function TodayTotals({ entries, categories, converters }: TodayTotalsProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const todayStats = useMemo(() => {
    const todayEntries = entries.filter(entry => entry.date === today);
    const uniqueCategories = new Set(todayEntries.map(entry => entry.category)).size;
    const habitCategories = categories.filter(cat => cat.isHabit);
    const completedHabits = habitCategories.filter(habit => 
      todayEntries.some(entry => entry.category === habit.name)
    ).length;
    const habitCompletionRate = habitCategories.length > 0 
      ? Math.round((completedHabits / habitCategories.length) * 100) 
      : 0;
    
    return {
      totalActivities: todayEntries.length,
      uniqueCategories,
      habitCompletionRate,
      completedHabits,
      totalHabits: habitCategories.length
    };
  }, [entries, categories, today]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Activities</span>
          <Target className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {todayStats.totalActivities === 0 ? '—' : todayStats.totalActivities}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Categories</span>
          <Zap className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {todayStats.uniqueCategories === 0 ? '—' : todayStats.uniqueCategories}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Habit Progress</span>
          <TrendingUp className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {todayStats.totalHabits === 0 ? '—' : `${todayStats.habitCompletionRate}%`}
        </div>
        {todayStats.totalHabits > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {todayStats.completedHabits}/{todayStats.totalHabits} habits
          </div>
        )}
      </div>
    </div>
  );
}