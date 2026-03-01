import React, { useState, useMemo } from 'react';
import { BarChart3, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { NonNegotiable, NonNegotiableCompletion, Habit, HabitCompletion, DailyTask, Goal } from '../types';
import { fmtDateISO, uid } from '../utils/dateUtils';

interface ReviewsViewProps {
  nonNegotiables: NonNegotiable[];
  nnCompletions: NonNegotiableCompletion[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  dailyTasks: DailyTask[];
  goals: Goal[];
}

interface SavedReview {
  id: string;
  type: 'weekly' | 'monthly';
  date: string;
  answers: Record<string, string>;
  stats?: { nnRate: number; habitRate: number; taskRate: number; overall: number };
}

const WEEKLY_QUESTIONS = [
  'What worked well this week? Where did you stay consistent?',
  'Where did you lose focus or drift? What was the cause?',
  'What one adjustment will you make to your system next week?',
  'What is your single focus for the coming week?',
];

const MONTHLY_QUESTIONS = [
  'Is your direction statement still valid? If not, how has it shifted?',
  'On a scale of 1–10, how aligned are your daily actions with your identity statement?',
  'Have your priorities changed? What needs to move up or down the stack?',
  'What was your biggest win this month?',
  'What was your biggest challenge, and what did it teach you?',
  'What is your primary focus for next month?',
];

export function ReviewsView({
  nonNegotiables,
  nnCompletions,
  habits,
  habitCompletions,
  dailyTasks,
  goals,
}: ReviewsViewProps) {
  const [activeTab, setActiveTab] = useState<'snapshot' | 'weekly' | 'monthly'>('snapshot');
  const [weeklyAnswers, setWeeklyAnswers] = useState<Record<string, string>>({});
  const [monthlyAnswers, setMonthlyAnswers] = useState<Record<string, string>>({});
  const [savedReviews, setSavedReviews] = useState<SavedReview[]>(() => {
    try {
      const raw = localStorage.getItem('sa_reviews');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [showPastReviews, setShowPastReviews] = useState(false);

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
  const handleSaveReview = (type: 'weekly' | 'monthly') => {
    const answers = type === 'weekly' ? weeklyAnswers : monthlyAnswers;
    const hasContent = Object.values(answers).some(a => a.trim());
    if (!hasContent) return;

    const review: SavedReview = {
      id: uid(),
      type,
      date: new Date().toISOString(),
      answers: { ...answers },
      stats: type === 'weekly' ? {
        nnRate: weekStats.nnRate,
        habitRate: weekStats.habitRate,
        taskRate: weekStats.taskRate,
        overall: weekStats.weekPercentage,
      } : undefined,
    };

    const updated = [review, ...savedReviews];
    setSavedReviews(updated);
    localStorage.setItem('sa_reviews', JSON.stringify(updated));

    if (type === 'weekly') setWeeklyAnswers({});
    else setMonthlyAnswers({});
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

      {/* Header */}
      <div className="mb-8 animate-rise">
        <h1 className="font-serif text-2xl sm:text-3xl text-sa-cream">Reviews</h1>
        <p className="text-sm text-sa-cream-muted mt-2">
          Review your system performance and recalibrate.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 animate-rise delay-1">
        <TabBtn id="snapshot" label="Snapshot" />
        <TabBtn id="weekly" label="Weekly Review" />
        <TabBtn id="monthly" label="Monthly Recalibration" />
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
            <button onClick={() => handleSaveReview('weekly')}
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

      {/* ════════ MONTHLY RECALIBRATION TAB ════════ */}
      {activeTab === 'monthly' && (
        <div className="space-y-6 animate-rise delay-2">

          {/* Left: form */}
          <div className="space-y-6">
            <div className="sa-card">
              <p className="text-sm text-sa-cream-soft">
                The monthly recalibration is a deeper review. Revisit your direction, identity, and priorities.
                Update your system documents after completing this review.
              </p>
            </div>
            <div className="space-y-6">
              {MONTHLY_QUESTIONS.map((question, i) => (
                <div key={i}>
                  <label className="block text-sm text-sa-cream-soft mb-2">
                    <span className="text-sa-gold font-medium">{i + 1}.</span> {question}
                  </label>
                  <textarea value={monthlyAnswers[`q${i}`] || ''}
                    onChange={(e) => setMonthlyAnswers(prev => ({ ...prev, [`q${i}`]: e.target.value }))}
                    placeholder="Write your reflection..." rows={3} className="sa-textarea" />
                </div>
              ))}
            </div>
            <button onClick={() => handleSaveReview('monthly')}
              disabled={!Object.values(monthlyAnswers).some(a => a.trim())}
              className="sa-btn-primary w-full disabled:opacity-30">
              Save Monthly Recalibration
            </button>
          </div>

          {/* Right: system doc previews */}
          <div className="space-y-5">
            <div className="sa-card-elevated">
              <p className="sa-section-subtitle text-sa-gold mb-3">Your System Documents</p>
              <p className="text-xs text-sa-cream-faint mb-4">Review these while recalibrating:</p>
              <div className="space-y-3">
                {(() => {
                  try {
                    const docs = JSON.parse(localStorage.getItem('sa_system_documents') || '{}');
                    const docTypes = [
                      { key: 'direction', label: 'Direction Statement' },
                      { key: 'identity', label: 'Identity Statement' },
                      { key: 'priorities', label: 'Priority Stack' },
                      { key: 'decisions', label: 'Decision Framework' },
                      { key: 'failure', label: 'Failure Protocol' },
                      { key: 'manual', label: 'Operating Manual' },
                    ];
                    return docTypes.map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${docs[key]?.trim() ? 'bg-sa-green' : 'bg-sa-cream-faint'}`} />
                        <span className="text-xs text-sa-cream-muted">{label}</span>
                      </div>
                    ));
                  } catch { return null; }
                })()}
              </div>
            </div>
          </div>
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
              {savedReviews.slice(0, 10).map((review) => (
                <div key={review.id} className="sa-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`sa-badge ${review.type === 'weekly' ? 'sa-badge-gold' : 'sa-badge-muted'}`}>
                      {review.type === 'weekly' ? 'Weekly' : 'Monthly'}
                    </span>
                    <span className="text-xs text-sa-cream-faint">
                      {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {review.stats && (
                    <p className="text-xs text-sa-cream-muted mb-2">
                      System: {review.stats.overall}% · NN: {review.stats.nnRate}% · Habits: {review.stats.habitRate}%
                    </p>
                  )}
                  {Object.entries(review.answers).slice(0, 2).map(([key, val]) => (
                    val.trim() && (
                      <p key={key} className="text-xs text-sa-cream-soft line-clamp-2 mb-1">
                        {val}
                      </p>
                    )
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
