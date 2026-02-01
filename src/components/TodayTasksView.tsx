import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CheckSquare, Check, ChevronLeft, ChevronRight, Calendar, Plus, Save, X, ChevronDown, ChevronUp, Repeat, Pencil, Trash2 } from 'lucide-react';
import { ScheduleItem, Goal, Habit, HabitCompletion, Converter } from '../types';
import { fmtDateISO, uid } from '../utils/dateUtils';
import { parseAmountByType } from '../utils/parsing';
import { formatDistanceDisplay, formatDurationDisplay } from '../utils/formatting';
import { supabase } from '../lib/supabase';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { QuickGuide } from './QuickGuide';

interface TodayTasksViewProps {
  scheduleItems: ScheduleItem[];
  goals: Goal[];
  converters: Converter[];
  onAddScheduleItem: (item: ScheduleItem) => void;
  onUpdateScheduleItem: (item: ScheduleItem) => void;
  onDeleteScheduleItem: (id: string) => void;
  onUpdateGoal: (goal: Goal) => void;
  onGoalUpdate?: () => void;
  onHabitCompletionChange?: () => void;
  allHabits: Habit[];
  habitCompletions: HabitCompletion[];
  setHabitCompletions: React.Dispatch<React.SetStateAction<HabitCompletion[]>>;
}

