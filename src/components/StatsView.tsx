import React, { useMemo, useRef, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Target, Star, StarOff, ChevronDown, ChevronRight, ChevronUp, Plus, Edit3, Trash2, CheckCircle, Calendar } from 'lucide-react';
import { Entry, Category, Converter, Goal, ScheduleItem, Habit, HabitCompletion } from '../types';
import { formatSingleUnit, humanizeTime, humanizeDistance } from '../utils/formatting';
import { formatDisplayDate, uid, fmtDateISO } from '../utils/dateUtils';
import { parseAmountByType, amountPlaceholderByType } from '../utils/parsing';
import { UpgradePrompt } from './UpgradePrompt';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { CreateItemModal } from './CreateItemModal';
import { formatCountdown, isOverdue, calculateTargetDateFromDuration, formatTargetDatePreview } from '../utils/goalUtils';

interface StatsViewProps {
  entries: Entry[];
  categories: Category[];
  converters: Converter[];
  goals: Goal[];
  scheduleItems: ScheduleItem[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  plan?: 'free' | 'paid';
  onUpdateCategories: (categories: Category[]) => void;
  onAddGoal: (goal: Goal) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

export function StatsView({ entries, categories, converters, goals, scheduleItems, habits, habitCompletions, plan = 'free', onUpdateCategories, onAddGoal, onUpdateGoal, onDeleteGoal }: StatsViewProps) {
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);
  const [showAddGoalForm, setShowAddGoalForm] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<Goal | null>(null);
  const [retryingGoal, setRetryingGoal] = React.useState<string | null>(null);
  const [newRetryDate, setNewRetryDate] = React.useState('');
  const [allTimeFilter, setAllTimeFilter] = React.useState<'latest' | 'by-type' | 'most-completed'>('latest');
  const [deletingGoalId, setDeletingGoalId] = React.useState<string | null>(null);
  const [newGoal, setNewGoal] = React.useState({
    title: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    goalType: 'task' as 'task' | 'time' | 'distance',
    duration: '',
    distance: ''
  });
  const [targetAmountError, setTargetAmountError] = React.useState<string>('');
  const [deadlineMode, setDeadlineMode] = React.useState<'exact' | 'duration'>('duration');
  const [durDays, setDurDays] = React.useState(0);
  const [durWeeks, setDurWeeks] = React.useState(0);
  const [durMonths, setDurMonths] = React.useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [newGoal.description, showAddGoalForm]);

  const sanitizeWholeNumber = (raw: string): string => {
    return raw.replace(/[^0-9]/g, '');
  };

  const isCountGoal = newGoal.goalType === 'task';

  const handleTargetAmountChange = (value: string) => {
    if (isCountGoal) {
      const sanitized = sanitizeWholeNumber(value);
      setNewGoal({ ...newGoal, targetAmount: sanitized });
      setTargetAmountError('');
    } else {
      setNewGoal({ ...newGoal, targetAmount: value });
      setTargetAmountError('');
    }
  };

  const handleTargetAmountBlur = () => {
    if (isCountGoal && newGoal.targetAmount) {
      const numValue = parseInt(newGoal.targetAmount, 10);
      if (!Number.isInteger(numValue) || numValue <= 0 || newGoal.targetAmount === '0') {
        setTargetAmountError('Target amount must be a whole number greater than 0.');
      }
    }
  };

