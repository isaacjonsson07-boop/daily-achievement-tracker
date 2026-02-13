import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Plus, Trash2, Save, X, Pencil } from 'lucide-react';
import { Habit, Goal } from '../types';
import { supabase } from '../lib/supabase';
import { uid } from '../utils/dateUtils';
import { formatDistanceDisplay, formatDurationDisplay, formatWeightDisplay } from '../utils/formatting';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { CreateItemModal } from './CreateItemModal';
import { QuickGuide } from './QuickGuide';

interface HabitsViewProps {
  habits: Habit[];
  goals: Goal[];
  onHabitsChange: () => void;
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
}

interface EditContext {
  habit: Habit;
}

const DAYS = [
  { value: 1, label: 'Mon', short: 'M' },
  { value: 2, label: 'Tue', short: 'T' },
  { value: 3, label: 'Wed', short: 'W' },
  { value: 4, label: 'Thu', short: 'T' },
  { value: 5, label: 'Fri', short: 'F' },
  { value: 6, label: 'Sat', short: 'S' },
  { value: 0, label: 'Sun', short: 'S' }
];

export function HabitsView({ habits, goals, onHabitsChange, setHabits }: HabitsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editContext, setEditContext] = useState<EditContext | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedDescriptionIds, setExpandedDescriptionIds] = useState<Set<string>>(new Set());
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    target_number: '',
    days_of_week: [] as number[],
    time: '09:00',
    type: 'task' as 'task' | 'time' | 'distance' | 'weight',
    duration: '',
    distance: '',
    weight: '',
    description: '',
    linkedGoalId: ''
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [formData.description, showAddForm]);

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day].sort()
    }));
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || formData.days_of_week.length === 0) return;

    if (formData.type === 'task' && (!formData.target_number || parseInt(formData.target_number) < 1)) {
      alert('Please enter a valid number of times (at least 1)');
      return;
    }

    if (formData.type === 'time' && !formData.duration.trim()) {
      alert('Please enter a duration for time-based habits');
      return;
    }

    if (formData.type === 'distance' && !formData.distance.trim()) {
      alert('Please enter a distance for distance-based habits');
      return;
    }

    if (formData.type === 'weight' && !formData.weight.trim()) {
      alert('Please enter a weight for weight-based habits');
      return;
    }

    let validatedLinkedGoalId = formData.linkedGoalId;
    if (formData.linkedGoalId) {
      const linkedGoal = goals.find(g => g.id === formData.linkedGoalId);
      if (!linkedGoal) {
        console.warn('Selected goal not found. Clearing linked goal.');
        alert('The selected goal no longer exists. Please select a different goal or leave it unlinked.');
        validatedLinkedGoalId = '';
      } else if (linkedGoal.goalType !== formData.type) {
        console.warn('Goal type mismatch. Clearing linked goal.');
        alert('The selected goal type does not match this habit type. Please select a matching goal or leave it unlinked.');
        validatedLinkedGoalId = '';
      }
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('habits')
          .insert({
            name: formData.name.trim(),
            target_number: parseInt(formData.target_number) || 1,
            days_of_week: formData.days_of_week,
            time: formData.time,
            description: formData.description.trim() || undefined,
            duration: formData.type === 'time' ? formData.duration.trim() : undefined,
            distance: formData.type === 'distance' ? formData.distance.trim() : undefined,
            weight: formData.type === 'weight' ? formData.weight.trim() : undefined,
            linked_goal_id: validatedLinkedGoalId || undefined,
            user_id: user.id
          });

        if (error) throw error;
        onHabitsChange();
      } else {
        const newHabit: Habit = {
          id: uid(),
          user_id: '',
          name: formData.name.trim(),
          target_number: parseInt(formData.target_number) || 1,
          days_of_week: formData.days_of_week,
          time: formData.time,
          description: formData.description.trim() || undefined,
          duration: formData.type === 'time' ? formData.duration.trim() : undefined,
          distance: formData.type === 'distance' ? formData.distance.trim() : undefined,
          weight: formData.type === 'weight' ? formData.weight.trim() : undefined,
          linked_goal_id: validatedLinkedGoalId || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setHabits(prev => [...prev, newHabit]);
      }

      setFormData({
        name: '',
        target_number: '',
        days_of_week: [],
        time: '09:00',
        type: 'task',
        duration: '',
        distance: '',
        weight: '',
        description: '',
        linkedGoalId: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding habit:', error);
      alert('Failed to add habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateHabit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editContext || !formData.name.trim() || formData.days_of_week.length === 0) return;

    if (formData.type === 'task' && (!formData.target_number || parseInt(formData.target_number) < 1)) {
      alert('Please enter a valid number of times (at least 1)');
      return;
    }

    if (formData.type === 'time' && !formData.duration.trim()) {
      alert('Please enter a duration for time-based habits');
      return;
    }

    if (formData.type === 'distance' && !formData.distance.trim()) {
      alert('Please enter a distance for distance-based habits');
      return;
    }

    if (formData.type === 'weight' && !formData.weight.trim()) {
      alert('Please enter a weight for weight-based habits');
      return;
    }

    let validatedLinkedGoalId = formData.linkedGoalId;
    if (formData.linkedGoalId) {
      const linkedGoal = goals.find(g => g.id === formData.linkedGoalId);
      if (!linkedGoal) {
        console.warn('Selected goal not found. Clearing linked goal.');
        alert('The selected goal no longer exists. Please select a different goal or leave it unlinked.');
        validatedLinkedGoalId = '';
      } else if (linkedGoal.goalType !== formData.type) {
        console.warn('Goal type mismatch. Clearing linked goal.');
        alert('The selected goal type does not match this habit type. Please select a matching goal or leave it unlinked.');
        validatedLinkedGoalId = '';
      }
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('habits')
          .update({
            name: formData.name.trim(),
            target_number: parseInt(formData.target_number) || 1,
            days_of_week: formData.days_of_week,
            time: formData.time,
            description: formData.description.trim() || undefined,
            duration: formData.type === 'time' ? formData.duration.trim() : undefined,
            distance: formData.type === 'distance' ? formData.distance.trim() : undefined,
            weight: formData.type === 'weight' ? formData.weight.trim() : undefined,
            linked_goal_id: validatedLinkedGoalId || undefined,
            updated_at: new Date().toISOString()
          })
          .eq('id', editContext.habit.id);

        if (error) throw error;
        onHabitsChange();
      } else {
        setHabits(prev => prev.map(h =>
          h.id === editContext.habit.id
            ? {
                ...h,
                name: formData.name.trim(),
                target_number: parseInt(formData.target_number) || 1,
                days_of_week: formData.days_of_week,
                time: formData.time,
                description: formData.description.trim() || undefined,
                duration: formData.type === 'time' ? formData.duration.trim() : undefined,
                distance: formData.type === 'distance' ? formData.distance.trim() : undefined,
                weight: formData.type === 'weight' ? formData.weight.trim() : undefined,
                linked_goal_id: validatedLinkedGoalId || undefined,
                updated_at: new Date().toISOString()
              }
            : h
        ));
      }

      setEditContext(null);
      setFormData({
        name: '',
        target_number: '',
        days_of_week: [],
        time: '09:00',
        type: 'task',
        duration: '',
        distance: '',
        weight: '',
        description: '',
        linkedGoalId: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error updating habit:', error);
      alert('Failed to update habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditContext({ habit });
    setFormData({
      name: habit.name,
      target_number: habit.target_number.toString(),
      days_of_week: habit.days_of_week,
      time: habit.time,
      type: habit.duration ? 'time' : habit.distance ? 'distance' : habit.weight ? 'weight' : 'task',
      duration: habit.duration || '',
      distance: habit.distance || '',
      weight: habit.weight || '',
      description: habit.description || '',
      linkedGoalId: habit.linked_goal_id || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('habits')
          .delete()
          .eq('id', id);

        if (error) throw error;
        onHabitsChange();
      } else {
        setHabits(prev => prev.filter(h => h.id !== id));
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const handleCancel = () => {
    setEditContext(null);
    setFormData({
      name: '',
      target_number: '',
      days_of_week: [],
      time: '09:00',
      type: 'task',
      duration: '',
      distance: '',
      weight: '',
      description: '',
      linkedGoalId: ''
    });
    setShowAddForm(false);
  };

  const getDayName = (dayNum: number) => {
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayMap[dayNum];
  };

  const getDayShort = (dayNum: number) => {
    const day = DAYS.find(d => d.value === dayNum);
    return day ? day.short : '';
  };

  const getLinkedGoalName = (goalId?: string) => {
    if (!goalId) return null;
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.title : null;
  };

  const sortedHabits = [...habits].sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
  });

  const toggleDescription = (habitId: string) => {
    setExpandedDescriptionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(habitId)) {
        newSet.delete(habitId);
      } else {
        newSet.add(habitId);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Daily Habits
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage recurring habits that appear in Today's Tasks
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Habit
          </button>
        </div>

        <CreateItemModal
          isOpen={showAddForm}
          title={editContext ? 'Edit Habit' : 'Create Habit'}
          onClose={handleCancel}
          onSubmit={editContext ? handleUpdateHabit : handleAddHabit}
          submitLabel={editContext ? 'Update Habit' : 'Create Habit'}
          isSubmitting={isSubmitting}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Habit Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning workout, Run 5km, Study for 2 hours"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value as 'task' | 'time' | 'distance' | 'weight';
                  const linkedGoal = goals.find(g => g.id === formData.linkedGoalId);
                  const newLinkedGoalId = linkedGoal && linkedGoal.goalType === newType ? formData.linkedGoalId : '';
                  setFormData({ ...formData, type: newType, linkedGoalId: newLinkedGoalId });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="task">Task</option>
                <option value="time">Time-based</option>
                <option value="distance">Distance-based</option>
                <option value="weight">Weight-based</option>
              </select>
            </div>
          </div>

          {formData.type === 'task' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Times</label>
              <input
                type="number"
                min="1"
                value={formData.target_number}
                onChange={(e) => setFormData({ ...formData, target_number: e.target.value })}
                placeholder="e.g., 1, 2, 3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">How many times to complete this task</p>
            </div>
          )}

          {formData.type === 'time' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 30min, 1h 15m, 2 hours"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Examples: 30min, 1h 30m, 2 hours</p>
            </div>
          )}

          {formData.type === 'distance' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Distance</label>
              <input
                type="text"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                placeholder="e.g., 5km, 3 miles, 2000m"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Examples: 5km, 3 miles, 2000m</p>
            </div>
          )}

          {formData.type === 'weight' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g., 72.5, 100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter weight in kilograms</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Repeat On</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayToggle(day.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    formData.days_of_week.includes(day.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            {formData.days_of_week.length === 0 && (
              <p className="text-xs text-red-500 mt-1">Please select at least one day</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
            <textarea
              ref={textareaRef}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link to Goal (optional)</label>
            <select
              value={formData.linkedGoalId}
              onChange={(e) => setFormData({ ...formData, linkedGoalId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No linked goal</option>
              {goals.filter(g => !g.completed && g.goalType === formData.type).map(goal => (
                <option key={goal.id} value={goal.id}>
                  {goal.title} ({goal.currentAmount}/{goal.targetAmount} {goal.unit})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-update goal progress when completing this habit</p>
          </div>
        </CreateItemModal>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 whitespace-nowrap">
                  Time
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 min-w-[200px]">
                  Habit
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 whitespace-nowrap">
                  Unit
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  Mon
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  Tue
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  Wed
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  Thu
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  Fri
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  Sat
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  Sun
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 min-w-[150px]">
                  Description
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {habits.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center border border-gray-300 dark:border-gray-600">
                    <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No habits yet. Create your first habit to get started!</p>
                  </td>
                </tr>
              ) : (
                sortedHabits.map(habit => {
                  const linkedGoalName = getLinkedGoalName(habit.linked_goal_id);

                  return (
                    <tr
                      key={habit.id}
                      className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-3 py-3 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 whitespace-nowrap font-medium">
                        {habit.time}
                      </td>

                      <td className="px-3 py-3 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                        <div className="flex flex-col">
                          <span className="font-medium">{habit.name}</span>
                          {linkedGoalName && (
                            <span className="text-xs text-green-600 dark:text-green-400 mt-1">
                              {linkedGoalName}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 whitespace-nowrap">
                        {habit.duration
                          ? formatDurationDisplay(habit.duration)
                          : habit.distance
                            ? formatDistanceDisplay(habit.distance)
                            : habit.weight
                              ? formatWeightDisplay(habit.weight)
                              : habit.target_number === 1
                                ? '1 time'
                                : `${habit.target_number} times`
                        }
                      </td>

                      <td className="px-3 py-3 text-center border border-gray-300 dark:border-gray-600">
                        <div className={`w-6 h-6 mx-auto rounded flex items-center justify-center text-xs font-semibold ${
                          habit.days_of_week.includes(1)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
                        }`}>
                          {habit.days_of_week.includes(1) ? '✓' : ''}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center border border-gray-300 dark:border-gray-600">
                        <div className={`w-6 h-6 mx-auto rounded flex items-center justify-center text-xs font-semibold ${
                          habit.days_of_week.includes(2)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
                        }`}>
                          {habit.days_of_week.includes(2) ? '✓' : ''}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center border border-gray-300 dark:border-gray-600">
                        <div className={`w-6 h-6 mx-auto rounded flex items-center justify-center text-xs font-semibold ${
                          habit.days_of_week.includes(3)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
                        }`}>
                          {habit.days_of_week.includes(3) ? '✓' : ''}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center border border-gray-300 dark:border-gray-600">
                        <div className={`w-6 h-6 mx-auto rounded flex items-center justify-center text-xs font-semibold ${
                          habit.days_of_week.includes(4)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
                        }`}>
                          {habit.days_of_week.includes(4) ? '✓' : ''}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center border border-gray-300 dark:border-gray-600">
                        <div className={`w-6 h-6 mx-auto rounded flex items-center justify-center text-xs font-semibold ${
                          habit.days_of_week.includes(5)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
                        }`}>
                          {habit.days_of_week.includes(5) ? '✓' : ''}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center border border-gray-300 dark:border-gray-600">
                        <div className={`w-6 h-6 mx-auto rounded flex items-center justify-center text-xs font-semibold ${
                          habit.days_of_week.includes(6)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
                        }`}>
                          {habit.days_of_week.includes(6) ? '✓' : ''}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center border border-gray-300 dark:border-gray-600">
                        <div className={`w-6 h-6 mx-auto rounded flex items-center justify-center text-xs font-semibold ${
                          habit.days_of_week.includes(0)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
                        }`}>
                          {habit.days_of_week.includes(0) ? '✓' : ''}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600">
                        {habit.description ? (
                          habit.description.length > 50 ? (
                            <div className="flex flex-col gap-2">
                              <span className={expandedDescriptionIds.has(habit.id) ? '' : 'line-clamp-2'}>
                                {expandedDescriptionIds.has(habit.id) ? habit.description : truncateText(habit.description, 50)}
                              </span>
                              <button
                                onClick={() => toggleDescription(habit.id)}
                                className="text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap text-left"
                              >
                                {expandedDescriptionIds.has(habit.id) ? 'Show less' : 'Show more'}
                              </button>
                            </div>
                          ) : (
                            habit.description
                          )
                        ) : (
                          '-'
                        )}
                      </td>

                      <td className="px-3 py-3 border border-gray-300 dark:border-gray-600">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEditHabit(habit)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                            title="Edit habit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingItemId(habit.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                            title="Delete habit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {habits.length === 0 && (
        <QuickGuide
          title="Quick Guide"
          tips={[
            'Create recurring habits with specific days and times',
            'Complete habits in Today\'s Tasks on scheduled days',
            'Link habits to goals for automatic progress tracking'
          ]}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deletingItemId !== null}
        itemType="habit"
        onConfirm={() => {
          if (deletingItemId) {
            handleDeleteHabit(deletingItemId);
            setDeletingItemId(null);
          }
        }}
        onCancel={() => setDeletingItemId(null)}
      />
    </div>
  );
}
