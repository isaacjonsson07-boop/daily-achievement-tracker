import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Clock, Target, Star, StarOff, ChevronDown, ChevronRight, Plus, Edit3, Trash2, CheckCircle, Calendar } from 'lucide-react';
import { Entry, Category, Converter, Goal } from '../types';
import { formatSingleUnit, humanizeTime, humanizeDistance } from '../utils/formatting';
import { formatDisplayDate, uid, fmtDateISO } from '../utils/dateUtils';
import { parseAmountByType, amountPlaceholderByType } from '../utils/parsing';

interface StatsViewProps {
  entries: Entry[];
  categories: Category[];
  converters: Converter[];
  goals: Goal[];
  onUpdateCategories: (categories: Category[]) => void;
  onAddGoal: (goal: Goal) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

export function StatsView({ entries, categories, converters, goals, onUpdateCategories, onAddGoal, onUpdateGoal, onDeleteGoal }: StatsViewProps) {
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);
  const [showAddGoalForm, setShowAddGoalForm] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<Goal | null>(null);
  const [retryingGoal, setRetryingGoal] = React.useState<string | null>(null);
  const [newRetryDate, setNewRetryDate] = React.useState('');
  const [newGoal, setNewGoal] = React.useState({
    title: '',
    description: '',
    category: categories[0]?.name || '',
    targetAmount: '',
    targetDate: ''
  });
  
  const isOverdue = (targetDate: string): boolean => {
    return new Date(targetDate) < new Date();
  };

  // Helper function to calculate current streak and activity record for a category
  const calculateBestStreak = (categoryName: string): number => {
    const categoryEntries = entries
      .filter(entry => entry.category === categoryName)
      .map(entry => entry.date)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()); // Sort ascending for chronological order
    
    if (categoryEntries.length === 0) return 0;
    
    const uniqueDates = [...new Set(categoryEntries)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    let maxStreak = 0;
    let currentStreak = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currentDate = new Date(uniqueDates[i]);
      const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        currentStreak++;
      } else {
        // Gap in streak
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    // Don't forget to check the final streak
    maxStreak = Math.max(maxStreak, currentStreak);
    
    return maxStreak;
  };

  // Helper function to calculate activity record (highest single amount) from all entries
  const calculateActivityRecord = (categoryName: string): number => {
    const categoryEntries = entries
      .filter(entry => entry.category === categoryName);
    
    if (categoryEntries.length === 0) return 0;
    
    // Group entries by date and sum amounts for each day
    const dailyTotals = new Map<string, number>();
    
    categoryEntries.forEach(entry => {
      const currentTotal = dailyTotals.get(entry.date) || 0;
      dailyTotals.set(entry.date, currentTotal + entry.amount);
    });
    
    // Return the highest daily total
    return Math.max(...Array.from(dailyTotals.values()));
  };

  // Update activity records when entries change
  React.useEffect(() => {
    let hasUpdates = false;
    const updatedCategories = categories.map(category => {
      const currentRecord = calculateActivityRecord(category.name);
      const storedRecord = category.activityRecord || 0;
      
      // Update activity record if current record is higher
      const newRecord = Math.max(currentRecord, storedRecord);
      
      if (newRecord !== storedRecord) {
        hasUpdates = true;
        return { ...category, activityRecord: newRecord };
      }
      
      return category;
    });
    
    if (hasUpdates) {
      onUpdateCategories(updatedCategories);
    }
  }, [entries, categories, onUpdateCategories]);

  // Calculate current progress for each goal based on entries
  const goalsWithProgress = useMemo(() => {
    return goals.map(goal => {
      const categoryEntries = entries.filter(entry => entry.category === goal.category);
      const totalAmount = categoryEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const progress = goal.targetAmount > 0 ? Math.min((totalAmount / goal.targetAmount) * 100, 100) : 0;
      const isCompleted = totalAmount >= goal.targetAmount;
      
      // Auto-complete goal if target is reached
      if (isCompleted && !goal.completed) {
        const updatedGoal = { 
          ...goal, 
          completed: true, 
          completedAt: new Date().toISOString(),
          currentAmount: goal.targetAmount // Cap at target amount when completing
        };
        onUpdateGoal(updatedGoal);
        return updatedGoal;
      }
      
      // For completed goals, don't let current amount exceed target
      const displayAmount = goal.completed ? goal.targetAmount : totalAmount;
      return { ...goal, currentAmount: displayAmount, progress, isCompleted };
    });
  }, [goals, entries, onUpdateGoal]);

