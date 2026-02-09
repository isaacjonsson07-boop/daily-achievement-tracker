import React, { useMemo } from 'react';
import { Target, Zap, TrendingUp, CheckSquare } from 'lucide-react';
import { Entry, Category, Converter, ScheduleItem } from '../types';
import { formatSingleUnit } from '../utils/formatting';

interface TodayTotalsProps {
  entries: Entry[];
  categories: Category[];
  converters: Converter[];
  scheduleItems: ScheduleItem[];
}

export function TodayTotals({ entries, categories, converters, scheduleItems }: TodayTotalsProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const todayStats = useMemo(() => {
    const todayEntries = entries.filter(entry => entry.date === today);
    const uniqueCategories = new Set(todayEntries.map(entry => entry.category)).size;

    // Count unique activities today (entries + tasks)
    const uniqueActivities = new Set<string>();

    // Add regular entries
    todayEntries.forEach(entry => {
      uniqueActivities.add(`entry-${entry.id}`);
    });

    // Add completed tasks
    scheduleItems.forEach(task => {
      if (task.completedDates.includes(today)) {
        uniqueActivities.add(`task-${task.id}`);
      }
    });

    // Get today's completed schedule items count
    const todayCompletedTasks = scheduleItems.filter(item =>
      item.completedDates.includes(today)
    ).length;

    const totalTodayTasks = scheduleItems.length;

    const habitCategories = categories.filter(cat => cat.isHabit);
    const completedHabits = habitCategories.filter(habit =>
      todayEntries.some(entry => entry.category === habit.name)
    ).length;
    const habitCompletionRate = habitCategories.length > 0
      ? Math.round((completedHabits / habitCategories.length) * 100)
      : 0;

    return {
      totalActivities: uniqueActivities.size,
      uniqueCategories,
      completedTasks: todayCompletedTasks,
      totalTasks: totalTodayTasks,
      habitCompletionRate,
      completedHabits,
      totalHabits: habitCategories.length
    };
  }, [entries, categories, scheduleItems, today]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Amount</span>
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
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tasks Done</span>
          <CheckSquare className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {todayStats.totalTasks === 0 ? '—' : `${todayStats.completedTasks}/${todayStats.totalTasks}`}
        </div>
        {todayStats.totalTasks > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {Math.round((todayStats.completedTasks / todayStats.totalTasks) * 100)}% complete
          </div>
        )}
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