import React, { useState, useMemo } from 'react';
import { Calendar, Plus, Trash2, Save, X, BookOpen as Edit3 } from 'lucide-react';
import { ScheduleItem } from '../types';
import { fmtDateISO, uid } from '../utils/dateUtils';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { CreateItemModal } from './CreateItemModal';
import { QuickGuide } from './QuickGuide';

interface TasksViewProps {
  tasks: never[];
  scheduleItems: ScheduleItem[];
  onAddTask: (task: never) => void;
  onUpdateTask: (task: never) => void;
  onDeleteTask: (id: string) => void;
  onAddScheduleItem: (item: ScheduleItem) => void;
  onUpdateScheduleItem: (item: ScheduleItem) => void;
  onDeleteScheduleItem: (id: string) => void;
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

export function TasksView({
  scheduleItems,
  onAddScheduleItem,
  onUpdateScheduleItem,
  onDeleteScheduleItem
}: TasksViewProps) {
  const [selectedDayForToday, setSelectedDayForToday] = useState(getCurrentDay());
  const [selectedDay, setSelectedDay] = useState('monday');
  const [showModal, setShowModal] = useState(false);
  const [editingScheduleItem, setEditingScheduleItem] = useState<ScheduleItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    time: '09:00',
    title: '',
    description: ''
  });

  const today = fmtDateISO(new Date());

  function getCurrentDay() {
    const today = new Date();
    const dayIndex = today.getDay();
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    const dayMap = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return dayMap[adjustedIndex];
  }

  const currentDay = selectedDayForToday;

  const todaysTasks = useMemo(() => {
    return scheduleItems
      .filter(item => item.day === currentDay)
      .map(item => ({
        ...item,
        completed: item.completedDates.includes(today)
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [scheduleItems, currentDay, today]);

  const itemsByDay = useMemo(() => {
    const grouped: { [key: string]: ScheduleItem[] } = {};
    DAYS.forEach(day => {
      grouped[day.key] = scheduleItems
        .filter(item => item.day === day.key)
        .sort((a, b) => a.time.localeCompare(b.time));
    });
    return grouped;
  }, [scheduleItems]);

  const weeklyStats = useMemo(() => {
    const totalItems = scheduleItems.length;
    const completedItems = scheduleItems.filter(item => item.completedDates.includes(today)).length;
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return { total: totalItems, completed: completedItems, percentage: completionRate };
  }, [scheduleItems, today]);

  const resetForm = () => {
    setFormData({ time: '09:00', title: '', description: '' });
    setSelectedDay('monday');
    setEditingScheduleItem(null);
    setShowModal(false);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item: ScheduleItem) => {
    setEditingScheduleItem(item);
    setFormData({
      time: item.time,
      title: item.title,
      description: item.description || ''
    });
    setSelectedDay(item.day);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingScheduleItem) {
      const updatedItem: ScheduleItem = {
        ...editingScheduleItem,
        day: selectedDay,
        time: formData.time,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined
      };
      onUpdateScheduleItem(updatedItem);
    } else {
      const item: ScheduleItem = {
        id: uid(),
        day: selectedDay,
        time: formData.time,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        completed: false,
        completedDates: [],
        completedCounts: {},
        createdAt: new Date().toISOString()
      };
      onAddScheduleItem(item);
    }

    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Weekly Schedule Management
          </h3>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</div>
            <div className="text-2xl font-bold text-blue-600">
              {weeklyStats.total}
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center mb-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task to Schedule
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
          {DAYS.map(day => (
            <div key={day.key} className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 transition-all ${
              day.key === currentDay
                ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900'
                : 'border-gray-200 dark:border-gray-600'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                  {day.label}
                  {day.key === currentDay && <span className="ml-1 text-xs text-green-600 dark:text-green-400">(Today)</span>}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                  {itemsByDay[day.key].length}
                </span>
              </div>

              {itemsByDay[day.key].length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-400 dark:text-gray-500">No tasks</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {itemsByDay[day.key].map(item => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded text-[10px] flex-shrink-0">
                              {item.time}
                            </span>
                            <p className="text-xs font-medium text-gray-800 dark:text-white truncate">
                              {item.title}
                            </p>
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                            title="Edit task"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeletingItemId(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {scheduleItems.length === 0 && (
        <QuickGuide
          title="Quick Guide"
          tips={[
            'Add tasks to specific days with scheduled times',
            'View all tasks across your week in one place',
            'Switch to "Today\'s Tasks" for daily focus'
          ]}
        />
      )}

      <CreateItemModal
        isOpen={showModal}
        title={editingScheduleItem ? 'Edit Task' : 'Create Task'}
        onClose={resetForm}
        onSubmit={handleSubmit}
        submitLabel={editingScheduleItem ? 'Update Task' : 'Create Task'}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Morning workout, Team meeting"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DAYS.map(day => (
                <option key={day.key} value={day.key}>{day.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Additional details..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </CreateItemModal>

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