  const activeGoals = goalsWithProgress.filter(goal => !goal.completed);
  const completedGoals = goalsWithProgress.filter(goal => goal.completed);
  const failedGoals = activeGoals.filter(goal => isOverdue(goal.targetDate));
  const activeNonOverdueGoals = activeGoals.filter(goal => !isOverdue(goal.targetDate));

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim() || !newGoal.targetAmount) return;

    const category = categories.find(c => c.name === newGoal.category);
    const categoryType = category?.type || 'Time';
    const parsed = parseAmountByType(newGoal.targetAmount, categoryType, converters);
    
    if (!parsed) {
      alert('Could not parse target amount. Please check the format.');
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
      targetDate: newGoal.targetDate,
      createdAt: new Date().toISOString(),
      completed: false
    };

    onAddGoal(goal);
    setNewGoal({
      title: '',
      description: '',
      category: categories[0]?.name || '',
      targetAmount: '',
      targetDate: ''
    });
    setShowAddGoalForm(false);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate
    });
    setShowAddGoalForm(true);
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !newGoal.title.trim() || !newGoal.targetAmount) return;

    const category = categories.find(c => c.name === newGoal.category);
    const categoryType = category?.type || 'Time';
    const parsed = parseAmountByType(newGoal.targetAmount, categoryType, converters);
    
    if (!parsed) {
      alert('Could not parse target amount. Please check the format.');
      return;
    }

    const updatedGoal: Goal = {
      ...editingGoal,
      title: newGoal.title.trim(),
      description: newGoal.description.trim() || undefined,
      category: newGoal.category,
      targetAmount: parsed.value,
      unit: parsed.unit,
      targetDate: newGoal.targetDate
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
    setShowAddGoalForm(false);
  };

  const handleRetryGoal = (goal: Goal) => {
    setRetryingGoal(goal.id);
    setNewRetryDate(fmtDateISO(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))); // Default to 30 days from now
  };

  const handleConfirmRetry = (goal: Goal) => {
    if (!newRetryDate) return;
    
    const updatedGoal: Goal = {
      ...goal,
      targetDate: newRetryDate,
      createdAt: new Date().toISOString() // Reset creation date to track as new attempt
    };
    onUpdateGoal(updatedGoal);
    setRetryingGoal(null);
    setNewRetryDate('');
  };

  const handleCancelRetry = () => {
    setRetryingGoal(null);
    setNewRetryDate('');
  };

  const getCategoryType = (categoryName: string): string => {
    const cat = categories.find(c => c.name === categoryName);
    return cat?.type || 'Time';
  };

  const formatGoalAmount = (goal: Goal): string => {
    const categoryType = getCategoryType(goal.category);
    return formatSingleUnit(categoryType, goal.targetAmount, goal.unit, converters);
  };

  const formatCurrentAmount = (goal: Goal): string => {
    const categoryType = getCategoryType(goal.category);
    return formatSingleUnit(categoryType, goal.currentAmount, goal.unit, converters);
  };

  const stats = useMemo(() => {
    const categoryTotals = new Map<string, number>();
    const categoryTypes = new Map<string, string>();
    const categoryDays = new Map<string, Set<string>>();
    
    categories.forEach(cat => {
      categoryTypes.set(cat.name, cat.type);
      categoryDays.set(cat.name, new Set());
    });
    
    entries.forEach(entry => {
      const current = categoryTotals.get(entry.category) || 0;
      categoryTotals.set(entry.category, current + entry.amount);
      
      const days = categoryDays.get(entry.category) || new Set();
      days.add(entry.date);
      categoryDays.set(entry.category, days);
    });
    
    const categoryStats = Array.from(categoryTotals.entries()).map(([name, total]) => {
      const type = categoryTypes.get(name) || 'Time';
      const baseUnit = type === 'Time' ? 'Hours' : type === 'Distance' ? 'Km' : 'Times';
      const category = categories.find(c => c.name === name);
      const activeDays = categoryDays.get(name)?.size || 0;
      const avgPerDay = activeDays > 0 ? total / activeDays : 0;
      const bestStreak = calculateBestStreak(name);
      const activityRecord = category?.activityRecord || 0;
      
      return {
        name,
        type,
        total,
        baseUnit,
        entryCount: entries.filter(e => e.category === name).length,
        formattedTotal: formatSingleUnit(type, total, baseUnit, converters),
        isHabit: category?.isHabit || false,
        activeDays,
        avgPerDay,
        formattedAvgPerDay: formatSingleUnit(type, avgPerDay, baseUnit, converters),
        bestStreak,
        activityRecord,
        formattedRecord: activityRecord > 0 ? formatSingleUnit(type, activityRecord, baseUnit, converters) : ''
      };
    });

    // Add habit categories that don't have entries yet
    categories.forEach(category => {
      if (category.isHabit && !categoryStats.find(stat => stat.name === category.name)) {
        const type = category.type;
        const baseUnit = type === 'Time' ? 'Hours' : type === 'Distance' ? 'Km' : 'Times';
        const bestStreak = calculateBestStreak(category.name);
        const activityRecord = category.activityRecord || 0;
        categoryStats.push({
          name: category.name,
          type,
          total: 0,
          baseUnit,
          entryCount: 0,
          formattedTotal: formatSingleUnit(type, 0, baseUnit, converters),
          isHabit: true,
          activeDays: 0,
          avgPerDay: 0,
          formattedAvgPerDay: formatSingleUnit(type, 0, baseUnit, converters),
          bestStreak,
          activityRecord,
          formattedRecord: ''
        });
      }
    });

    return categoryStats.sort((a, b) => {
      // Sort habits first, then by total
      if (a.isHabit && !b.isHabit) return -1;
      if (!a.isHabit && b.isHabit) return 1;
      return b.total - a.total;
    });
    
  }, [entries, categories, converters]);

  const goalStats = {
    total: goals.length,
    active: activeNonOverdueGoals.length,
    completed: completedGoals.length,
    failed: failedGoals.length,
    completionRate: (() => {
      // Only count goals that are either completed or overdue (finished goals)
      const finishedGoals = [...completedGoals, ...failedGoals];
      return finishedGoals.length > 0 ? Math.round((completedGoals.length / finishedGoals.length) * 100) : 0;
    })()
  };

  const allTimeStats = useMemo(() => {
    const categoryTotals = new Map<string, number>();
    const categoryTypes = new Map<string, string>();
    
    categories.forEach(cat => {
      categoryTypes.set(cat.name, cat.type);
    });
    
    entries.forEach(entry => {
      const current = categoryTotals.get(entry.category) || 0;
      categoryTotals.set(entry.category, current + entry.amount);
    });
    
    const categoryStats = Array.from(categoryTotals.entries()).map(([name, total]) => {
      const type = categoryTypes.get(name) || 'Time';
      const baseUnit = type === 'Time' ? 'Hours' : type === 'Distance' ? 'Km' : 'Times';
      const categoryEntries = entries.filter(e => e.category === name);
      return {
        name,
        type,
        total,
        baseUnit,
        entryCount: categoryEntries.length,
        formattedTotal: formatSingleUnit(type, total, baseUnit, converters),
        entries: categoryEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    });

    return categoryStats.sort((a, b) => b.total - a.total);
  }, [entries, categories, converters]);
  const toggleHabit = (categoryName: string) => {
    const updatedCategories = categories.map(cat => 
      cat.name === categoryName 
        ? { ...cat, isHabit: !cat.isHabit }
        : cat
    );
    onUpdateCategories(updatedCategories);
  };

  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  return (
    <div className="space-y-6">
      {/* Goal Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Total Active Goals</p>
              <p className="text-2xl font-bold">{goalStats.active}</p>
            </div>
            <Clock className="w-6 h-6 text-amber-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-2xl font-bold">{goalStats.completed}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Success Rate</p>
              <p className="text-2xl font-bold">{goalStats.completionRate}%</p>
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
              setShowAddGoalForm(!showAddGoalForm);
              if (showAddGoalForm) {
                setEditingGoal(null);
                setNewGoal({
                  title: '',
                  description: '',
                  category: categories[0]?.name || '',
                  targetAmount: '',
                  targetDate: ''
                });
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingGoal ? 'Cancel Edit' : 'New Goal'}
          </button>
        </div>

        {showAddGoalForm && (
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
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Amount ({getCategoryType(newGoal.category)})
                </label>
                <input
                  type="text"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  placeholder={amountPlaceholderByType(getCategoryType(newGoal.category))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date</label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
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
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Target className="w-4 h-4 mr-2" />
              {editingGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </form>
        )}
      </div>

      {/* Active Goals */}
      {activeNonOverdueGoals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Active Goals ({activeNonOverdueGoals.length})
          </h3>
          
          <div className="space-y-4">
            {activeNonOverdueGoals.map(goal => (
              <div key={goal.id} className="border dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white">{goal.title}</h4>
                    {goal.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{goal.category}</span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(goal.targetDate).toLocaleDateString()}
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
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this goal?')) {
                          onDeleteGoal(goal.id);
                        }
                      }}
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



      {/* Today's Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Today's Achievements
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <Star className="w-4 h-4 inline mr-1" />
            Habits stay visible
          </div>
        </div>
        
        {stats.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data to display yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map(stat => (
              <div key={stat.name} className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-600 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">{stat.entryCount} entries</span>
                    <button
                      onClick={() => toggleHabit(stat.name)}
                      className={`p-1 rounded transition-colors ${
                        stat.isHabit 
                          ? 'text-amber-500 bg-amber-100 hover:text-amber-600 hover:bg-amber-200' 
                          : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                      }`}
                      title={stat.isHabit ? 'Remove from habits' : 'Add to habits'}
                    >
                      {stat.isHabit ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.formattedTotal} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({stat.formattedAvgPerDay}/day)</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.activeDays} active days
                  </span>
                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                      🔥 {stat.bestStreak} best streak
                    </span>
                    {stat.activityRecord > 0 && (
                      <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                        🎯 {stat.formattedRecord} record
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Time Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          All Time Achievements
        </h3>
        
        {allTimeStats.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No activities recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Activities</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">View</th>
                </tr>
              </thead>
              <tbody>
            {allTimeStats.map(stat => (
              <React.Fragment key={stat.name}>
                <tr className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleCategoryExpansion(stat.name)}
                      className="flex items-center text-gray-800 dark:text-white hover:text-blue-600 transition-colors"
                    >
                      {expandedCategory === stat.name ? (
                        <ChevronDown className="w-4 h-4 mr-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-2" />
                      )}
                      <span className="font-medium">{stat.name}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 font-semibold text-blue-600">{stat.formattedTotal}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{stat.entryCount}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{stat.type}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleCategoryExpansion(stat.name)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      {expandedCategory === stat.name ? 'Hide' : 'Show'}
                    </button>
                  </td>
                </tr>
                
                {expandedCategory === stat.name && (
                  <tr>
                    <td colSpan={5} className="py-0">
                      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-600">
                                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Amount</th>
                                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stat.entries.map(entry => (
                                <tr key={entry.id} className="border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                                  <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">{formatDisplayDate(entry.date)}</td>
                                  <td className="py-2 px-3 text-sm font-medium text-gray-800 dark:text-white">
                                    {formatSingleUnit(stat.type, entry.amount, entry.unit, converters)}
                                  </td>
                                  <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">
                                    {entry.note || '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this completed goal?')) {
                        onDeleteGoal(goal.id);
                      }
                    }}
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

      {/* Failed Goals */}
      {failedGoals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-red-500" />
            Failed Goals ({failedGoals.length})
          </h3>
          
          <div className="space-y-4">
            {failedGoals.map(goal => (
              <div key={goal.id} className="border dark:border-gray-600 rounded-lg p-4 bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700">
                {retryingGoal === goal.id ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-2">{goal.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Set a new target date to give this goal another try:</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Target Date</label>
                        <input
                          type="date"
                          value={newRetryDate}
                          onChange={(e) => setNewRetryDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min={fmtDateISO(new Date())}
                        />
                      </div>
                      <div className="flex space-x-2 pt-6">
                        <button
                          onClick={() => handleConfirmRetry(goal)}
                          disabled={!newRetryDate}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          Retry Goal
                        </button>
                        <button
                          onClick={handleCancelRetry}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-white">{goal.title}</h4>
                        {goal.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{goal.category}</span>
                          <span className="flex items-center text-red-600 dark:text-red-400 font-medium">
                            <Calendar className="w-4 h-4 mr-1" />
                            Overdue: {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRetryGoal(goal)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Give it another try
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to permanently delete this goal?')) {
                              onDeleteGoal(goal.id);
                            }
                          }}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress when failed</span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {formatCurrentAmount(goal)} / {formatGoalAmount(goal)} ({Math.round(goal.progress)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-red-500 transition-all duration-300"
                          style={{ width: `${Math.min(goal.progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
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
    </div>
  );
}