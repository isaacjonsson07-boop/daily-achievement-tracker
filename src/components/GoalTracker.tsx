import React, { useState, useMemo } from 'react';
import { Target, Plus, Edit3, Trash2, CheckCircle, Clock, TrendingUp, Calendar } from 'lucide-react';
import { Goal, Entry, Category, Converter, ScheduleItem, Habit, HabitCompletion } from '../types';
import { formatSingleUnit } from '../utils/formatting';
import { uid, fmtDateISO } from '../utils/dateUtils';
import { parseAmountByType, amountPlaceholderByType } from '../utils/parsing';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { formatCountdown, calculateTargetDateFromDuration, formatTargetDatePreview, isOverdue } from '../utils/goalUtils';

interface GoalTrackerProps {
  goals: Goal[];
  entries: Entry[];
  categories: Category[];
  converters: Converter[];
  scheduleItems: ScheduleItem[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  onAddGoal: (goal: Goal) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

export function GoalTracker({
  goals,
  entries,
  categories,
  converters,
  scheduleItems,
  habits,
  habitCompletions,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal
}: GoalTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: categories[0]?.name || '',
    targetAmount: '',
    targetDate: ''
  });
  const [targetAmountError, setTargetAmountError] = useState<string>('');
  const [deadlineMode, setDeadlineMode] = useState<'exact' | 'duration'>('duration');
  const [durDays, setDurDays] = useState(0);
  const [durWeeks, setDurWeeks] = useState(1);
  const [durMonths, setDurMonths] = useState(0);

  // Calculate current progress for each goal based on entries or task/habit completions
  const goalsWithProgress = useMemo(() => {
    return goals.map(goal => {
      // Check if this goal is linked to any tasks or habits
      const hasLinkedTasks = scheduleItems.some(item => item.linkedGoalId === goal.id);
      const hasLinkedHabits = habits.some(habit => habit.linked_goal_id === goal.id);

      let currentAmount = goal.currentAmount;

      // Only calculate from entries if the goal is NOT linked to tasks or habits
      // Task/habit-linked goals are updated directly when tasks/habits are completed
      if (!hasLinkedTasks && !hasLinkedHabits) {
        const categoryEntries = entries.filter(entry =>
          entry.category === goal.category &&
          new Date(entry.date) >= new Date(goal.createdAt)
        );
        currentAmount = categoryEntries.reduce((sum, entry) => sum + entry.amount, 0);
      }

      const target = Number(goal.targetAmount) || 0;
      const current = Number(currentAmount) || 0;
      const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
      const isGoalCompleted = current >= target && target > 0;

      // Auto-complete goal if target is reached
      if (isGoalCompleted && !goal.completed) {
        console.log('[GOAL AUTO-COMPLETE DEBUG - GoalTracker]', {
          goalId: goal.id,
          goalTitle: goal.title,
          goalUnit: goal.unit,
          currentAmount: current,
          targetAmount: target,
          hasLinkedTasks,
          hasLinkedHabits,
          isGoalCompleted,
          ratio: target ? current / target : null
        });

        const updatedGoal = {
          ...goal,
          completed: true,
          completedAt: new Date().toISOString(),
          currentAmount: Math.min(current, target)
        };
        onUpdateGoal(updatedGoal);
        return updatedGoal;
      }

      return { ...goal, currentAmount: current, progress, isCompleted: isGoalCompleted };
    });
  }, [goals, entries, scheduleItems, habits, onUpdateGoal]);

