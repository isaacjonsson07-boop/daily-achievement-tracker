import React, { useState, useMemo } from 'react';
import { CheckSquare, Plus, Trash2, Check, Square, Calendar, Target } from 'lucide-react';
import { Task } from '../types';
import { fmtDateISO, uid } from '../utils/dateUtils';

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export function TasksView({ tasks, onAddTask, onUpdateTask, onDeleteTask }: TasksViewProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const today = fmtDateISO(new Date());

  // All tasks with today's completion status
  const dailyTasks = useMemo(() => {
    return tasks
      .map(task => ({
        ...task,
        completed: task.completedDates.includes(today)
      }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [tasks, today]);

  // Calculate completion stats
  const completionStats = useMemo(() => {
    const total = dailyTasks.length;
    const completed = dailyTasks.filter(task => task.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  }, [dailyTasks]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const task: Task = {
      id: uid(),
      text: newTaskText.trim(),
      completedDates: [],
      createdAt: new Date().toISOString()
    };

    onAddTask(task);
    setNewTaskText('');
  };

  const handleToggleTask = (task: Task) => {
    const isCompletedToday = task.completedDates.includes(today);
    let newCompletedDates;
    
    if (isCompletedToday) {
      // Remove today from completed dates
      newCompletedDates = task.completedDates.filter(date => date !== today);
    } else {
      // Add today to completed dates
      newCompletedDates = [...task.completedDates, today];
    }
    
    onUpdateTask({ 
      ...task, 
      completedDates: newCompletedDates
    });
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      onDeleteTask(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <CheckSquare className="w-6 h-6 mr-3" />
            Daily Routines
          </h2>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Today's Progress</div>
            <div className="text-2xl font-bold text-blue-600">
              {completionStats.completed}/{completionStats.total}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {completionStats.total > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Completion Rate</span>
              <span>{completionStats.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionStats.percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Add New Task Form */}
        <form onSubmit={handleAddTask} className="flex space-x-3">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task... (e.g., Walk the dog, Make the bed)"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newTaskText.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Routine
          </button>
        </form>
      </div>

      {/* Daily Routines */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Today's Routines ({fmtDateISO(new Date())})
        </h3>

        {dailyTasks.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No daily routines yet.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add your first routine above to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dailyTasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                  task.completed
                    ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <button
                  onClick={() => handleToggleTask(task)}
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {task.completed ? <Check className="w-4 h-4" /> : null}
                </button>

                <span
                  className={`flex-1 transition-all ${
                    task.completed
                      ? 'text-green-700 dark:text-green-300 line-through'
                      : 'text-gray-800 dark:text-white'
                  }`}
                >
                  {task.text}
                </span>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="flex-shrink-0 p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                  title="Delete routine"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Completion Message */}
        {completionStats.total > 0 && completionStats.percentage === 100 && (
          <div className="mt-6 p-4 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg text-center">
            <div className="text-green-800 dark:text-green-200 font-semibold">🎉 Congratulations!</div>
            <div className="text-green-700 dark:text-green-300 text-sm mt-1">
              You've completed all your routines for today!
            </div>
          </div>
        )}
      </div>

      {/* Routine Examples */}
      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Daily Routine Ideas:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
          <div>• Walk the dog</div>
          <div>• Make the bed</div>
          <div>• Drink 8 glasses of water</div>
          <div>• Take vitamins</div>
          <div>• Read for 30 minutes</div>
          <div>• Call a friend or family member</div>
          <div>• Do 10 minutes of stretching</div>
          <div>• Plan tomorrow's schedule</div>
        </div>
        <p className="text-blue-700 dark:text-blue-300 text-sm mt-3 italic">
          The purpose of the Daily Routine is to place you in an upward spiral and sustain positive momentum throughout the day.
        </p>
      </div>
    </div>
  );
}