  const normalizeActivityName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/ing$/, '')
      .replace(/s$/, '')
      .replace(/ed$/, '');
  };

  const findMatchingCategory = (name: string) => {
    const normalizedName = normalizeActivityName(name);
    return categories.find(cat => {
      const normalizedCatName = normalizeActivityName(cat.name);
      return normalizedCatName === normalizedName ||
             normalizedCatName.includes(normalizedName) ||
             normalizedName.includes(normalizedCatName);
    });
  };

  const findOrCreateCategoryName = (name: string, existingCategories: Map<string, string>): string => {
    const normalizedName = normalizeActivityName(name);

    // Check if we have a matching existing category in the persistent categories list
    const matchingCategory = findMatchingCategory(name);
    if (matchingCategory) {
      return matchingCategory.name;
    }

    // Check if we already have a similar name in our temporary map
    for (const [existingName] of existingCategories) {
      const normalizedExisting = normalizeActivityName(existingName);
      if (normalizedExisting === normalizedName) {
        return existingName;
      }
    }

    // Return the original name if no match found
    return name;
  };

  // Helper function to calculate best streak from a set of dates
  const calculateBestStreakFromDates = (dates: Set<string> | string[]): number => {
    const dateArray = Array.from(dates);
    if (dateArray.length === 0) return 0;

    const uniqueDates = [...new Set(dateArray)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Single day counts as 1 day streak
    if (uniqueDates.length === 1) return 1;

    let maxStreak = 0;
    let currentStreak = 0;

    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
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
      // Check if this goal is linked to any tasks or habits
      const hasLinkedTasks = scheduleItems.some(item => item.linkedGoalId === goal.id);
      const hasLinkedHabits = habits.some(habit => habit.linked_goal_id === goal.id);

      let currentAmount = Number(goal.currentAmount) || 0;

      // Only calculate from entries if the goal is NOT linked to tasks or habits
      // Task/habit-linked goals use currentAmount as source of truth (updated in TodayTasksView)
      if (!hasLinkedTasks && !hasLinkedHabits) {
        const categoryEntries = entries.filter(entry =>
          entry.category === goal.category &&
          new Date(entry.date) >= new Date(goal.createdAt)
        );
        currentAmount = categoryEntries.reduce((sum, entry) => sum + entry.amount, 0);
      }

      const target = Number(goal.targetAmount) || 0;
      const progress = target > 0 ? Math.min((currentAmount / target) * 100, 100) : 0;
      const isGoalCompleted = currentAmount >= target && target > 0;

      console.log('[GOAL PROGRESS - StatsView]', {
        goalId: goal.id,
        goalTitle: goal.title,
        hasLinkedTasks,
        hasLinkedHabits,
        currentAmount,
        targetAmount: target,
        usedStoredAmount: hasLinkedTasks || hasLinkedHabits,
        isCompleted: goal.completed,
        wouldComplete: isGoalCompleted
      });

      // Auto-complete goal if target is reached
      if (isGoalCompleted && !goal.completed) {
        console.log('[GOAL AUTO-COMPLETE - StatsView]', {
          goalId: goal.id,
          goalTitle: goal.title,
          currentAmount,
          targetAmount: target,
          ratio: target ? currentAmount / target : null
        });

        const updatedGoal = {
          ...goal,
          completed: true,
          completedAt: new Date().toISOString(),
          currentAmount: Math.min(currentAmount, target)
        };
        onUpdateGoal(updatedGoal);
        return updatedGoal;
      }

      // For completed goals, don't let current amount exceed target
      const displayAmount = goal.completed ? target : Math.min(currentAmount, target);
      return { ...goal, currentAmount: displayAmount, progress, isCompleted: isGoalCompleted };
    });
  }, [goals, entries, scheduleItems, habits, habitCompletions, converters, onUpdateGoal]);

  const activeGoals = goalsWithProgress.filter(goal => !goal.completed);
  const completedGoals = goalsWithProgress.filter(goal => goal.completed);
  const failedGoals = activeGoals.filter(goal => isOverdue(goal.targetDate));
  const activeNonOverdueGoals = activeGoals.filter(goal => !isOverdue(goal.targetDate));

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    let targetDate = newGoal.targetDate;
    if (deadlineMode === 'duration') {
      if (durDays === 0 && durWeeks === 0 && durMonths === 0) return;
      targetDate = calculateTargetDateFromDuration(durDays, durWeeks, durMonths);
    }
    if (!targetDate) return;

    if (newGoal.goalType === 'time' && !newGoal.duration.trim()) {
      alert('Please enter a duration for time-based goals');
      return;
    }

    if (newGoal.goalType === 'distance' && !newGoal.distance.trim()) {
      alert('Please enter a distance for distance-based goals');
      return;
    }

    if (newGoal.goalType === 'task' && !newGoal.targetAmount.trim()) {
      alert('Please enter a target amount for task-based goals');
      return;
    }

    if (newGoal.goalType === 'task') {
      const numValue = parseInt(newGoal.targetAmount, 10);
      if (!Number.isFinite(numValue) || numValue <= 0) {
        setTargetAmountError('Target amount must be a whole number greater than 0.');
        return;
      }
    }

    let parsed;
    if (newGoal.goalType === 'time') {
      parsed = parseAmountByType(newGoal.duration, 'Time', converters);
    } else if (newGoal.goalType === 'distance') {
      parsed = parseAmountByType(newGoal.distance, 'Distance', converters);
    } else {
      parsed = parseAmountByType(newGoal.targetAmount, 'Count', converters) ||
               parseAmountByType(newGoal.targetAmount, 'Distance', converters) ||
               parseAmountByType(newGoal.targetAmount, 'Time', converters);
    }

    if (!parsed) {
      alert('Could not parse target amount. Please check the format.');
      return;
    }

    if (newGoal.goalType === 'task') {
      const intVal = parseInt(newGoal.targetAmount, 10);
      if (!Number.isFinite(intVal) || intVal <= 0) {
        setTargetAmountError('Target amount must be a whole number greater than 0.');
        return;
      }
      parsed.value = intVal;
    }

    const goal: Goal = {
      id: uid(),
      title: newGoal.title.trim(),
      description: newGoal.description.trim() || undefined,
      category: 'General',
      targetAmount: parsed.value,
      currentAmount: 0,
      unit: parsed.unit,
      targetDate,
      createdAt: new Date().toISOString(),
      completed: false,
      goalType: newGoal.goalType,
      duration: newGoal.goalType === 'time' ? newGoal.duration.trim() : undefined,
      distance: newGoal.goalType === 'distance' ? newGoal.distance.trim() : undefined
    };

    onAddGoal(goal);
    setNewGoal({
      title: '',
      description: '',
      targetAmount: '',
      targetDate: '',
      goalType: 'task',
      duration: '',
      distance: ''
    });
    setTargetAmountError('');
    setDeadlineMode('duration');
    setDurDays(0);
    setDurWeeks(0);
    setDurMonths(0);
    setShowAddGoalForm(false);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    const targetAmountStr = goal.goalType === 'task'
      ? String(Math.trunc(goal.targetAmount))
      : goal.targetAmount.toString();

    setNewGoal({
      title: goal.title,
      description: goal.description || '',
      targetAmount: goal.goalType === 'task' ? targetAmountStr : '',
      targetDate: goal.targetDate,
      goalType: goal.goalType || 'task',
      duration: goal.duration || '',
      distance: goal.distance || ''
    });
    setTargetAmountError('');
    setDeadlineMode('exact');
    setDurDays(0);
    setDurWeeks(0);
    setDurMonths(0);
    setShowAddGoalForm(true);
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !newGoal.title.trim()) return;

    let targetDate = newGoal.targetDate;
    if (deadlineMode === 'duration') {
      if (durDays === 0 && durWeeks === 0 && durMonths === 0) return;
      targetDate = calculateTargetDateFromDuration(durDays, durWeeks, durMonths);
    }
    if (!targetDate) return;

    if (newGoal.goalType === 'time' && !newGoal.duration.trim()) {
      alert('Please enter a duration for time-based goals');
      return;
    }

    if (newGoal.goalType === 'distance' && !newGoal.distance.trim()) {
      alert('Please enter a distance for distance-based goals');
      return;
    }

    if (newGoal.goalType === 'task' && !newGoal.targetAmount.trim()) {
      alert('Please enter a target amount for task-based goals');
      return;
    }

    if (newGoal.goalType === 'task') {
      const numValue = parseInt(newGoal.targetAmount, 10);
      if (!Number.isFinite(numValue) || numValue <= 0) {
        setTargetAmountError('Target amount must be a whole number greater than 0.');
        return;
      }
    }

    let parsed;
    if (newGoal.goalType === 'time') {
      parsed = parseAmountByType(newGoal.duration, 'Time', converters);
    } else if (newGoal.goalType === 'distance') {
      parsed = parseAmountByType(newGoal.distance, 'Distance', converters);
    } else {
      parsed = parseAmountByType(newGoal.targetAmount, 'Count', converters) ||
               parseAmountByType(newGoal.targetAmount, 'Distance', converters) ||
               parseAmountByType(newGoal.targetAmount, 'Time', converters);
    }

    if (!parsed) {
      alert('Could not parse target amount. Please check the format.');
      return;
    }

    if (newGoal.goalType === 'task') {
      const intVal = parseInt(newGoal.targetAmount, 10);
      if (!Number.isFinite(intVal) || intVal <= 0) {
        setTargetAmountError('Target amount must be a whole number greater than 0.');
        return;
      }
      parsed.value = intVal;
    }

    const updatedGoal: Goal = {
      ...editingGoal,
      title: newGoal.title.trim(),
      description: newGoal.description.trim() || undefined,
      targetAmount: parsed.value,
      unit: parsed.unit,
      targetDate,
      goalType: newGoal.goalType,
      duration: newGoal.goalType === 'time' ? newGoal.duration.trim() : undefined,
      distance: newGoal.goalType === 'distance' ? newGoal.distance.trim() : undefined
    };

    onUpdateGoal(updatedGoal);
    setEditingGoal(null);
    setNewGoal({
      title: '',
      description: '',
      targetAmount: '',
      targetDate: '',
      goalType: 'task',
      duration: '',
      distance: ''
    });
    setTargetAmountError('');
    setDeadlineMode('duration');
    setDurDays(0);
    setDurWeeks(0);
    setDurMonths(0);
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
    // For goals with duration/distance, display the original input
    if (goal.goalType === 'time' && goal.duration) {
      return goal.duration;
    }
    if (goal.goalType === 'distance' && goal.distance) {
      return goal.distance;
    }
    // For task-based goals, use the parsed unit
    return formatSingleUnit('Count', goal.targetAmount, goal.unit, converters);
  };

  const formatCurrentAmount = (goal: Goal): string => {
    // For goals with duration/distance, format based on goal type
    if (goal.goalType === 'time') {
      return formatSingleUnit('Time', goal.currentAmount, goal.unit, converters);
    }
    if (goal.goalType === 'distance') {
      return formatSingleUnit('Distance', goal.currentAmount, goal.unit, converters);
    }
    // For task-based goals, use the parsed unit
    return formatSingleUnit('Count', goal.currentAmount, goal.unit, converters);
  };

  const stats = useMemo(() => {
    const categoryTotals = new Map<string, number>();
    const categoryTypes = new Map<string, string>();
    const categoryDays = new Map<string, Set<string>>();
    const categoryUniqueActivities = new Map<string, Set<string>>();

    categories.forEach(cat => {
      categoryTypes.set(cat.name, cat.type);
      categoryDays.set(cat.name, new Set());
      categoryUniqueActivities.set(cat.name, new Set());
    });
    
    // Process regular entries
    entries.forEach(entry => {
      const current = categoryTotals.get(entry.category) || 0;
      categoryTotals.set(entry.category, current + entry.amount);

      const days = categoryDays.get(entry.category) || new Set();
      days.add(entry.date);
      categoryDays.set(entry.category, days);

      const uniqueActivities = categoryUniqueActivities.get(entry.category) || new Set();
      uniqueActivities.add(`entry-${entry.id}`);
      categoryUniqueActivities.set(entry.category, uniqueActivities);
    });
    
    // Process completed tasks and add them to stats
    scheduleItems.forEach(task => {
      task.completedDates.forEach(completedDate => {
        // Infer type from task properties - this takes precedence
        let categoryType = 'Count'; // Default type for tasks
        let inferredFromTask = false;

        if (task.duration) {
          categoryType = 'Time';
          inferredFromTask = true;
        } else if (task.distance) {
          categoryType = 'Distance';
          inferredFromTask = true;
        }

        // Use task's original name if it has explicit duration/distance
        let categoryName = task.title;

        // Only normalize to match other categories if no explicit type was set
        if (!inferredFromTask) {
          categoryName = findOrCreateCategoryName(task.title, categoryTypes);

          // Use category's type if it exists
          const matchingCategory = findMatchingCategory(task.title);
          if (matchingCategory) {
            categoryType = matchingCategory.type;
          } else if (categoryTypes.has(categoryName)) {
            categoryType = categoryTypes.get(categoryName)!;
          }
        }

        // Initialize category if it doesn't exist
        if (!categoryTypes.has(categoryName)) {
          categoryTypes.set(categoryName, categoryType);
          categoryDays.set(categoryName, new Set());
          categoryUniqueActivities.set(categoryName, new Set());
        }

        // Get the actual completion count for this date
        const completionCount = task.completedCounts?.[completedDate] || 1;

        // Add task completion to totals
        const current = categoryTotals.get(categoryName) || 0;
        let amountToAdd = completionCount; // Use actual completion count

        // Parse duration or distance if available and multiply by completion count
        if (task.duration && categoryType === 'Time') {
          const parsed = parseAmountByType(task.duration, 'Time', converters);
          if (parsed) amountToAdd = parsed.value * completionCount;
        } else if (task.distance && categoryType === 'Distance') {
          const parsed = parseAmountByType(task.distance, 'Distance', converters);
          if (parsed) amountToAdd = parsed.value * completionCount;
        }

        categoryTotals.set(categoryName, current + amountToAdd);

        // Add to days and unique activities
        const days = categoryDays.get(categoryName) || new Set();
        days.add(completedDate);
        categoryDays.set(categoryName, days);

        const uniqueActivities = categoryUniqueActivities.get(categoryName) || new Set();
        uniqueActivities.add(`task-${task.id}`);
        categoryUniqueActivities.set(categoryName, uniqueActivities);
      });
    });

    // Process completed habits and add them to stats
    habitCompletions.forEach(completion => {
      const habit = habits.find(h => h.id === completion.habit_id);
      if (!habit) return;

      // Infer type from habit properties - this takes precedence
      let categoryType = 'Count';
      let inferredFromHabit = false;

      if (habit.duration) {
        categoryType = 'Time';
        inferredFromHabit = true;
      } else if (habit.distance) {
        categoryType = 'Distance';
        inferredFromHabit = true;
      }

      // Use habit's original name if it has explicit duration/distance
      let categoryName = habit.name;

      // Only normalize to match other categories if no explicit type was set
      if (!inferredFromHabit) {
        categoryName = findOrCreateCategoryName(habit.name, categoryTypes);

        // Use category's type if it exists
        const matchingCategory = findMatchingCategory(habit.name);
        if (matchingCategory) {
          categoryType = matchingCategory.type;
        } else if (categoryTypes.has(categoryName)) {
          categoryType = categoryTypes.get(categoryName)!;
        }
      }

      // Initialize category if it doesn't exist
      if (!categoryTypes.has(categoryName)) {
        categoryTypes.set(categoryName, categoryType);
        categoryDays.set(categoryName, new Set());
        categoryUniqueActivities.set(categoryName, new Set());
      }

      // Add habit completion to totals
      const current = categoryTotals.get(categoryName) || 0;
      let amountToAdd = habit.target_number;

      // Parse duration or distance if available
      if (habit.duration && categoryType === 'Time') {
        const parsed = parseAmountByType(habit.duration, 'Time', converters);
        if (parsed) amountToAdd = parsed.value;
      } else if (habit.distance && categoryType === 'Distance') {
        const parsed = parseAmountByType(habit.distance, 'Distance', converters);
        if (parsed) amountToAdd = parsed.value;
      }

      categoryTotals.set(categoryName, current + amountToAdd);

      // Add to days and unique activities
      const days = categoryDays.get(categoryName) || new Set();
      days.add(completion.completion_date);
      categoryDays.set(categoryName, days);

      const uniqueActivities = categoryUniqueActivities.get(categoryName) || new Set();
      uniqueActivities.add(`habit-${habit.id}`);
      categoryUniqueActivities.set(categoryName, uniqueActivities);
    });
    
    const categoryStats = Array.from(categoryTotals.entries()).map(([name, total]) => {
      const type = categoryTypes.get(name) || 'Time';
      const baseUnit = type === 'Time' ? 'Hours' : type === 'Distance' ? 'Km' : 'Times';
      const category = categories.find(c => c.name === name);
      const activeDays = categoryDays.get(name)?.size || 0;
      const avgPerDay = activeDays > 0 ? total / activeDays : 0;
      const datesForCategory = categoryDays.get(name) || new Set();
      const bestStreak = calculateBestStreakFromDates(datesForCategory);
      const activityRecord = category?.activityRecord || 0;
      const uniqueActivities = categoryUniqueActivities.get(name) || new Set();

      return {
        name,
        type,
        total,
        baseUnit,
        entryCount: uniqueActivities.size,
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
        const datesForCategory = categoryDays.get(category.name) || new Set();
        const bestStreak = calculateBestStreakFromDates(datesForCategory);
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

  }, [entries, categories, converters, scheduleItems, habits, habitCompletions]);

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
    const categoryEntries = new Map<string, any[]>();
    const categoryUniqueActivities = new Map<string, Set<string>>();

    categories.forEach(cat => {
      categoryTypes.set(cat.name, cat.type);
      categoryEntries.set(cat.name, []);
      categoryUniqueActivities.set(cat.name, new Set());
    });
    
    // Process regular entries
    entries.forEach(entry => {
      const current = categoryTotals.get(entry.category) || 0;
      categoryTotals.set(entry.category, current + entry.amount);

      const entryList = categoryEntries.get(entry.category) || [];
      entryList.push(entry);
      categoryEntries.set(entry.category, entryList);

      const uniqueActivities = categoryUniqueActivities.get(entry.category) || new Set();
      uniqueActivities.add(`entry-${entry.id}`);
      categoryUniqueActivities.set(entry.category, uniqueActivities);
    });
    
    // Process completed tasks
    scheduleItems.forEach(task => {
      task.completedDates.forEach(completedDate => {
        // Infer type from task properties - this takes precedence
        let categoryType = 'Count';
        let inferredFromTask = false;

        if (task.duration) {
          categoryType = 'Time';
          inferredFromTask = true;
        } else if (task.distance) {
          categoryType = 'Distance';
          inferredFromTask = true;
        }

        let categoryName = task.title;

        // Only check for matching category if type wasn't inferred from task
        if (!inferredFromTask) {
          const matchingCategory = categories.find(cat =>
            cat.name.toLowerCase() === task.title.toLowerCase() ||
            cat.name.toLowerCase().includes(task.title.toLowerCase()) ||
            task.title.toLowerCase().includes(cat.name.toLowerCase())
          );

          if (matchingCategory) {
            categoryName = matchingCategory.name;
            categoryType = matchingCategory.type;
          }
        }

        // Initialize category if it doesn't exist
        if (!categoryTypes.has(categoryName)) {
          categoryTypes.set(categoryName, categoryType);
          categoryEntries.set(categoryName, []);
          categoryUniqueActivities.set(categoryName, new Set());
        }

        // Get the actual completion count for this date
        const completionCount = task.completedCounts?.[completedDate] || 1;

        // Add task completion to totals
        const current = categoryTotals.get(categoryName) || 0;
        let amountToAdd = completionCount;

        // Parse duration or distance if available and multiply by completion count
        if (task.duration && categoryType === 'Time') {
          const parsed = parseAmountByType(task.duration, 'Time', converters);
          if (parsed) amountToAdd = parsed.value * completionCount;
        } else if (task.distance && categoryType === 'Distance') {
          const parsed = parseAmountByType(task.distance, 'Distance', converters);
          if (parsed) amountToAdd = parsed.value * completionCount;
        }

        categoryTotals.set(categoryName, current + amountToAdd);

        // Create a pseudo-entry for the completed task
        const taskEntry = {
          id: `task-${task.id}-${completedDate}`,
          date: completedDate,
          category: categoryName,
          amount: amountToAdd,
          unit: categoryType === 'Time' ? 'Hours' : categoryType === 'Distance' ? 'Km' : 'Times',
          note: `Completed task: ${task.title}${task.description ? ` - ${task.description}` : ''}`
        };

        const entryList = categoryEntries.get(categoryName) || [];
        entryList.push(taskEntry);
        categoryEntries.set(categoryName, entryList);

        const uniqueActivities = categoryUniqueActivities.get(categoryName) || new Set();
        uniqueActivities.add(`task-${task.id}`);
        categoryUniqueActivities.set(categoryName, uniqueActivities);
      });
    });

    // Process completed habits
    habitCompletions.forEach(completion => {
      const habit = habits.find(h => h.id === completion.habit_id);
      if (!habit) return;

      // Infer type from habit properties - this takes precedence
      let categoryType = 'Count';
      let inferredFromHabit = false;

      if (habit.duration) {
        categoryType = 'Time';
        inferredFromHabit = true;
      } else if (habit.distance) {
        categoryType = 'Distance';
        inferredFromHabit = true;
      }

      const categoryName = habit.name;

      // Only check for matching category if type wasn't inferred from habit
      if (!inferredFromHabit) {
        const matchingCategory = categories.find(cat =>
          cat.name.toLowerCase() === habit.name.toLowerCase() ||
          cat.name.toLowerCase().includes(habit.name.toLowerCase()) ||
          habit.name.toLowerCase().includes(cat.name.toLowerCase())
        );

        if (matchingCategory) {
          categoryType = matchingCategory.type;
        }
      }

      // Initialize category if it doesn't exist
      if (!categoryTypes.has(categoryName)) {
        categoryTypes.set(categoryName, categoryType);
        categoryEntries.set(categoryName, []);
        categoryUniqueActivities.set(categoryName, new Set());
      }

      // Add habit completion to totals
      const current = categoryTotals.get(categoryName) || 0;
      let amountToAdd = habit.target_number;

      // Parse duration or distance if available
      if (habit.duration && categoryType === 'Time') {
        const parsed = parseAmountByType(habit.duration, 'Time', converters);
        if (parsed) amountToAdd = parsed.value;
      } else if (habit.distance && categoryType === 'Distance') {
        const parsed = parseAmountByType(habit.distance, 'Distance', converters);
        if (parsed) amountToAdd = parsed.value;
      }

      categoryTotals.set(categoryName, current + amountToAdd);

      // Create a pseudo-entry for the completed habit
      const habitEntry = {
        id: `habit-${habit.id}-${completion.completion_date}`,
        date: completion.completion_date,
        category: categoryName,
        amount: amountToAdd,
        unit: categoryType === 'Time' ? 'Hours' : categoryType === 'Distance' ? 'Km' : 'Times',
        note: `Completed habit: ${habit.name}${habit.description ? ` - ${habit.description}` : ''}`
      };

      const entryList = categoryEntries.get(categoryName) || [];
      entryList.push(habitEntry);
      categoryEntries.set(categoryName, entryList);

      const uniqueActivities = categoryUniqueActivities.get(categoryName) || new Set();
      uniqueActivities.add(`habit-${habit.id}`);
      categoryUniqueActivities.set(categoryName, uniqueActivities);
    });

    const categoryStats = Array.from(categoryTotals.entries()).map(([name, total]) => {
      const type = categoryTypes.get(name) || 'Time';
      const baseUnit = type === 'Time' ? 'Hours' : type === 'Distance' ? 'Km' : 'Times';
      const allCategoryEntries = categoryEntries.get(name) || [];
      const uniqueActivities = categoryUniqueActivities.get(name) || new Set();
      return {
        name,
        type,
        total,
        baseUnit,
        entryCount: uniqueActivities.size,
        formattedTotal: formatSingleUnit(type, total, baseUnit, converters),
        entries: allCategoryEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    });

    return categoryStats.sort((a, b) => b.total - a.total);
  }, [entries, categories, converters, scheduleItems, habits, habitCompletions]);

  const filteredAllTimeStats = useMemo(() => {
    let filtered = [...allTimeStats];

    switch (allTimeFilter) {
      case 'latest':
        return filtered.sort((a, b) => {
          const latestA = Math.max(...a.entries.map(e => new Date(e.date).getTime()));
          const latestB = Math.max(...b.entries.map(e => new Date(e.date).getTime()));
          return latestB - latestA;
        });
      case 'by-type':
        return filtered.sort((a, b) => {
          if (a.type === b.type) {
            return b.total - a.total;
          }
          return a.type.localeCompare(b.type);
        });
      case 'most-completed':
        return filtered.sort((a, b) => b.entryCount - a.entryCount);
      default:
        return filtered;
    }
  }, [allTimeStats, allTimeFilter]);

  const toggleHabit = (categoryName: string) => {
    const existingCategory = categories.find(cat => cat.name === categoryName);

    if (existingCategory) {
      const updatedCategories = categories.map(cat =>
        cat.name === categoryName
          ? { ...cat, isHabit: !cat.isHabit }
          : cat
      );
      onUpdateCategories(updatedCategories);
    } else {
      const stat = stats.find(s => s.name === categoryName);
      const newCategory: Category = {
        id: uid(),
        name: categoryName,
        type: stat?.type || 'Count',
        isHabit: true,
        activityRecord: 0
      };
      onUpdateCategories([...categories, newCategory]);
    }
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

      {/* Goals Header with New Goal button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Goals
          </h3>
          <button
            onClick={() => {
              const activeGoalCount = goals.filter(g => !g.completed).length;
              const canAddGoal = plan === 'paid' || activeGoalCount < 2;

              if (!canAddGoal && !showAddGoalForm) {
                setShowAddGoalForm(true);
                return;
              }

              setEditingGoal(null);
              setNewGoal({
                title: '',
                description: '',
                targetAmount: '',
                targetDate: '',
                goalType: 'task',
                duration: '',
                distance: ''
              });
              setTargetAmountError('');
              setDeadlineMode('duration');
              setDurDays(0);
              setDurWeeks(0);
              setDurMonths(0);
              setShowAddGoalForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </button>
        </div>
      </div>

      {/* Goal Create/Edit Modal */}
      <CreateItemModal
        isOpen={showAddGoalForm}
        title={editingGoal ? 'Edit Goal' : 'Create Goal'}
        onClose={() => {
          setShowAddGoalForm(false);
          setEditingGoal(null);
          setNewGoal({ title: '', description: '', targetAmount: '', targetDate: '', goalType: 'task', duration: '', distance: '' });
          setTargetAmountError('');
          setDeadlineMode('duration');
          setDurDays(0);
          setDurWeeks(0);
          setDurMonths(0);
        }}
        onSubmit={editingGoal ? handleUpdateGoal : handleAddGoal}
        submitLabel={editingGoal ? 'Update Goal' : 'Create Goal'}
      >
        {(() => {
          const activeGoalCount = goals.filter(g => !g.completed).length;
          const canAddGoal = plan === 'paid' || activeGoalCount < 2;

          if (!canAddGoal && !editingGoal) {
            return (
              <UpgradePrompt
                feature="Unlimited Goals"
                description="Free users can have up to 2 active goals. Upgrade to the paid plan to create unlimited goals and track all your ambitions."
              />
            );
          }

          return (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Run 100km this month"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Type</label>
                <select
                  value={newGoal.goalType}
                  onChange={(e) => {
                    setNewGoal({ ...newGoal, goalType: e.target.value as 'task' | 'time' | 'distance' });
                    setTargetAmountError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="task">Task</option>
                  <option value="time">Time-based</option>
                  <option value="distance">Distance-based</option>
                </select>
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
                          <div className="flex items-baseline gap-1.5 py-1">
                            <span className="text-2xl font-bold text-gray-800 dark:text-white tabular-nums">
                              {value}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{label.toLowerCase()}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => set(Math.max(0, value - 1))}
                            className="w-full flex justify-center py-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
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

              {newGoal.goalType === 'task' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Amount</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newGoal.targetAmount}
                    onChange={(e) => handleTargetAmountChange(e.target.value)}
                    onBlur={handleTargetAmountBlur}
                    placeholder="e.g., 30 times"
                    className={`w-full px-3 py-2 border ${targetAmountError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 ${targetAmountError ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                    required
                  />
                  {targetAmountError && (
                    <p className="text-red-500 text-xs mt-1">{targetAmountError}</p>
                  )}
                </div>
              )}

              {newGoal.goalType === 'time' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newGoal.duration}
                    onChange={(e) => setNewGoal({ ...newGoal, duration: e.target.value })}
                    placeholder="e.g., 30min, 1h 15m, 2 hours"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Examples: 30min, 1h 30m, 2 hours</p>
                </div>
              )}

              {newGoal.goalType === 'distance' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Distance</label>
                  <input
                    type="text"
                    value={newGoal.distance}
                    onChange={(e) => setNewGoal({ ...newGoal, distance: e.target.value })}
                    placeholder="e.g., 5km, 3 miles, 2000m"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Examples: 5km, 3 miles, 2000m</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                <textarea
                  ref={textareaRef}
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Describe your goal..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          );
        })()}
      </CreateItemModal>

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
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{goal.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
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

      {/* Today's Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Today's Achievements
        </h3>
        
        {stats.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No activities recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map(stat => (
              <div key={stat.name} className="p-4 rounded-lg border-2 transition-all border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 dark:text-white">{stat.name}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHabit(stat.name);
                    }}
                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                    title={stat.isHabit ? 'Remove from habits' : 'Mark as habit'}
                  >
                    <Star
                      className={`w-4 h-4 ${stat.isHabit ? 'text-yellow-500' : ''}`}
                      fill={stat.isHabit ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-medium text-gray-800 dark:text-white">{stat.formattedTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Activities:</span>
                    <span className="font-medium text-gray-800 dark:text-white">{stat.entryCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Active Days:</span>
                    <span className="font-medium text-gray-800 dark:text-white">{stat.activeDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg/Day:</span>
                    <span className="font-medium text-gray-800 dark:text-white">{stat.formattedAvgPerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Best Streak:</span>
                    <span className="font-medium text-blue-600">{stat.bestStreak} days</span>
                  </div>
                  {stat.activityRecord > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Record:</span>
                      <span className="font-medium text-green-600">{stat.formattedRecord}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Time Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            All Time Achievements
          </h3>
          <select
            value={allTimeFilter}
            onChange={(e) => setAllTimeFilter(e.target.value as 'latest' | 'by-type' | 'most-completed')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="latest">Latest First</option>
            <option value="by-type">By Type</option>
            <option value="most-completed">Most Completed</option>
          </select>
        </div>

        {filteredAllTimeStats.length === 0 ? (
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
            {filteredAllTimeStats.map(stat => (
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
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-6 whitespace-pre-wrap">{goal.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400 ml-6">
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
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{goal.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center text-red-600 dark:text-red-400 font-medium">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatCountdown(goal.targetDate)}
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
                          onClick={() => setDeletingGoalId(goal.id)}
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