  const activeGoals = goalsWithProgress.filter(goal => !goal.completed);
  const completedGoals = goalsWithProgress.filter(goal => goal.completed);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim() || !newGoal.targetAmount) return;

    let targetDate = newGoal.targetDate;
    if (deadlineMode === 'duration') {
      if (durDays === 0 && durWeeks === 0 && durMonths === 0) return;
      targetDate = calculateTargetDateFromDuration(durDays, durWeeks, durMonths);
    }

    if (!targetDate) return;

    const category = categories.find(c => c.name === newGoal.category);
    const categoryType = category?.type || 'Time';

    if (categoryType === 'Count') {
      if (!validateTaskAmount(newGoal.targetAmount)) {
        setTargetAmountError('Target amount must be a whole number greater than 0.');
        return;
      }
    }

    const parsed = parseAmountByType(newGoal.targetAmount, categoryType, converters);

    if (!parsed) {
      alert('Could not parse target amount. Please check the format.');
      return;
    }

    if (categoryType === 'Count' && (!Number.isInteger(parsed.value) || parsed.value <= 0)) {
      setTargetAmountError('Target amount must be a whole number greater than 0.');
      return;
    }

    const goal: Goal = {
      id: uid(),
      title: newGoal.title.trim(),
      description: newGoal.description.trim() || undefined,
      category: newGoal.category,
      targetAmount: parsed.value,
      currentAmount: 0,
      unit: parsed.unit,
      targetDate: targetDate,
      createdAt: new Date().toISOString(),
      completed: false,
      goalType: categoryType === 'Distance' ? 'distance' : categoryType === 'Time' ? 'time' : 'task',
      distance: categoryType === 'Distance' ? newGoal.targetAmount : undefined,
      duration: categoryType === 'Time' ? newGoal.targetAmount : undefined
    };

    onAddGoal(goal);
    setNewGoal({
      title: '',
      description: '',
      category: categories[0]?.name || '',
      targetAmount: '',
      targetDate: ''
    });
    setTargetAmountError('');
    setDeadlineMode('duration');
    setDurDays(0);
    setDurWeeks(1);
    setDurMonths(0);
    setShowAddForm(false);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    const categoryType = getCategoryType(goal.category, goal);
    const targetAmountStr = categoryType === 'Count'
      ? String(Math.trunc(goal.targetAmount))
      : goal.targetAmount.toString();

    setNewGoal({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      targetAmount: targetAmountStr,
      targetDate: goal.targetDate
    });
    setTargetAmountError('');
    setDeadlineMode('exact');
    setDurDays(0);
    setDurWeeks(0);
    setDurMonths(0);
    setShowAddForm(true);
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !newGoal.title.trim() || !newGoal.targetAmount) return;

    let targetDate = newGoal.targetDate;
    if (deadlineMode === 'duration') {
      if (durDays === 0 && durWeeks === 0 && durMonths === 0) return;
      targetDate = calculateTargetDateFromDuration(durDays, durWeeks, durMonths);
    }
    if (!targetDate) return;

    const category = categories.find(c => c.name === newGoal.category);
    const categoryType = category?.type || 'Time';

    if (categoryType === 'Count') {
      if (!validateTaskAmount(newGoal.targetAmount)) {
        setTargetAmountError('Target amount must be a whole number greater than 0.');
        return;
      }
    }

    const parsed = parseAmountByType(newGoal.targetAmount, categoryType, converters);

    if (!parsed) {
      alert('Could not parse target amount. Please check the format.');
      return;
    }

    if (categoryType === 'Count' && (!Number.isInteger(parsed.value) || parsed.value <= 0)) {
      setTargetAmountError('Target amount must be a whole number greater than 0.');
      return;
    }

    const updatedGoal: Goal = {
      ...editingGoal,
      title: newGoal.title.trim(),
      description: newGoal.description.trim() || undefined,
      category: newGoal.category,
      targetAmount: parsed.value,
      unit: parsed.unit,
      targetDate,
      goalType: categoryType === 'Distance' ? 'distance' : categoryType === 'Time' ? 'time' : 'task',
      distance: categoryType === 'Distance' ? newGoal.targetAmount : undefined,
      duration: categoryType === 'Time' ? newGoal.targetAmount : undefined
    };

    onUpdateGoal(updatedGoal);
    setEditingGoal(null);
    setNewGoal({
      title: '',
      description: '',
      category: categories[0]?.name || '',
      targetAmount: '',
      targetDate: ''
    });
    setTargetAmountError('');
    setDeadlineMode('duration');
    setDurDays(0);
    setDurWeeks(1);
    setDurMonths(0);
    setShowAddForm(false);
  };

  const getCategoryType = (categoryName: string, goal?: Goal): string => {
    const cat = categories.find(c => c.name === categoryName);
    const categoryType = cat?.type || 'Time';

    if (goal) {
      if (goal.distance) return 'Distance';
      if (goal.duration) return 'Time';
      if (goal.goalType === 'distance') return 'Distance';
      if (goal.goalType === 'time') return 'Time';
      if (goal.goalType === 'task') return 'Count';
    }

    return categoryType;
  };

  const isTaskGoal = (categoryName: string): boolean => {
    return getCategoryType(categoryName) === 'Count';
  };

  const validateTaskAmount = (value: string): boolean => {
    if (!value.trim()) return false;
    const numValue = parseInt(value, 10);
    return Number.isInteger(numValue) && numValue > 0 && /^\d+$/.test(value.trim());
  };

  const handleTargetAmountChange = (value: string) => {
    const categoryType = getCategoryType(newGoal.category);

    if (categoryType === 'Count') {
      const digitsOnly = value.replace(/\D/g, '');
      setNewGoal({ ...newGoal, targetAmount: digitsOnly });
      setTargetAmountError('');
    } else {
      setNewGoal({ ...newGoal, targetAmount: value });
      setTargetAmountError('');
    }
  };

  const handleTargetAmountBlur = () => {
    const categoryType = getCategoryType(newGoal.category);

    if (categoryType === 'Count') {
      if (!newGoal.targetAmount || newGoal.targetAmount === '0') {
        setTargetAmountError('Target amount must be a whole number greater than 0.');
      } else if (!validateTaskAmount(newGoal.targetAmount)) {
        setTargetAmountError('Target amount must be a whole number.');
      }
    }
  };

  const isFormValid = (): boolean => {
    if (!newGoal.title.trim() || !newGoal.targetAmount) return false;

    if (deadlineMode === 'exact' && !newGoal.targetDate) return false;
    if (deadlineMode === 'duration' && durDays === 0 && durWeeks === 0 && durMonths === 0) return false;

    const categoryType = getCategoryType(newGoal.category);
    if (categoryType === 'Count') {
      return validateTaskAmount(newGoal.targetAmount);
    }

    return true;
  };

  const formatGoalAmount = (goal: Goal): string => {
    const categoryType = getCategoryType(goal.category, goal);
    return formatSingleUnit(categoryType, goal.targetAmount, goal.unit, converters);
  };

  const formatCurrentAmount = (goal: Goal): string => {
    const categoryType = getCategoryType(goal.category, goal);
    return formatSingleUnit(categoryType, goal.currentAmount, goal.unit, converters);
  };

  const stats = {
    total: goals.length,
    active: activeGoals.length,
    completed: completedGoals.length,
    completionRate: goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0
  };

  return (
    <div className="space-y-6">
      {/* Goal Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Goals</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Target className="w-6 h-6 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <Clock className="w-6 h-6 text-amber-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Success Rate</p>
              <p className="text-2xl font-bold">{stats.completionRate}%</p>
            </div>
            <TrendingUp className="w-6 h-6 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Add/Edit Goal Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            {editingGoal ? 'Edit Goal' : 'Goals'}
          </h3>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (showAddForm) {
                setEditingGoal(null);
                setNewGoal({
                  title: '',
                  description: '',
                  category: categories[0]?.name || '',
                  targetAmount: '',
                  targetDate: ''
                });
                setTargetAmountError('');
                setDeadlineMode('duration');
                setDurDays(0);
                setDurWeeks(1);
                setDurMonths(0);
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingGoal ? 'Cancel Edit' : 'Add Goal'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={editingGoal ? handleUpdateGoal : handleAddGoal} className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Run 100km this month"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => {
                    setNewGoal({ ...newGoal, category: e.target.value });
                    setTargetAmountError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Amount ({getCategoryType(newGoal.category)})
              </label>
              <input
                type="text"
                inputMode={isTaskGoal(newGoal.category) ? "numeric" : undefined}
                pattern={isTaskGoal(newGoal.category) ? "[0-9]*" : undefined}
                value={newGoal.targetAmount}
                onChange={(e) => handleTargetAmountChange(e.target.value)}
                onBlur={handleTargetAmountBlur}
                placeholder={amountPlaceholderByType(getCategoryType(newGoal.category))}
                className={`w-full px-3 py-2 border ${targetAmountError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 ${targetAmountError ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                required
              />
              {targetAmountError && (
                <p className="text-red-500 text-sm mt-1">{targetAmountError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deadline</label>

              <div className="flex space-x-2 mb-3">
                <button
                  type="button"
                  onClick={() => setDeadlineMode('duration')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    deadlineMode === 'duration'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Duration from now
                </button>
                <button
                  type="button"
                  onClick={() => setDeadlineMode('exact')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    deadlineMode === 'exact'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Exact date
                </button>
              </div>

              {deadlineMode === 'duration' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Days', value: durDays, set: setDurDays },
                      { label: 'Weeks', value: durWeeks, set: setDurWeeks },
                      { label: 'Months', value: durMonths, set: setDurMonths },
                    ].map(({ label, value, set }) => (
                      <div key={label} className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => set(value + 1)}
                          className="w-full flex justify-center py-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                        <span className="text-2xl font-bold text-gray-800 dark:text-white tabular-nums py-1">
                          {value}
                        </span>
                        <button
                          type="button"
                          onClick={() => set(Math.max(0, value - 1))}
                          className="w-full flex justify-center py-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</span>
                      </div>
                    ))}
                  </div>
                  {formatTargetDatePreview(durDays, durWeeks, durMonths) && (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      Target date: <span className="font-medium text-gray-800 dark:text-gray-200">{formatTargetDatePreview(durDays, durWeeks, durMonths)}</span>
                    </p>
                  )}
                </div>
              ) : (
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Describe your goal..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid()}
              className={`w-full py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                isFormValid()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              <Target className="w-4 h-4 mr-2" />
              {editingGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </form>
        )}
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Active Goals ({activeGoals.length})
          </h3>
          
          <div className="space-y-4">
            {activeGoals.map(goal => (
              <div key={goal.id} className="border dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white">{goal.title}</h4>
                    {goal.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{goal.category}</span>
                      <span className={`flex items-center font-medium ${isOverdue(goal.targetDate) ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>
                        <Clock className="w-4 h-4 mr-1" />
                        {formatCountdown(goal.targetDate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingGoalId(goal.id)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {formatCurrentAmount(goal)} / {formatGoalAmount(goal)} ({Math.round(goal.progress)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        goal.progress >= 100 ? 'bg-green-500' : 
                        goal.progress >= 75 ? 'bg-blue-500' : 
                        goal.progress >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Completed Goals ({completedGoals.length})
          </h3>
          
          <div className="space-y-3">
            {completedGoals.map(goal => (
              <div key={goal.id} className="border dark:border-gray-600 rounded-lg p-4 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      {goal.title}
                    </h4>
                    {goal.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-6">{goal.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400 ml-6">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{goal.category}</span>
                      <span>{formatCurrentAmount(goal)} / {formatGoalAmount(goal)}</span>
                      {goal.completedAt && (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          Completed {new Date(goal.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setDeletingGoalId(goal.id)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No goals set yet.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Create your first goal to start tracking your progress!</p>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deletingGoalId !== null}
        onConfirm={() => {
          if (deletingGoalId) {
            onDeleteGoal(deletingGoalId);
            setDeletingGoalId(null);
          }
        }}
        onCancel={() => setDeletingGoalId(null)}
      />
    </div>
  );
}