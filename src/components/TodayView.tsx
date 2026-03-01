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
    weekday: 'long', month: 'long', day: 'numeric',
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

  // ── System documents (read-only) ──
  const systemDocs = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('sa_system_documents') || '{}');
    } catch { return {}; }
  }, []);

  const direction = systemDocs.direction?.trim() || '';
  const identity = systemDocs.identity?.trim() || '';

  // ── System age (days since first NN completion or journal entry) ──
  const systemAge = useMemo(() => {
    try {
      const completions = JSON.parse(localStorage.getItem('sa_nn_completions') || '[]');
      const journal = JSON.parse(localStorage.getItem('sa_journal_entries') || '[]');
      const dates: string[] = [
        ...completions.map((c: any) => c.completion_date || c.created_at),
        ...journal.map((j: any) => j.created_at || j.date),
      ].filter(Boolean);
      if (dates.length === 0) return 0;
      const earliest = dates.sort()[0];
      const diff = Date.now() - new Date(earliest).getTime();
      return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
    } catch { return 0; }
  }, []);

  // ── Weekly consistency (only counts days since each item was created) ──
  const weekConsistency = useMemo(() => {
    let totalPossible = 0;
    let totalDone = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = fmtDateISO(d);
      const di = d.getDay();
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);

      const nnsActive = activeNNs.filter(nn => new Date(nn.created_at) <= dayStart);
      const nnD = nnsActive.filter((nn) =>
        nnCompletions.some((c) => c.non_negotiable_id === nn.id && c.completion_date === ds)
      ).length;
      const hForDay = habits.filter((h) => h.days_of_week.includes(di) && new Date(h.created_at) <= dayStart);
      const hD = hForDay.filter((h) =>
        habitCompletions.some((c) => c.habit_id === h.id && c.completion_date === ds)
      ).length;
      totalPossible += nnsActive.length + hForDay.length;
      totalDone += nnD + hD;
    }
    return totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
  }, [nonNegotiables, nnCompletions, habits, habitCompletions]);

  // ── Next review due ──
  const nextReviewDay = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + daysUntilSunday);
    if (daysUntilSunday === 0) return 'Today';
    if (daysUntilSunday === 1) return 'Tomorrow';
    return sunday.toLocaleDateString('en-US', { weekday: 'long' });
  }, []);

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

  return (
    <div className="max-w-3xl mx-auto">

      {/* ════════════════════════════════════════
          OPERATING CONTEXT — who you are & where you're going
          ════════════════════════════════════════ */}
      {(direction || identity) && isToday && (
        <div className="mb-12 text-center animate-rise">
          {direction && (
            <p className="font-serif text-xl sm:text-2xl text-sa-cream font-light leading-relaxed">
              {direction}
            </p>
          )}
          {identity && (
            <p className="text-sm text-sa-gold mt-4 italic">
              {identity}
            </p>
          )}
          <div className="mt-6 border-t border-sa-gold-border mx-auto w-24" />
        </div>
      )}

      {/* ── Date Navigation ── */}
      <div className="flex items-center justify-between mb-10 animate-rise delay-1">
        <button onClick={() => setDayOffset((p) => p - 1)} className="sa-btn-ghost p-2">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="font-serif text-3xl sm:text-4xl text-sa-cream">{dateLabel}</h1>
          <p className="text-sm text-sa-cream-faint mt-1.5">{dateDisplay}</p>
        </div>
        <button onClick={() => setDayOffset((p) => p + 1)} className="sa-btn-ghost p-2">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ════════════════════════════════════════
          EXECUTION — three tiers, visually weighted
          ════════════════════════════════════════ */}

      {/* ── NON-NEGOTIABLES — highest visual weight ── */}
      {nnForDate.length > 0 && (
        <section className="mb-10 animate-rise delay-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-sa-gold" />
            <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-sa-gold">
              Non-Negotiables
            </h2>
            <span className="text-xs text-sa-gold/50">
              {nnForDate.filter(n => n.completed).length}/{nnForDate.length}
            </span>
          </div>
          <div className="space-y-2">
            {nnForDate.map((nn) => (
              <div key={nn.id}
                className={`group flex items-center gap-5 px-6 py-4 rounded-sa-lg border-l-2 transition-all duration-150 ${
                  nn.completed
                    ? 'bg-sa-green-soft border-l-sa-green border border-sa-green-border/50'
                    : 'bg-sa-bg-warm border-l-sa-gold border border-sa-border hover:border-sa-gold-border'
                }`}
              >
                <button onClick={() => onToggleNN(nn, dateStr)}
                  className={`sa-check ${nn.completed ? 'sa-check-done' : 'sa-check-undone'}`}>
                  {nn.completed && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0">
                  <span className={`text-base font-medium ${nn.completed ? 'text-sa-cream-muted' : 'text-sa-cream'}`}>
                    {nn.title}
                  </span>
                  {nn.description && (
                    <span className="ml-3 text-sm text-sa-cream-faint">{nn.description}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── KEYSTONE HABITS — medium weight ── */}
      {habitsWithStatus.length > 0 && (
        <section className="mb-10 animate-rise delay-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-sa-blue/60" />
            <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-sa-cream-muted">
              Keystone Habits
            </h2>
            <span className="text-xs text-sa-cream-faint">
              {habitsWithStatus.filter(h => h.completed).length}/{habitsWithStatus.length}
            </span>
          </div>
          <div className="space-y-2">
            {habitsWithStatus.map((habit) => (
              <div key={habit.id}
                className={`group flex items-center gap-5 px-5 py-3.5 rounded-sa border transition-all duration-150 ${
                  habit.completed
                    ? 'bg-sa-green-soft border-sa-green-border/50'
                    : 'bg-sa-bg-warm border-sa-border hover:border-sa-border-light'
                }`}
              >
                <button onClick={() => onToggleHabit(habit, dateStr)}
                  className={`sa-check ${habit.completed ? 'sa-check-done' : 'sa-check-undone'}`}>
                  {habit.completed && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </button>
                <span className={`text-sm ${habit.completed ? 'text-sa-cream-muted' : 'text-sa-cream'}`}>
                  {habit.name}
                </span>
                {habit.time && <span className="text-xs text-sa-cream-faint ml-auto">{habit.time}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── TASKS — lightest weight ── */}
      <section className="mb-10 animate-rise delay-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-px bg-sa-cream-faint/40" />
            <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-sa-cream-faint">
              Tasks
            </h2>
            <span className="text-xs text-sa-cream-faint/60">
              {tasksForDate.filter(t => t.completed).length}/{tasksForDate.length}
            </span>
          </div>
          <button onClick={() => setShowAddTask(true)}
            className="flex items-center gap-1.5 text-xs text-sa-cream-faint hover:text-sa-gold transition-colors">
            <Plus className="w-3.5 h-3.5" /><span>Add</span>
          </button>
        </div>

        {showAddTask && (
          <div className="mb-4 bg-sa-bg-warm border border-sa-border rounded-sa p-5 animate-rise">
            <div className="flex gap-3 items-center">
              <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} placeholder="What needs to be done?"
                autoFocus className="flex-1 bg-transparent text-sm text-sa-cream placeholder:text-sa-cream-faint border-none outline-none" />
              <input type="time" value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)}
                className="w-28 bg-transparent text-sm text-sa-cream-muted border border-sa-border-light rounded-sa-sm px-2.5 py-2" />
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-sa-border">
              <button onClick={() => { setShowAddTask(false); setNewTaskTitle(''); setNewTaskTime(''); }} className="sa-btn-ghost">Cancel</button>
              <button onClick={handleAddTask} disabled={!newTaskTitle.trim()} className="sa-btn-primary disabled:opacity-30">Add Task</button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {tasksForDate.map((task) => (
            <div key={task.id}
              className={`group flex items-center gap-4 px-4 py-3 rounded-sa transition-all duration-150 ${
                task.completed
                  ? 'opacity-50'
                  : 'hover:bg-sa-bg-warm'
              }`}
            >
              <button onClick={() => onToggleTask(task.id)}
                className={`sa-check ${task.completed ? 'sa-check-done' : 'sa-check-undone'}`}>
                {task.completed && <Check className="w-3 h-3" strokeWidth={3} />}
              </button>
              <span className={`text-sm flex-1 ${task.completed ? 'text-sa-cream-faint line-through' : 'text-sa-cream-soft'}`}>
                {task.title}
              </span>
              {task.time && <span className="text-xs text-sa-cream-faint">{task.time}</span>}
              <button onClick={() => onDeleteTask(task.id)}
                className="p-1 text-sa-cream-faint opacity-0 group-hover:opacity-100 hover:text-sa-rose transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {tasksForDate.length === 0 && !showAddTask && (
            <button onClick={() => setShowAddTask(true)}
              className="w-full py-5 border border-dashed border-sa-border rounded-sa text-sa-cream-faint text-sm hover:border-sa-gold-border hover:text-sa-cream-muted transition-all">
              {isTomorrow ? "Plan tomorrow's tasks" : 'Add a task'}
            </button>
          )}
        </div>
      </section>

      {/* ── Plan Tomorrow (evening) ── */}
      {isToday && isEvening && (
        <div className="mb-10 animate-rise delay-5">
          <button onClick={() => setDayOffset(1)}
            className="w-full py-5 border border-sa-gold-border rounded-sa hover:bg-sa-gold-soft transition-all text-center">
            <p className="text-sa-gold text-sm font-medium">Plan Tomorrow →</p>
            <p className="text-sa-cream-faint text-xs mt-1">Set up before you close out the day.</p>
          </button>
        </div>
      )}

      {/* ── Completion ── */}
      {totalItems > 0 && percentage === 100 && (
        <div className="mb-10 py-5 px-6 bg-sa-green-soft border border-sa-green-border rounded-sa text-center animate-rise">
          <p className="text-sa-green text-sm font-medium">System executed.</p>
          <p className="text-sa-cream-muted text-xs mt-1">All items completed for {dateLabel.toLowerCase()}.</p>
        </div>
      )}

      {/* ════════════════════════════════════════
          SYSTEM PULSE — quiet ambient status
          ════════════════════════════════════════ */}
      {isToday && (systemAge > 0 || totalItems > 0) && (
        <div className="mt-4 pt-8 border-t border-sa-border animate-rise delay-5">
          <p className="text-xs text-sa-cream-faint text-center tracking-wide">
            {systemAge > 0 && <span>System active — Day {systemAge}</span>}
            {systemAge > 0 && weekConsistency > 0 && <span className="mx-2">·</span>}
            {weekConsistency > 0 && <span>{weekConsistency}% this week</span>}
            {(systemAge > 0 || weekConsistency > 0) && <span className="mx-2">·</span>}
            <span>Weekly review {nextReviewDay.toLowerCase()}</span>
          </p>
        </div>
      )}

      {/* ── Empty state ── */}
      {totalItems === 0 && !showAddTask && !direction && (
        <div className="text-center py-20 animate-rise delay-2">
          <p className="font-serif text-xl text-sa-cream mb-3">Your system is empty.</p>
          <p className="text-sm text-sa-cream-muted max-w-md mx-auto">
            Start the Installation to build your operating system — define your direction,
            set your non-negotiables, and install the habits that run your life.
          </p>
        </div>
      )}
    </div>
  );
}
