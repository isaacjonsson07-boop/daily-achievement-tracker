import React, { useState, useMemo } from 'react';
import { BarChart3, ChevronDown, ChevronUp, Check, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { NonNegotiable, NonNegotiableCompletion, Habit, HabitCompletion, DailyTask, Goal } from '../types';
import { fmtDateISO, uid } from '../utils/dateUtils';

interface ReviewsViewProps {
  nonNegotiables: NonNegotiable[];
  nnCompletions: NonNegotiableCompletion[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  dailyTasks: DailyTask[];
  goals: Goal[];
  systemDocuments: Record<string, string>;
  onUpdateSystemDocument?: (key: string, content: string) => void;
}

interface SavedReview {
  id: string;
  type: 'weekly' | 'monthly' | 'quarterly';
  date: string;
  answers: Record<string, string>;
  stats?: { nnRate: number; habitRate: number; taskRate: number; overall: number };
}

interface RecalibrationData {
  direction: string;
  identity: string;
  priorities: string;
  nnActions: Record<string, 'keep' | 'remove'>;
  newNNs: string;
  habitActions: Record<string, 'keep' | 'rotate'>;
  newHabits: string;
  focusNextQuarter: string;
}

const WEEKLY_QUESTIONS = [
  'What worked well this week? Where did you stay consistent?',
  'Where did you lose focus or drift? What was the cause?',
  'What one adjustment will you make to your system next week?',
  'What is your single focus for the coming week?',
];

export function ReviewsView({
  nonNegotiables,
  nnCompletions,
  habits,
  habitCompletions,
  dailyTasks,
  goals,
  systemDocuments,
  onUpdateSystemDocument,
}: ReviewsViewProps) {
  const [activeTab, setActiveTab] = useState<'snapshot' | 'weekly' | 'quarterly'>('snapshot');
  const [weeklyAnswers, setWeeklyAnswers] = useState<Record<string, string>>({});
  const [savedReviews, setSavedReviews] = useState<SavedReview[]>(() => {
    try {
      const raw = localStorage.getItem('sa_reviews');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [showPastReviews, setShowPastReviews] = useState(false);

  // Quarterly Recalibration state
  const [recalStep, setRecalStep] = useState(0); // 0 = overview, 1-5 = steps, 6 = complete
  const [recalData, setRecalData] = useState<RecalibrationData>({
    direction: systemDocuments.direction || '',
    identity: systemDocuments.identity || '',
    priorities: systemDocuments.priorities || '',
    nnActions: {},
    newNNs: '',
    habitActions: {},
    newHabits: '',
    focusNextQuarter: '',
  });
  const lastRecalibration = useMemo(() => {
    const quarterly = savedReviews.filter(r => r.type === 'quarterly');
    return quarterly.length > 0 ? quarterly[0].date : null;
  }, [savedReviews]);

  // ── Week stats (last 7 days) ──
  const weekStats = useMemo(() => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(fmtDateISO(d));
    }

    const activeNNs = nonNegotiables.filter((nn) => nn.active);

    const dailyData = days.map((date) => {
      const d = new Date(date + 'T00:00:00');
      const dayIndex = d.getDay();
      const dayStart = d.getTime();

      // Only count items that existed on this day
      const nnsForDay = activeNNs.filter(nn => new Date(nn.created_at).getTime() <= dayStart + 86400000);
      const nnTotal = nnsForDay.length;
      const nnDone = nnsForDay.filter((nn) =>
        nnCompletions.some((c) => c.non_negotiable_id === nn.id && c.completion_date === date)
      ).length;

      const habitsForDay = habits.filter((h) => h.days_of_week.includes(dayIndex) && new Date(h.created_at).getTime() <= dayStart + 86400000);
      const habitsDone = habitsForDay.filter((h) =>
        habitCompletions.some((c) => c.habit_id === h.id && c.completion_date === date)
      ).length;

      const tasksForDay = dailyTasks.filter((t) => t.task_date === date);
      const tasksDone = tasksForDay.filter((t) => t.completed).length;

      return {
        date,
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
        total: nnTotal + habitsForDay.length + tasksForDay.length,
        done: nnDone + habitsDone + tasksDone,
        nnDone, nnTotal,
        habitsDone, habitsTotal: habitsForDay.length,
        tasksDone, tasksTotal: tasksForDay.length,
        percentage: (nnTotal + habitsForDay.length + tasksForDay.length) > 0
          ? Math.round(((nnDone + habitsDone + tasksDone) / (nnTotal + habitsForDay.length + tasksForDay.length)) * 100)
          : 0,
      };
    });

    const totalPossible = dailyData.reduce((s, d) => s + d.total, 0);
    const totalDone = dailyData.reduce((s, d) => s + d.done, 0);
    const weekPercentage = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

    const nnPossible = dailyData.reduce((s, d) => s + d.nnTotal, 0);
    const nnDone = dailyData.reduce((s, d) => s + d.nnDone, 0);
    const nnRate = nnPossible > 0 ? Math.round((nnDone / nnPossible) * 100) : 0;

    const habitPossible = dailyData.reduce((s, d) => s + d.habitsTotal, 0);
    const habitDone = dailyData.reduce((s, d) => s + d.habitsDone, 0);
    const habitRate = habitPossible > 0 ? Math.round((habitDone / habitPossible) * 100) : 0;

    const taskPossible = dailyData.reduce((s, d) => s + d.tasksTotal, 0);
    const taskDone = dailyData.reduce((s, d) => s + d.tasksDone, 0);
    const taskRate = taskPossible > 0 ? Math.round((taskDone / taskPossible) * 100) : 0;

    let streak = 0;
    for (let i = dailyData.length - 1; i >= 0; i--) {
      if (dailyData[i].percentage >= 80) streak++;
      else break;
    }

    return { dailyData, weekPercentage, streak, totalDone, totalPossible, nnRate, habitRate, taskRate };
  }, [nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks]);

  // ── Save review ──
  const handleSaveWeeklyReview = () => {
    const hasContent = Object.values(weeklyAnswers).some(a => a.trim());
    if (!hasContent) return;

    const review: SavedReview = {
      id: uid(),
      type: 'weekly',
      date: new Date().toISOString(),
      answers: { ...weeklyAnswers },
      stats: {
        nnRate: weekStats.nnRate,
        habitRate: weekStats.habitRate,
        taskRate: weekStats.taskRate,
        overall: weekStats.weekPercentage,
      },
    };

    const updated = [review, ...savedReviews];
    setSavedReviews(updated);
    localStorage.setItem('sa_reviews', JSON.stringify(updated));
    setWeeklyAnswers({});
  };

  // ── Rate color helper ──
  const rateColor = (rate: number) =>
    rate >= 80 ? 'text-sa-green' : rate >= 50 ? 'text-sa-gold' : 'text-sa-rose';

  const rateBarColor = (rate: number) =>
    rate >= 80 ? 'var(--green)' : rate >= 50 ? 'var(--gold)' : 'var(--rose)';

  // ── Tab button helper ──
  const TabBtn = ({ id, label }: { id: typeof activeTab; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-xs font-medium rounded-sa-sm transition-colors ${
        activeTab === id
          ? 'text-sa-gold bg-sa-gold-soft'
          : 'text-sa-cream-muted hover:text-sa-cream-soft'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header handled by TabCover */}
      <div className="mb-4 animate-rise" />

      {/* Tabs */}
      <div className="flex gap-1 mb-8 animate-rise delay-1">
        <TabBtn id="snapshot" label="Snapshot" />
        <TabBtn id="weekly" label="Weekly" />
        <TabBtn id="quarterly" label="Quarterly" />
      </div>

      {/* ════════ SNAPSHOT TAB ════════ */}
      {activeTab === 'snapshot' && (
        <div className="space-y-6 animate-rise delay-2">

          {/* Left column — charts */}
          <div className="space-y-6">

            {/* System Health Card */}
            <div className="sa-card-elevated">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="sa-section-subtitle text-sa-gold mb-1">System Health — Last 7 Days</p>
                  <p className="text-3xl font-light text-sa-cream">{weekStats.weekPercentage}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-sa-cream-muted">
                    {weekStats.totalDone}/{weekStats.totalPossible} completed
                  </p>
                  {weekStats.streak > 0 && (
                    <p className="text-xs text-sa-green mt-1">{weekStats.streak}-day streak</p>
                  )}
                </div>
              </div>

              {/* Daily bars */}
              <div className="flex items-end gap-2 h-20">
                {weekStats.dailyData.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full bg-sa-bg rounded-sm relative" style={{ height: '60px' }}>
                      <div className="absolute bottom-0 w-full rounded-sm transition-all duration-500" style={{
                        height: `${day.percentage}%`,
                        background: day.percentage === 100 ? 'var(--green)' : day.percentage >= 80 ? 'var(--gold)' : day.percentage > 0 ? 'rgba(201,169,110,0.4)' : 'transparent',
                      }} />
                    </div>
                    <span className="text-[0.55rem] text-sa-cream-faint">{day.dayLabel}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* NN consistency per item */}
            {nonNegotiables.filter(n => n.active).length > 0 && (
              <div className="sa-card-elevated">
                <p className="sa-section-subtitle text-sa-gold mb-4">Non-Negotiable Consistency</p>
                <div className="space-y-3">
                  {nonNegotiables.filter(n => n.active).map((nn) => {
                    const applicableDays = weekStats.dailyData.filter(d =>
                      new Date(nn.created_at).getTime() <= new Date(d.date + 'T23:59:59').getTime()
                    );
                    const completedDays = applicableDays.filter(d =>
                      nnCompletions.some(c => c.non_negotiable_id === nn.id && c.completion_date === d.date)
                    ).length;
                    const totalDays = applicableDays.length || 1;
                    const rate = Math.round((completedDays / totalDays) * 100);
                    return (
                      <div key={nn.id} className="flex items-center gap-3">
                        <span className="text-sm text-sa-cream flex-1 truncate">{nn.title}</span>
                        <div className="w-20 sa-progress-track">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${rate}%`, background: rateBarColor(rate) }} />
                        </div>
                        <span className={`text-xs w-8 text-right ${rateColor(rate)}`}>{completedDays}/{totalDays}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right column — category rates + goals */}
          <div className="space-y-6">

            {/* Category breakdown */}
            <div className="sa-card-elevated">
              <p className="sa-section-subtitle text-sa-cream-muted mb-4">Category Rates</p>
              <div className="space-y-4">
                {[
                  { label: 'Non-Negotiables', rate: weekStats.nnRate },
                  { label: 'Keystone Habits', rate: weekStats.habitRate },
                  { label: 'Tasks', rate: weekStats.taskRate },
                ].map(({ label, rate }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-sa-cream-soft">{label}</span>
                      <span className={`text-xs font-medium ${rateColor(rate)}`}>{rate}%</span>
                    </div>
                    <div className="sa-progress-track">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${rate}%`, background: rateBarColor(rate) }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goal progress */}
            {goals.filter(g => !g.completed).length > 0 && (
              <div className="sa-card-elevated">
                <p className="sa-section-subtitle text-sa-green mb-4">Goal Progress</p>
                <div className="space-y-4">
                  {goals.filter(g => !g.completed).map((goal) => {
                    const progress = goal.target_amount > 0
                      ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
                      : 0;
                    return (
                      <div key={goal.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-sa-cream">{goal.title}</span>
                          <span className="text-xs text-sa-cream-muted">{progress}%</span>
                        </div>
                        <div className="sa-progress-track">
                          <div className="sa-progress-fill-green" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ WEEKLY REVIEW TAB ════════ */}
      {activeTab === 'weekly' && (
        <div className="space-y-6 animate-rise delay-2">

          {/* Left: form */}
          <div className="space-y-6">
            <div className="space-y-6">
              {WEEKLY_QUESTIONS.map((question, i) => (
                <div key={i}>
                  <label className="block text-sm text-sa-cream-soft mb-2">
                    <span className="text-sa-gold font-medium">{i + 1}.</span> {question}
                  </label>
                  <textarea value={weeklyAnswers[`q${i}`] || ''}
                    onChange={(e) => setWeeklyAnswers(prev => ({ ...prev, [`q${i}`]: e.target.value }))}
                    placeholder="Write your reflection..." rows={3} className="sa-textarea" />
                </div>
              ))}
            </div>
            <button onClick={handleSaveWeeklyReview}
              disabled={!Object.values(weeklyAnswers).some(a => a.trim())}
              className="sa-btn-primary w-full disabled:opacity-30">
              Save Weekly Review
            </button>
          </div>

          {/* Right: live stats */}
          <div className="space-y-5">
            <div className="sa-card-elevated">
              <p className="sa-section-subtitle text-sa-gold mb-4">This Week's Data</p>
              <div className="space-y-4">
                {[
                  { label: 'Non-Negotiables', value: `${weekStats.nnRate}%`, color: rateColor(weekStats.nnRate) },
                  { label: 'Habits', value: `${weekStats.habitRate}%`, color: rateColor(weekStats.habitRate) },
                  { label: 'Tasks', value: `${weekStats.taskRate}%`, color: rateColor(weekStats.taskRate) },
                  { label: 'Overall', value: `${weekStats.weekPercentage}%`, color: rateColor(weekStats.weekPercentage) },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-sa-cream-muted">{label}</span>
                    <span className={`text-lg font-light ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {weekStats.streak > 0 && (
              <div className="sa-card text-center">
                <p className="text-2xl font-light text-sa-gold">{weekStats.streak}</p>
                <p className="text-xs text-sa-cream-faint mt-1">Day streak</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ QUARTERLY RECALIBRATION TAB ════════ */}
      {activeTab === 'quarterly' && (
        <div className="space-y-6 animate-rise delay-2">

          {/* Step 0 — Overview */}
          {recalStep === 0 && (
            <div className="space-y-6">
              <div className="sa-card">
                <div className="flex items-center gap-3 mb-3">
                  <RotateCcw className="w-5 h-5 text-sa-gold" />
                  <h3 className="font-serif text-lg text-sa-cream">Quarterly Recalibration</h3>
                </div>
                <p className="text-sm text-sa-cream-soft leading-relaxed mb-4">
                  Every quarter, your system needs a structural review. Not a reflection — a reconfiguration.
                  You'll walk through your direction, non-negotiables, habits, priorities, and identity. Update what's evolved. Remove what's stale. Realign what's drifted.
                </p>
                <p className="text-sm text-sa-cream-soft leading-relaxed">
                  This takes 20-30 minutes. Don't rush it.
                </p>
              </div>

              {lastRecalibration && (
                <div className="sa-card">
                  <p className="text-xs text-sa-cream-faint">Last recalibration</p>
                  <p className="text-sm text-sa-cream-muted mt-1">
                    {new Date(lastRecalibration).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}

              <button onClick={() => setRecalStep(1)} className="sa-btn-primary w-full">
                Begin Recalibration
              </button>
            </div>
          )}

          {/* Step 1 — Direction Check */}
          {recalStep === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-gold mb-2">Step 1 of 5</p>
                <h3 className="font-serif text-xl text-sa-cream mb-2">Direction Check</h3>
                <p className="text-sm text-sa-cream-muted leading-relaxed">
                  Is your operating direction still accurate? Three months of execution changes what you know, what you want, and what's possible. Update it if it's evolved.
                </p>
              </div>

              <div>
                <label className="sa-label">Your Direction Statement</label>
                <textarea
                  value={recalData.direction}
                  onChange={(e) => setRecalData(prev => ({ ...prev, direction: e.target.value }))}
                  placeholder="What you are building and why. Your north star."
                  rows={5}
                  className="sa-textarea"
                />
                {recalData.direction && (
                  <p className="text-xs text-sa-cream-faint mt-2 italic">Edit above if your direction has shifted. Leave as-is if it's still valid.</p>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setRecalStep(0)} className="sa-btn-ghost flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button onClick={() => setRecalStep(2)} className="sa-btn-primary flex-1 flex items-center justify-center gap-2">
                  Next: Non-Negotiables <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Non-Negotiables Audit */}
          {recalStep === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-gold mb-2">Step 2 of 5</p>
                <h3 className="font-serif text-xl text-sa-cream mb-2">Non-Negotiables Audit</h3>
                <p className="text-sm text-sa-cream-muted leading-relaxed">
                  Non-negotiables are the daily commitments you never skip. Review each one — are they still the right foundation? Remove what no longer serves your direction. Add what's missing.
                </p>
              </div>

              {nonNegotiables.filter(nn => nn.active).length > 0 ? (
                <div className="space-y-3">
                  {nonNegotiables.filter(nn => nn.active).map(nn => {
                    const action = recalData.nnActions[nn.id] || 'keep';
                    return (
                      <div key={nn.id} className="sa-card flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-sa-cream">{nn.title}</p>
                          {nn.description && <p className="text-xs text-sa-cream-faint">{nn.description}</p>}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => setRecalData(prev => ({
                              ...prev,
                              nnActions: { ...prev.nnActions, [nn.id]: 'keep' },
                            }))}
                            className={`px-3 py-1.5 text-xs rounded-sa-sm transition-colors ${
                              action === 'keep' ? 'bg-sa-green-soft text-sa-green border border-sa-green-border' : 'text-sa-cream-faint hover:text-sa-cream-muted'
                            }`}
                          >
                            Keep
                          </button>
                          <button
                            onClick={() => setRecalData(prev => ({
                              ...prev,
                              nnActions: { ...prev.nnActions, [nn.id]: 'remove' },
                            }))}
                            className={`px-3 py-1.5 text-xs rounded-sa-sm transition-colors ${
                              action === 'remove' ? 'bg-sa-rose-soft text-sa-rose border border-sa-rose-border' : 'text-sa-cream-faint hover:text-sa-cream-muted'
                            }`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="sa-card text-center">
                  <p className="text-sm text-sa-cream-faint">No active non-negotiables configured.</p>
                </div>
              )}

              <div>
                <label className="sa-label">New non-negotiables to add</label>
                <textarea
                  value={recalData.newNNs}
                  onChange={(e) => setRecalData(prev => ({ ...prev, newNNs: e.target.value }))}
                  placeholder="List any new non-negotiables for next quarter (one per line)..."
                  rows={3}
                  className="sa-textarea"
                />
                <p className="text-xs text-sa-cream-faint mt-1.5">Add these in the System tab after completing the recalibration.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setRecalStep(1)} className="sa-btn-ghost flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button onClick={() => setRecalStep(3)} className="sa-btn-primary flex-1 flex items-center justify-center gap-2">
                  Next: Habit Audit <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Habit Audit */}
          {recalStep === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-gold mb-2">Step 3 of 5</p>
                <h3 className="font-serif text-xl text-sa-cream mb-2">Habit Audit</h3>
                <p className="text-sm text-sa-cream-muted leading-relaxed">
                  Review each habit. Some are now automatic — keep them. Some have gone stale or no longer serve your direction — mark them for rotation.
                </p>
              </div>

              {habits.length > 0 ? (
                <div className="space-y-3">
                  {habits.map(habit => {
                    const action = recalData.habitActions[habit.id] || 'keep';
                    return (
                      <div key={habit.id} className="sa-card flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-sa-cream">{habit.name}</p>
                          {habit.description && <p className="text-xs text-sa-cream-faint">{habit.description}</p>}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => setRecalData(prev => ({
                              ...prev,
                              habitActions: { ...prev.habitActions, [habit.id]: 'keep' },
                            }))}
                            className={`px-3 py-1.5 text-xs rounded-sa-sm transition-colors ${
                              action === 'keep' ? 'bg-sa-green-soft text-sa-green border border-sa-green-border' : 'text-sa-cream-faint hover:text-sa-cream-muted'
                            }`}
                          >
                            Keep
                          </button>
                          <button
                            onClick={() => setRecalData(prev => ({
                              ...prev,
                              habitActions: { ...prev.habitActions, [habit.id]: 'rotate' },
                            }))}
                            className={`px-3 py-1.5 text-xs rounded-sa-sm transition-colors ${
                              action === 'rotate' ? 'bg-sa-rose-soft text-sa-rose border border-sa-rose-border' : 'text-sa-cream-faint hover:text-sa-cream-muted'
                            }`}
                          >
                            Rotate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="sa-card text-center">
                  <p className="text-sm text-sa-cream-faint">No habits configured yet.</p>
                </div>
              )}

              <div>
                <label className="sa-label">New habits to install</label>
                <textarea
                  value={recalData.newHabits}
                  onChange={(e) => setRecalData(prev => ({ ...prev, newHabits: e.target.value }))}
                  placeholder="List any new habits for next quarter (one per line)..."
                  rows={3}
                  className="sa-textarea"
                />
                <p className="text-xs text-sa-cream-faint mt-1.5">Add these in the System tab after completing the recalibration.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setRecalStep(2)} className="sa-btn-ghost flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button onClick={() => setRecalStep(4)} className="sa-btn-primary flex-1 flex items-center justify-center gap-2">
                  Next: Priorities <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Priority Realignment */}
          {recalStep === 4 && (
            <div className="space-y-6">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-gold mb-2">Step 4 of 5</p>
                <h3 className="font-serif text-xl text-sa-cream mb-2">Priority Realignment</h3>
                <p className="text-sm text-sa-cream-muted leading-relaxed">
                  Your priorities determine what gets your best energy and what gets cut when time runs short. Review and update your stack to match where you are now, not where you were 3 months ago.
                </p>
              </div>

              <div>
                <label className="sa-label">Your Priority Stack</label>
                <textarea
                  value={recalData.priorities}
                  onChange={(e) => setRecalData(prev => ({ ...prev, priorities: e.target.value }))}
                  placeholder="Your ranked priorities. What gets protected first."
                  rows={6}
                  className="sa-textarea"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setRecalStep(3)} className="sa-btn-ghost flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button onClick={() => setRecalStep(5)} className="sa-btn-primary flex-1 flex items-center justify-center gap-2">
                  Next: Identity & Focus <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5 — Identity & Quarterly Focus */}
          {recalStep === 5 && (
            <div className="space-y-6">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-gold mb-2">Step 5 of 5</p>
                <h3 className="font-serif text-xl text-sa-cream mb-2">Identity & Quarterly Focus</h3>
                <p className="text-sm text-sa-cream-muted leading-relaxed">
                  Your identity statement defines who you are becoming. Update it to match who you've become through execution. Then set one clear focus for the next quarter.
                </p>
              </div>

              <div>
                <label className="sa-label">Your Identity Statement</label>
                <textarea
                  value={recalData.identity}
                  onChange={(e) => setRecalData(prev => ({ ...prev, identity: e.target.value }))}
                  placeholder='"I am the kind of person who…"'
                  rows={4}
                  className="sa-textarea"
                />
              </div>

              <div>
                <label className="sa-label">Quarterly Focus</label>
                <textarea
                  value={recalData.focusNextQuarter}
                  onChange={(e) => setRecalData(prev => ({ ...prev, focusNextQuarter: e.target.value }))}
                  placeholder="The single highest-leverage focus for the next 3 months..."
                  rows={3}
                  className="sa-textarea"
                />
                <p className="text-xs text-sa-cream-faint mt-1.5">This will be saved to your system documents for reference.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setRecalStep(4)} className="sa-btn-ghost flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={() => {
                    // Save updated documents via hook
                    if (onUpdateSystemDocument) {
                      if (recalData.direction) onUpdateSystemDocument('direction', recalData.direction);
                      if (recalData.identity) onUpdateSystemDocument('identity', recalData.identity);
                      if (recalData.priorities) onUpdateSystemDocument('priorities', recalData.priorities);
                      if (recalData.focusNextQuarter) onUpdateSystemDocument('quarterly_focus', recalData.focusNextQuarter);
                    }

                    // Save pending NN/habit changes for action items
                    const nnToRemove = Object.entries(recalData.nnActions).filter(([, a]) => a === 'remove').map(([id]) => id);
                    const habitsToRotate = Object.entries(recalData.habitActions).filter(([, a]) => a === 'rotate').map(([id]) => id);
                    if (nnToRemove.length > 0 || habitsToRotate.length > 0 || recalData.newNNs || recalData.newHabits) {
                      localStorage.setItem('sa_recal_pending', JSON.stringify({
                        nnToRemove,
                        habitsToRotate,
                        newNNs: recalData.newNNs,
                        newHabits: recalData.newHabits,
                      }));
                    }

                    // Save as a quarterly review
                    const nnNames = nonNegotiables.filter(nn => nn.active);
                    const review: SavedReview = {
                      id: uid(),
                      type: 'quarterly',
                      date: new Date().toISOString(),
                      answers: {
                        direction: recalData.direction,
                        identity: recalData.identity,
                        priorities: recalData.priorities,
                        quarterlyFocus: recalData.focusNextQuarter,
                        nnKept: nnNames.filter(nn => recalData.nnActions[nn.id] !== 'remove').map(nn => nn.title).join(', '),
                        nnRemoved: nnNames.filter(nn => recalData.nnActions[nn.id] === 'remove').map(nn => nn.title).join(', '),
                        newNNs: recalData.newNNs,
                        habitsKept: habits.filter(h => recalData.habitActions[h.id] !== 'rotate').map(h => h.name).join(', '),
                        habitsRotated: habits.filter(h => recalData.habitActions[h.id] === 'rotate').map(h => h.name).join(', '),
                        newHabits: recalData.newHabits,
                      },
                    };
                    const updated = [review, ...savedReviews];
                    setSavedReviews(updated);
                    localStorage.setItem('sa_reviews', JSON.stringify(updated));

                    setRecalStep(6);
                  }}
                  className="sa-btn-primary flex-1"
                >
                  Complete Recalibration
                </button>
              </div>
            </div>
          )}

          {/* Step 6 — Complete */}
          {recalStep === 6 && (() => {
            const nnRemoved = Object.values(recalData.nnActions).filter(a => a === 'remove').length;
            const habitsRotated = Object.values(recalData.habitActions).filter(a => a === 'rotate').length;
            const hasNewNNs = recalData.newNNs.trim().length > 0;
            const hasNewHabits = recalData.newHabits.trim().length > 0;
            const hasActionItems = nnRemoved > 0 || habitsRotated > 0 || hasNewNNs || hasNewHabits;

            return (
              <div className="py-8 space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-sa-green-soft border border-sa-green-border flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 text-sa-green" />
                  </div>
                  <h3 className="font-serif text-xl text-sa-cream">System Recalibrated</h3>
                  <p className="text-sm text-sa-cream-muted max-w-sm mx-auto leading-relaxed">
                    Your direction, priorities, identity, and quarterly focus have been saved to your system documents.
                  </p>
                </div>

                {hasActionItems && (
                  <div className="sa-card-elevated">
                    <p className="sa-section-subtitle text-sa-gold mb-3">Action Items — System Tab</p>
                    <p className="text-xs text-sa-cream-faint mb-4">Complete these in the System tab to finalize your recalibration:</p>
                    <div className="space-y-2">
                      {nnRemoved > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-sa-rose text-xs mt-0.5">●</span>
                          <p className="text-xs text-sa-cream-soft">Remove {nnRemoved} non-negotiable{nnRemoved > 1 ? 's' : ''} marked for removal</p>
                        </div>
                      )}
                      {hasNewNNs && (
                        <div className="flex items-start gap-2">
                          <span className="text-sa-green text-xs mt-0.5">●</span>
                          <p className="text-xs text-sa-cream-soft">Add new non-negotiables: {recalData.newNNs}</p>
                        </div>
                      )}
                      {habitsRotated > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-sa-rose text-xs mt-0.5">●</span>
                          <p className="text-xs text-sa-cream-soft">Rotate {habitsRotated} habit{habitsRotated > 1 ? 's' : ''} marked for rotation</p>
                        </div>
                      )}
                      {hasNewHabits && (
                        <div className="flex items-start gap-2">
                          <span className="text-sa-green text-xs mt-0.5">●</span>
                          <p className="text-xs text-sa-cream-soft">Install new habits: {recalData.newHabits}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { setRecalStep(0); setActiveTab('snapshot'); }}
                  className="sa-btn-secondary w-full"
                >
                  Back to Snapshot
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Past Reviews ── */}
      {savedReviews.length > 0 && (
        <div className="mt-10 animate-rise delay-3">
          <button
            onClick={() => setShowPastReviews(!showPastReviews)}
            className="flex items-center gap-2 text-xs text-sa-cream-faint hover:text-sa-cream-muted transition-colors"
          >
            {showPastReviews ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Past Reviews ({savedReviews.length})
          </button>

          {showPastReviews && (
            <div className="mt-4 space-y-3">
              {savedReviews.slice(0, 20).map((review) => {
                const REVIEW_LABELS: Record<string, string> = {
                  direction: 'Direction',
                  identity: 'Identity',
                  priorities: 'Priorities',
                  quarterlyFocus: 'Quarterly Focus',
                  nnKept: 'NNs Kept',
                  nnRemoved: 'NNs Removed',
                  newNNs: 'New NNs',
                  habitsKept: 'Habits Kept',
                  habitsRotated: 'Habits Rotated',
                  newHabits: 'New Habits',
                };

                return (
                  <details key={review.id} className="sa-card group">
                    <summary className="cursor-pointer list-none flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`sa-badge ${review.type === 'weekly' ? 'sa-badge-gold' : review.type === 'quarterly' ? 'sa-badge-green' : 'sa-badge-muted'}`}>
                          {review.type === 'weekly' ? 'Weekly' : review.type === 'quarterly' ? 'Quarterly' : 'Monthly'}
                        </span>
                        <span className="text-xs text-sa-cream-faint">
                          {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-sa-cream-faint transition-transform group-open:rotate-180" />
                    </summary>

                    <div className="mt-4 pt-4 border-t border-sa-border space-y-3">
                      {review.stats && (
                        <div className="flex gap-4 text-xs text-sa-cream-muted">
                          <span>System: {review.stats.overall}%</span>
                          <span>NN: {review.stats.nnRate}%</span>
                          <span>Habits: {review.stats.habitRate}%</span>
                          <span>Tasks: {review.stats.taskRate}%</span>
                        </div>
                      )}

                      {review.type === 'weekly' && (
                        <div className="space-y-3">
                          {WEEKLY_QUESTIONS.map((question, i) => {
                            const answer = review.answers[`q${i}`];
                            if (!answer?.trim()) return null;
                            return (
                              <div key={i}>
                                <p className="text-xs text-sa-cream-faint mb-1">{question}</p>
                                <p className="text-xs text-sa-cream-soft leading-relaxed">{answer}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {review.type === 'quarterly' && (
                        <div className="space-y-3">
                          {Object.entries(review.answers).map(([key, val]) => {
                            if (!val?.trim()) return null;
                            const label = REVIEW_LABELS[key] || key;
                            return (
                              <div key={key}>
                                <p className="text-xs text-sa-cream-faint mb-1">{label}</p>
                                <p className="text-xs text-sa-cream-soft leading-relaxed">{val}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {review.type === 'monthly' && (
                        <div className="space-y-3">
                          {Object.entries(review.answers).map(([key, val]) => {
                            if (!val?.trim()) return null;
                            return (
                              <div key={key}>
                                <p className="text-xs text-sa-cream-soft leading-relaxed">{val}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
