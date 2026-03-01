import React, { useState, useMemo } from 'react';
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Habit, HabitCompletion, DailyTask, NonNegotiable, NonNegotiableCompletion } from '../types';
import { fmtDateISO, uid } from '../utils/dateUtils';

interface TodayViewProps {
  nonNegotiables: NonNegotiable[];
  nnCompletions: NonNegotiableCompletion[];
  onToggleNN: (nn: NonNegotiable, date: string) => void;
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  onToggleHabit: (habit: Habit, date: string) => void;
  dailyTasks: DailyTask[];
  onAddTask: (task: DailyTask) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function TodayView({
  nonNegotiables, nnCompletions, onToggleNN,
  habits, habitCompletions, onToggleHabit,
  dailyTasks, onAddTask, onToggleTask, onDeleteTask,
}: TodayViewProps) {
  const [dayOffset, setDayOffset] = useState(0);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  // ── Date logic ──
  const selectedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [dayOffset]);

  const dateStr = fmtDateISO(selectedDate);
  const isToday = dayOffset === 0;
  const isTomorrow = dayOffset === 1;
  const jsDayIndex = selectedDate.getDay();
  const isEvening = new Date().getHours() >= 18;

  const dateLabel = useMemo(() => {
    if (dayOffset === 0) return 'Today';
    if (dayOffset === 1) return 'Tomorrow';
    if (dayOffset === -1) return 'Yesterday';
    return selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
  }, [dayOffset, selectedDate]);

  const dateDisplay = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  // ── Data for selected date ──
  const activeNNs = nonNegotiables.filter((nn) => nn.active);
  const nnForDate = activeNNs.map((nn) => ({
    ...nn,
    completed: nnCompletions.some(
      (c) => c.non_negotiable_id === nn.id && c.completion_date === dateStr
    ),
  }));

  const habitsForDay = habits.filter((h) => h.days_of_week.includes(jsDayIndex));
  const habitsWithStatus = habitsForDay.map((h) => ({
    ...h,
    completed: habitCompletions.some(
      (c) => c.habit_id === h.id && c.completion_date === dateStr
    ),
  }));

  const tasksForDate = dailyTasks.filter((t) => t.task_date === dateStr);