interface HabitWithCompletion extends Habit {
  completion?: HabitCompletion;
  isCompleted: boolean;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export function TodayTasksView({
  scheduleItems,
  goals,
  converters,
  onAddScheduleItem,
  onUpdateScheduleItem,
  onDeleteScheduleItem,
  onUpdateGoal,
  onGoalUpdate,
  onHabitCompletionChange,
  allHabits,
  habitCompletions,
  setHabitCompletions
}: TodayTasksViewProps) {
  const [selectedDayForToday, setSelectedDayForToday] = useState(getCurrentDay());
  const [showAddScheduleForm, setShowAddScheduleForm] = useState(false);
  const [editingScheduleItem, setEditingScheduleItem] = useState<ScheduleItem | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [newScheduleItem, setNewScheduleItem] = useState({
    time: '09:00',
    title: '',
    description: '',
    type: 'task' as 'task' | 'time' | 'distance',
    targetNumber: '',
    duration: '',
    distance: '',
    linkedGoalId: ''
  });
  const [habits, setHabits] = useState<HabitWithCompletion[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get current day of week
  function getCurrentDay() {
    const today = new Date();
    const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    const dayMap = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return dayMap[adjustedIndex];
  }

  // Calculate the actual date for the selected day of week
  function getDateForDay(dayKey: string): string {
    const today = new Date();
    const currentDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentAdjustedIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;

    const dayMap = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const selectedDayIndex = dayMap.indexOf(dayKey);

    // Calculate the difference in days
    const daysDifference = selectedDayIndex - currentAdjustedIndex;

    // Create a new date based on the difference
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysDifference);

    return fmtDateISO(targetDate);
  }

  // Get the date for the currently selected day
  const selectedDate = getDateForDay(selectedDayForToday);
  const today = fmtDateISO(new Date());

  const currentDay = selectedDayForToday;

  // Navigation functions for day switching
  const goToPreviousDay = () => {
    const currentIndex = DAYS.findIndex(day => day.key === selectedDayForToday);
    const previousIndex = currentIndex === 0 ? DAYS.length - 1 : currentIndex - 1;
    setSelectedDayForToday(DAYS[previousIndex].key);
  };

  const goToNextDay = () => {
    const currentIndex = DAYS.findIndex(day => day.key === selectedDayForToday);
    const nextIndex = currentIndex === DAYS.length - 1 ? 0 : currentIndex + 1;
    setSelectedDayForToday(DAYS[nextIndex].key);
  };

  const goToToday = () => {
    setSelectedDayForToday(getCurrentDay());
  };

  // Load habits and completions for the selected day
  useEffect(() => {
    loadHabitsForDay();
  }, [selectedDayForToday, selectedDate, allHabits, habitCompletions]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [newScheduleItem.description, showAddScheduleForm]);

  const loadHabitsForDay = () => {
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const selectedDayIndex = dayMap.indexOf(selectedDayForToday);

    const habitsForDay = allHabits.filter(habit =>
      habit.days_of_week.includes(selectedDayIndex)
    );

    console.log('Loading habits for day:', {
      selectedDay: selectedDayForToday,
      selectedDayIndex,
      selectedDate,
      allHabitsCount: allHabits.length,
      habitsForDayCount: habitsForDay.length,
      habitsWithLinks: habitsForDay.filter(h => h.linked_goal_id).length
    });

    const completionsForToday = habitCompletions.filter(c => c.completion_date === selectedDate);

    const habitsWithCompletions: HabitWithCompletion[] = habitsForDay.map(habit => {
      const completion = completionsForToday.find(c => c.habit_id === habit.id);
      return {
        ...habit,
        completion,
        isCompleted: !!completion
      };
    });

    setHabits(habitsWithCompletions);
  };

  const handleToggleHabit = async (habit: HabitWithCompletion) => {
    const { data: { user } } = await supabase.auth.getUser();

    console.log('[HABIT TOGGLE]', {
      habitId: habit.id,
      habitName: habit.name,
      wasCompleted: habit.isCompleted,
      willBeCompleted: !habit.isCompleted,
      linkedGoalId: habit.linked_goal_id,
      timestamp: new Date().toISOString()
    });

    if (habit.isCompleted && habit.completion) {
      try {
        if (user) {
          const { error } = await supabase
            .from('habit_completions')
            .delete()
            .eq('id', habit.completion.id);

          if (error) throw error;
          if (onHabitCompletionChange) onHabitCompletionChange();
        } else {
          setHabitCompletions(prev => prev.filter(c => c.id !== habit.completion!.id));
        }

        if (habit.linked_goal_id) {
          const linkedGoal = goals.find(g => g.id === habit.linked_goal_id);
          if (linkedGoal) {
            const target = Number(linkedGoal.targetAmount) || 0;
            const current = Number(linkedGoal.currentAmount) || 0;
            const delta = Number(calculateHabitAmount(habit)) || 0;
            const newProgress = Math.max(0, current - delta);

            console.log('[GOAL UPDATE DEBUG - HABIT UNCOMPLETE]', {
              goalId: linkedGoal.id,
              goalTitle: linkedGoal.title,
              goalUnit: linkedGoal.unit,
              currentProgress: current,
              deltaRemoved: delta,
              targetAmount: target,
              newProgress,
              ratio: target ? newProgress / target : null
            });

            onUpdateGoal({
              ...linkedGoal,
              currentAmount: newProgress,
              completed: false
            });
          }
        }

        loadHabitsForDay();
      } catch (error) {
        console.error('Error removing habit completion:', error);
      }
    } else {
      try {
        if (user) {
          const { error } = await supabase
            .from('habit_completions')
            .insert({
              habit_id: habit.id,
              completion_date: selectedDate,
              completed_number: habit.target_number,
              user_id: user.id
            });

          if (error) throw error;
          if (onHabitCompletionChange) onHabitCompletionChange();
        } else {
          const newCompletion: HabitCompletion = {
            id: uid(),
            habit_id: habit.id,
            user_id: '',
            completion_date: selectedDate,
            completed_number: habit.target_number,
            created_at: new Date().toISOString()
          };
          setHabitCompletions(prev => [...prev, newCompletion]);
        }

        if (habit.linked_goal_id) {
          const linkedGoal = goals.find(g => g.id === habit.linked_goal_id);
          if (linkedGoal) {
            const target = Number(linkedGoal.targetAmount) || 0;
            const current = Number(linkedGoal.currentAmount) || 0;
            const delta = Number(calculateHabitAmount(habit)) || 0;
            const newProgress = current + delta;
            const isGoalCompleted = newProgress >= target;

            console.log('[GOAL UPDATE DEBUG - HABIT COMPLETE]', {
              goalId: linkedGoal.id,
              goalTitle: linkedGoal.title,
              goalUnit: linkedGoal.unit,
              currentProgress: current,
              deltaAdded: delta,
              targetAmount: target,
              newProgress,
              isGoalCompleted,
              ratio: target ? newProgress / target : null
            });

            onUpdateGoal({
              ...linkedGoal,
              currentAmount: isGoalCompleted ? target : newProgress,
              completed: isGoalCompleted,
              completedAt: isGoalCompleted ? new Date().toISOString() : linkedGoal.completedAt
            });
          }
        }

        loadHabitsForDay();
      } catch (error) {
        console.error('Error adding habit completion:', error);
      }
    }
  };


  const isToday = selectedDayForToday === getCurrentDay();

  // Get today's tasks for the selected day
  const todaysTasks = useMemo(() => {
    return scheduleItems
      .filter(item => item.day === currentDay)
      .map(item => {
        const completedCount = item.completedCounts?.[selectedDate] || 0;
        const targetCount = item.targetNumber || 1;
        return {
          ...item,
          completedCount,
          completed: completedCount >= targetCount
        };
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [scheduleItems, selectedDayForToday, selectedDate, currentDay]);

  // Calculate today's stats (including habits)
  const todayStats = useMemo(() => {
    const tasksTotal = todaysTasks.length;
    const habitsTotal = habits.length;
    const total = tasksTotal + habitsTotal;

    const tasksCompleted = todaysTasks.filter(task => task.completed).length;
    const habitsCompleted = habits.filter(h => h.isCompleted).length;
    const completed = tasksCompleted + habitsCompleted;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  }, [todaysTasks, habits]);

  // Handler for toggling task completion
  const handleToggleTaskCompletion = (taskId: string) => {
    const originalTask = scheduleItems.find(item => item.id === taskId);
    if (!originalTask) return;

    const currentCount = originalTask.completedCounts?.[selectedDate] || 0;
    const targetCount = originalTask.targetNumber || 1;
    const wasCompleted = currentCount >= targetCount;

    const newCount = wasCompleted ? 0 : targetCount;

    const newCompletedCounts = {
      ...originalTask.completedCounts,
      [selectedDate]: newCount
    };

    const isNowCompleted = newCount >= targetCount;

    console.log('[TASK TOGGLE]', {
      taskId: originalTask.id,
      taskTitle: originalTask.title,
      selectedDate,
      wasCompleted,
      isNowCompleted,
      stateChanged: wasCompleted !== isNowCompleted,
      linkedGoalId: originalTask.linkedGoalId,
      timestamp: new Date().toISOString()
    });

    // Only update goal if completion status actually changed
    if (wasCompleted === isNowCompleted) {
      console.log('[TASK TOGGLE] - No state change, skipping goal update');
      return;
    }

    let newCompletedDates = [...originalTask.completedDates];
    if (!wasCompleted && isNowCompleted && !newCompletedDates.includes(selectedDate)) {
      newCompletedDates.push(selectedDate);
    } else if (wasCompleted && !isNowCompleted) {
      newCompletedDates = newCompletedDates.filter(date => date !== selectedDate);
    }

    if (originalTask.linkedGoalId) {
      const linkedGoal = goals.find(g => g.id === originalTask.linkedGoalId);
      if (linkedGoal) {
        const target = Number(linkedGoal.targetAmount) || 0;
        const current = Number(linkedGoal.currentAmount) || 0;
        const delta = Number(calculateTaskAmount(originalTask)) || 0;

        if (wasCompleted) {
          const newProgress = Math.max(0, current - delta);
          console.log('[GOAL UPDATE DEBUG - UNCOMPLETE]', {
            goalId: linkedGoal.id,
            goalTitle: linkedGoal.title,
            goalUnit: linkedGoal.unit,
            currentProgress: current,
            deltaRemoved: delta,
            targetAmount: target,
            newProgress,
            ratio: target ? newProgress / target : null
          });
          onUpdateGoal({
            ...linkedGoal,
            currentAmount: newProgress,
            completed: false
          });
        } else {
          const newProgress = current + delta;
          const isGoalCompleted = newProgress >= target;
          const clampedProgress = Math.min(newProgress, target);

          console.log('[GOAL UPDATE DEBUG - COMPLETE]', {
            goalId: linkedGoal.id,
            goalTitle: linkedGoal.title,
            goalUnit: linkedGoal.unit,
            currentProgress: current,
            deltaAdded: delta,
            targetAmount: target,
            newProgress,
            clampedProgress,
            isGoalCompleted,
            ratio: target ? newProgress / target : null
          });

          onUpdateGoal({
            ...linkedGoal,
            currentAmount: isGoalCompleted ? target : newProgress,
            completed: isGoalCompleted,
            completedAt: isGoalCompleted ? new Date().toISOString() : linkedGoal.completedAt
          });
        }
      }
    }

    onUpdateScheduleItem({
      ...originalTask,
      completedCounts: newCompletedCounts,
      completedDates: newCompletedDates
    });
  };

  // Calculate the amount to add to the goal based on task type
  const calculateTaskAmount = (task: ScheduleItem): number => {
    if (task.distance) {
      const parsed = parseAmountByType(task.distance, 'Distance', converters);
      return parsed?.value || 0;
    } else if (task.duration) {
      const parsed = parseAmountByType(task.duration, 'Time', converters);
      return parsed?.value || 0;
    } else if (task.targetNumber) {
      return task.targetNumber;
    }
    return 1;
  };

  // Calculate the amount to add to the goal based on habit type
  const calculateHabitAmount = (habit: Habit): number => {
    if (habit.distance) {
      const parsed = parseAmountByType(habit.distance, 'Distance', converters);
      return parsed?.value || 0;
    } else if (habit.duration) {
      const parsed = parseAmountByType(habit.duration, 'Time', converters);
      return parsed?.value || 0;
    } else if (habit.target_number) {
      return habit.target_number;
    }
    return 1;
  };

  const handleAddScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleItem.title.trim()) return;

    // Validate required fields based on type
    if (newScheduleItem.type === 'task' && !newScheduleItem.targetNumber.trim()) {
      alert('Please enter a number of times for task-based items');
      return;
    }

    if (newScheduleItem.type === 'time' && !newScheduleItem.duration.trim()) {
      alert('Please enter a duration for time-based tasks');
      return;
    }

    if (newScheduleItem.type === 'distance' && !newScheduleItem.distance.trim()) {
      alert('Please enter a distance for distance-based tasks');
      return;
    }

    const item: ScheduleItem = {
      id: uid(),
      day: currentDay,
      time: newScheduleItem.time,
      title: newScheduleItem.title.trim(),
      description: newScheduleItem.description.trim() || undefined,
      targetNumber: newScheduleItem.type === 'task' ? parseInt(newScheduleItem.targetNumber) : undefined,
      duration: newScheduleItem.type === 'time' ? newScheduleItem.duration.trim() : undefined,
      distance: newScheduleItem.type === 'distance' ? newScheduleItem.distance.trim() : undefined,
      linkedGoalId: newScheduleItem.linkedGoalId || undefined,
      completed: false,
      completedDates: [],
      completedCounts: {},
      createdAt: new Date().toISOString()
    };

    onAddScheduleItem(item);
    setNewScheduleItem({ time: '09:00', title: '', description: '', type: 'task', targetNumber: '', duration: '', distance: '', linkedGoalId: '' });
    setShowAddScheduleForm(false);
  };

  const handleEditScheduleItem = (item: ScheduleItem) => {
    setEditingScheduleItem(item);
    setNewScheduleItem({
      time: item.time,
      title: item.title,
      description: item.description || '',
      type: item.duration ? 'time' : item.distance ? 'distance' : 'task',
      targetNumber: item.targetNumber?.toString() || '',
      duration: item.duration || '',
      distance: item.distance || '',
      linkedGoalId: item.linkedGoalId || ''
    });
    setShowAddScheduleForm(true);
  };

  const handleUpdateScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheduleItem || !newScheduleItem.title.trim()) return;

    // Validate required fields based on type
    if (newScheduleItem.type === 'task' && !newScheduleItem.targetNumber.trim()) {
      alert('Please enter a number of times for task-based items');
      return;
    }

    if (newScheduleItem.type === 'time' && !newScheduleItem.duration.trim()) {
      alert('Please enter a duration for time-based tasks');
      return;
    }

    if (newScheduleItem.type === 'distance' && !newScheduleItem.distance.trim()) {
      alert('Please enter a distance for distance-based tasks');
      return;
    }

    const updatedItem: ScheduleItem = {
      ...editingScheduleItem,
      day: currentDay,
      time: newScheduleItem.time,
      title: newScheduleItem.title.trim(),
      description: newScheduleItem.description.trim() || undefined,
      targetNumber: newScheduleItem.type === 'task' ? parseInt(newScheduleItem.targetNumber) : undefined,
      duration: newScheduleItem.type === 'time' ? newScheduleItem.duration.trim() : undefined,
      distance: newScheduleItem.type === 'distance' ? newScheduleItem.distance.trim() : undefined,
      linkedGoalId: newScheduleItem.linkedGoalId || undefined
    };

    onUpdateScheduleItem(updatedItem);
    setEditingScheduleItem(null);
    setNewScheduleItem({ time: '09:00', title: '', description: '', type: 'task', targetNumber: '', duration: '', distance: '', linkedGoalId: '' });
    setShowAddScheduleForm(false);
  };