  // ── Stats ──
  const totalItems = nnForDate.length + habitsWithStatus.length + tasksForDate.length;
  const completedItems =
    nnForDate.filter((n) => n.completed).length +
    habitsWithStatus.filter((h) => h.completed).length +
    tasksForDate.filter((t) => t.completed).length;
  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // ── Add task handler ──
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask({
      id: uid(),
      title: newTaskTitle.trim(),
      task_date: dateStr,
      time: newTaskTime || undefined,
      completed: false,
      created_at: new Date().toISOString(),
    });
    setNewTaskTitle('');
    setNewTaskTime('');
    setShowAddTask(false);
  };

  // ── Item row — full width, spacious ──
  const ItemRow = ({
    completed, onToggle, title, subtitle, onDelete,
  }: {
    completed: boolean; onToggle: () => void; title: string;
    subtitle?: string; onDelete?: () => void;
  }) => (
    <div className={`group flex items-center gap-5 px-6 py-4 rounded-sa-lg border transition-all duration-150 ${
      completed
        ? 'bg-sa-green-soft border-sa-green-border'
        : 'bg-sa-bg-warm border-sa-border hover:border-sa-border-light'
    }`}>
      <button onClick={onToggle} className={`sa-check ${completed ? 'sa-check-done' : 'sa-check-undone'}`}>
        {completed && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <span className={`text-base ${completed ? 'text-sa-cream-muted line-through decoration-sa-cream-faint/40' : 'text-sa-cream'}`}>
          {title}
        </span>
        {subtitle && <span className="ml-3 text-sm text-sa-cream-faint">{subtitle}</span>}
      </div>
      {onDelete && (
        <button onClick={onDelete}
          className="flex-shrink-0 p-1.5 text-sa-cream-faint opacity-0 group-hover:opacity-100 hover:text-sa-rose transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  // ── Section header ──
  const SectionHeader = ({ label, color, count, completedCount, action }: {
    label: string; color: string; count: number; completedCount: number; action?: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <h2 className="text-sm font-medium uppercase tracking-wider text-sa-cream-muted">{label}</h2>
        <span className="text-sm text-sa-cream-faint">{completedCount}/{count}</span>
      </div>
      {action}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Header: date nav + inline progress ── */}
      <div className="flex items-center justify-between mb-10 animate-rise">
        <button onClick={() => setDayOffset((p) => p - 1)} className="sa-btn-ghost p-2">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="font-serif text-3xl sm:text-4xl text-sa-cream">{dateLabel}</h1>
          <p className="text-sm text-sa-cream-muted mt-1.5">{dateDisplay}</p>
        </div>

        <button onClick={() => setDayOffset((p) => p + 1)} className="sa-btn-ghost p-2">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ── Inline progress bar (not a ring — cleaner) ── */}
      {totalItems > 0 && (
        <div className="mb-10 animate-rise delay-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-sa-cream-muted">{completedItems} of {totalItems}</span>
            <span className={`text-sm font-medium ${percentage === 100 ? 'text-sa-green' : 'text-sa-gold'}`}>
              {percentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-sa-bg-lift rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${percentage}%`,
                background: percentage === 100 ? 'var(--green)' : 'var(--gold)',
              }}
            />
          </div>
        </div>
      )}

      {/* ── Non-Negotiables ── */}
      {nnForDate.length > 0 && (
        <section className="mb-10 animate-rise delay-2">
          <SectionHeader label="Non-Negotiables" color="bg-sa-gold" count={nnForDate.length}
            completedCount={nnForDate.filter(n => n.completed).length} />
          <div className="space-y-3">
            {nnForDate.map((nn) => (
              <ItemRow key={nn.id} completed={nn.completed}
                onToggle={() => onToggleNN(nn, dateStr)} title={nn.title} subtitle={nn.description} />
            ))}
          </div>
        </section>
      )}

      {/* ── Keystone Habits ── */}
      {habitsWithStatus.length > 0 && (
        <section className="mb-10 animate-rise delay-3">
          <SectionHeader label="Keystone Habits" color="bg-sa-blue" count={habitsWithStatus.length}
            completedCount={habitsWithStatus.filter(h => h.completed).length} />
          <div className="space-y-3">
            {habitsWithStatus.map((habit) => (
              <ItemRow key={habit.id} completed={habit.completed}
                onToggle={() => onToggleHabit(habit, dateStr)} title={habit.name} subtitle={habit.time || undefined} />
            ))}
          </div>
        </section>
      )}

      {/* ── Daily Tasks ── */}
      <section className="mb-10 animate-rise delay-4">
        <SectionHeader label="Tasks" color="bg-sa-cream-faint" count={tasksForDate.length}
          completedCount={tasksForDate.filter(t => t.completed).length}
          action={
            <button onClick={() => setShowAddTask(true)}
              className="flex items-center gap-1.5 text-sm text-sa-cream-faint hover:text-sa-gold transition-colors">
              <Plus className="w-4 h-4" /><span>Add</span>
            </button>
          } />

        {showAddTask && (
          <div className="mb-4 sa-card animate-rise">
            <div className="flex gap-3 items-center">
              <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} placeholder="What needs to be done?"
                autoFocus className="flex-1 bg-transparent text-base text-sa-cream placeholder:text-sa-cream-faint border-none outline-none" />
              <input type="time" value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)}
                className="w-28 bg-transparent text-sm text-sa-cream-muted border border-sa-border-light rounded-sa-sm px-2.5 py-2" />
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-sa-border">
              <button onClick={() => { setShowAddTask(false); setNewTaskTitle(''); setNewTaskTime(''); }} className="sa-btn-ghost">Cancel</button>
              <button onClick={handleAddTask} disabled={!newTaskTitle.trim()} className="sa-btn-primary disabled:opacity-30">Add Task</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {tasksForDate.map((task) => (
            <ItemRow key={task.id} completed={task.completed}
              onToggle={() => onToggleTask(task.id)} title={task.title}
              subtitle={task.time || undefined} onDelete={() => onDeleteTask(task.id)} />
          ))}
          {tasksForDate.length === 0 && !showAddTask && (
            <button onClick={() => setShowAddTask(true)}
              className="w-full py-6 border border-dashed border-sa-border-light rounded-sa-lg text-sa-cream-faint text-sm hover:border-sa-gold-border hover:text-sa-cream-muted transition-all">
              {isTomorrow ? "Plan tomorrow's tasks" : 'Add a task'}
            </button>
          )}
        </div>
      </section>

      {/* ── Plan Tomorrow (evening) ── */}
      {isToday && isEvening && (
        <div className="mb-10 animate-rise delay-5">
          <button onClick={() => setDayOffset(1)}
            className="w-full py-5 px-6 sa-card border-sa-gold-border hover:bg-sa-gold-soft transition-all text-center">
            <p className="text-sa-gold text-base font-medium">Plan Tomorrow →</p>
            <p className="text-sa-cream-faint text-sm mt-1">Set up before you close out the day.</p>
          </button>
        </div>
      )}

      {/* ── Completion ── */}
      {totalItems > 0 && percentage === 100 && (
        <div className="py-6 px-6 bg-sa-green-soft border border-sa-green-border rounded-sa-lg text-center animate-rise">
          <p className="text-sa-green text-base font-medium">System executed.</p>
          <p className="text-sa-cream-muted text-sm mt-1">All items completed for {dateLabel.toLowerCase()}.</p>
        </div>
      )}

      {/* ── Empty state ── */}
      {totalItems === 0 && !showAddTask && (
        <div className="text-center py-20 animate-rise delay-2">
          <p className="text-sa-cream-muted text-base">No items configured yet.</p>
          <p className="text-sa-cream-faint text-sm mt-2">
            Go to System to add your non-negotiables and habits, or add a task above.
          </p>
        </div>
      )}
    </div>
  );
}