  const handleCancelScheduleEdit = () => {
    setEditingScheduleItem(null);
    setNewScheduleItem({ time: '09:00', title: '', description: '', type: 'task', targetNumber: '', duration: '', distance: '', linkedGoalId: '' });
    setShowAddScheduleForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Add Task Form for Today */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add Task for Today ({DAYS.find(d => d.key === currentDay)?.label})
          </h3>
          <button
            onClick={() => {
              if (showAddScheduleForm) {
                handleCancelScheduleEdit();
              } else {
                setShowAddScheduleForm(true);
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showAddScheduleForm ? (editingScheduleItem ? 'Cancel Edit' : 'Cancel') : 'Add Task'}
          </button>
        </div>

        {/* Add Schedule Form for Today */}
        {showAddScheduleForm && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
              {editingScheduleItem ? 'Edit Task' : `Add Task for ${DAYS.find(d => d.key === selectedDayForToday)?.label}`}
            </h4>
            
            <form onSubmit={editingScheduleItem ? handleUpdateScheduleItem : handleAddScheduleItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task</label>
                  <input
                    type="text"
                    value={newScheduleItem.title}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, title: e.target.value })}
                    placeholder="e.g., Morning workout, Run 5km, Study for 2 hours"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Tip: Use similar titles to your goals to automatically track progress
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={newScheduleItem.time}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                  <select
                    value={newScheduleItem.type}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, type: e.target.value as 'task' | 'time' | 'distance' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="task">Task</option>
                    <option value="time">Time-based</option>
                    <option value="distance">Distance-based</option>
                  </select>
                </div>
              </div>

              {/* Conditional fields based on type */}
              {newScheduleItem.type === 'task' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Times</label>
                  <input
                    type="number"
                    min="1"
                    value={newScheduleItem.targetNumber}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, targetNumber: e.target.value })}
                    placeholder="e.g., 1, 3, 5"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    How many times to complete this task
                  </p>
                </div>
              )}

              {newScheduleItem.type === 'time' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newScheduleItem.duration}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, duration: e.target.value })}
                    placeholder="e.g., 30min, 1h 15m, 2 hours"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Examples: 30min, 1h 30m, 2 hours
                  </p>
                </div>
              )}
              
              {newScheduleItem.type === 'distance' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Distance</label>
                  <input
                    type="text"
                    value={newScheduleItem.distance}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, distance: e.target.value })}
                    placeholder="e.g., 5km, 3 miles, 2000m"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Examples: 5km, 3 miles, 2000m
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                <textarea
                  ref={textareaRef}
                  value={newScheduleItem.description}
                  onChange={(e) => setNewScheduleItem({ ...newScheduleItem, description: e.target.value })}
                  placeholder="Additional details..."
                  rows={1}
                  style={{ minHeight: '2.5rem', resize: 'none' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link to Goal (optional)</label>
                <select
                  value={newScheduleItem.linkedGoalId}
                  onChange={(e) => setNewScheduleItem({ ...newScheduleItem, linkedGoalId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No linked goal</option>
                  {goals.filter(g => !g.completed).map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title} ({goal.currentAmount}/{goal.targetAmount} {goal.unit})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Auto-update goal progress when completing this task
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {editingScheduleItem ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {editingScheduleItem ? 'Update Task' : 'Add Task'}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancelScheduleEdit}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Today's Tasks Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousDay}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <CheckSquare className="w-6 h-6 mr-3" />
              {DAYS.find(d => d.key === currentDay)?.label}'s Tasks
            </h2>
            
            <button
              onClick={goToNextDay}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {!isToday && (
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to today
              </button>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Progress</div>
            <div className="text-2xl font-bold text-blue-600">
              {todayStats.completed}/{todayStats.total}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {todayStats.total > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Completion Rate</span>
              <span>{todayStats.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${todayStats.percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Habits Section */}
        {habits.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Repeat className="w-4 h-4 mr-2" />
              Daily Habits
            </h4>
            <div className="space-y-2">
              {habits.map(habit => (
                <div
                  key={habit.id}
                  onClick={() => setExpandedHabit(expandedHabit === habit.id ? null : habit.id)}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${
                    habit.isCompleted
                      ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                      : 'bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-800'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleHabit(habit);
                    }}
                    className={`flex-shrink-0 w-6 h-6 rounded border transition-colors flex items-center justify-center ${
                      habit.isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-purple-300 hover:border-purple-400'
                    }`}
                  >
                    {habit.isCompleted ? <Check className="w-3 h-3" /> : null}
                  </button>

                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setExpandedHabit(expandedHabit === habit.id ? null : habit.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        {habit.time}
                      </span>
                      <Repeat className="w-3 h-3 text-purple-500" />
                      <span
                        className={`font-medium ${
                          habit.isCompleted
                            ? 'text-green-700 dark:text-green-300 line-through'
                            : 'text-gray-800 dark:text-white'
                        }`}
                      >
                        {habit.name}
                      </span>
                      {(habit.duration || habit.distance || habit.target_number > 1) && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          habit.isCompleted
                            ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300'
                            : 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300'
                        }`}>
                          {habit.duration
                            ? formatDurationDisplay(habit.duration)
                            : habit.distance
                              ? formatDistanceDisplay(habit.distance || '')
                              : `${habit.target_number} times`
                          }
                        </span>
                      )}
                    </div>
                    {habit.linked_goal_id && (() => {
                      const linkedGoal = goals.find(g => g.id === habit.linked_goal_id);
                      return linkedGoal ? (
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900 px-2 py-0.5 rounded">
                            🎯 {linkedGoal.title}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900 px-2 py-0.5 rounded">
                            ⚠️ Linked goal not found
                          </span>
                        </div>
                      );
                    })()}

                    {expandedHabit === habit.id && habit.description && (
                      <p className={`text-sm mt-2 whitespace-pre-line ${
                        habit.isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {habit.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-2">
                    <div
                      className="cursor-pointer"
                      onClick={() => setExpandedHabit(expandedHabit === habit.id ? null : habit.id)}
                    >
                      {habit.description && (
                        <>
                          {expandedHabit === habit.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks List */}
        {todaysTasks.length === 0 && habits.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Calendar className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No tasks or habits scheduled for {DAYS.find(d => d.key === currentDay)?.label.toLowerCase()}.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Add tasks above or create habits in the Daily Habits tab!</p>
          </div>
        ) : todaysTasks.length > 0 ? (
          <>
            {todaysTasks.length > 0 && habits.length > 0 && (
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <CheckSquare className="w-4 h-4 mr-2" />
                Scheduled Tasks
              </h4>
            )}
            <div className="space-y-3">
              {todaysTasks.map(task => (
              <div
                key={task.id}
                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${
                  task.completed
                    ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleTaskCompletion(task.id);
                  }}
                  className={`flex-shrink-0 w-6 h-6 rounded border transition-colors flex items-center justify-center ${
                    task.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {task.completed ? <Check className="w-3 h-3" /> : null}
                </button>

                <div 
                  className="flex-1 cursor-pointer" 
                  onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                >
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        {task.time}
                      </span>
                      <span
                        className={`${
                          task.completed
                            ? 'text-green-700 dark:text-green-300 line-through'
                            : 'text-gray-800 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                      {(task.duration || task.distance || (task.targetNumber && task.targetNumber > 1)) && (
                        <span className={`ml-2 text-xs px-2 py-1 rounded ${
                          task.completed
                            ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300'
                            : 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                        }`}>
                          {task.duration
                            ? formatDurationDisplay(task.duration)
                            : task.distance
                              ? formatDistanceDisplay(task.distance || '')
                              : `${task.targetNumber} times`
                          }
                        </span>
                      )}
                    </div>
                    {task.linkedGoalId && (() => {
                      const linkedGoal = goals.find(g => g.id === task.linkedGoalId);
                      return linkedGoal ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900 px-2 py-0.5 rounded">
                            🎯 {linkedGoal.title}
                          </span>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {expandedTask === task.id && task.description && (
                    <p className={`mt-2 text-sm whitespace-pre-line ${
                      task.completed
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditScheduleItem(task);
                    }}
                    className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                    title="Edit task"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingItemId(task.id);
                    }}
                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div
                    className="cursor-pointer"
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                  >
                    {task.description && (
                      <>
                        {expandedTask === task.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
        ) : null}

        {/* Completion Message */}
        {todayStats.total > 0 && todayStats.percentage === 100 && (
          <div className="mt-6 p-4 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg text-center">
            <div className="text-green-800 dark:text-green-200 font-semibold">🎉 Congratulations!</div>
            <div className="text-green-700 dark:text-green-300 text-sm mt-1">
              You've completed all your tasks for {DAYS.find(d => d.key === currentDay)?.label.toLowerCase()}!
            </div>
          </div>
        )}
      </div>

      {todaysTasks.length === 0 && habits.length === 0 && (
        <QuickGuide
          title="Quick Guide"
          tips={[
            'Add one-time tasks for today',
            'Complete habits scheduled for today',
            'Checking items off updates your progress automatically'
          ]}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deletingItemId !== null}
        itemType="task"
        onConfirm={() => {
          if (deletingItemId) {
            onDeleteScheduleItem(deletingItemId);
            setDeletingItemId(null);
          }
        }}
        onCancel={() => setDeletingItemId(null)}
      />
    </div>
  );
}