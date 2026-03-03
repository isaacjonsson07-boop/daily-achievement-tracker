// ============================================
// STRUCTURED ACHIEVEMENT — Scoring Engine
// ============================================
// Calculates monthly System Report scores from tracker data.
// Score = weighted average: Habits 40%, Tasks 35%, Non-Negotiables 25%
// Minimums: 3 habits, 3 tasks/day avg, 2 NNs — below = capped at 75

import { ReportTier, SystemReport } from '../types';
import type { NonNegotiable, NonNegotiableCompletion, Habit, HabitCompletion, DailyTask } from '../types';
import { uid } from './dateUtils';

// ── Tier logic ──

export function getTier(score: number): ReportTier {
  if (score >= 100) return 'gold-perfect';
  if (score >= 75) return 'gold';
  if (score >= 50) return 'silver';
  return 'bronze';
}

export const TIER_CONFIG: Record<ReportTier, { label: string; color: string; border: string; bg: string }> = {
  'gold-perfect': {
    label: 'Perfect',
    color: '#C5A55A',
    border: 'rgba(197, 165, 90, 0.6)',
    bg: 'rgba(197, 165, 90, 0.08)',
  },
  gold: {
    label: 'Gold',
    color: '#C5A55A',
    border: 'rgba(197, 165, 90, 0.35)',
    bg: 'rgba(197, 165, 90, 0.05)',
  },
  silver: {
    label: 'Silver',
    color: '#A8A8B0',
    border: 'rgba(168, 168, 176, 0.35)',
    bg: 'rgba(168, 168, 176, 0.05)',
  },
  bronze: {
    label: 'Bronze',
    color: '#B87333',
    border: 'rgba(184, 115, 51, 0.35)',
    bg: 'rgba(184, 115, 51, 0.05)',
  },
};

// ── Minimum thresholds ──

const MIN_HABITS = 3;
const MIN_TASKS_PER_DAY = 3;
const MIN_NON_NEGOTIABLES = 2;
const CAPPED_SCORE = 75;

// ── Weights ──

const WEIGHT_HABITS = 0.40;
const WEIGHT_TASKS = 0.35;
const WEIGHT_NN = 0.25;

// ── Helper: get all dates in a month ──

function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${d}`);
    date.setDate(date.getDate() + 1);
  }
  return days;
}

// ── Streak calculator ──

function calculateStreak(completedDates: Set<string>, allDates: string[]): number {
  let longest = 0;
  let current = 0;
  for (const date of allDates) {
    if (completedDates.has(date)) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}

// ── Main: generate a monthly report ──

export function generateMonthlyReport(
  month: string, // YYYY-MM
  nonNegotiables: NonNegotiable[],
  nnCompletions: NonNegotiableCompletion[],
  habits: Habit[],
  habitCompletions: HabitCompletion[],
  dailyTasks: DailyTask[],
  previousReport?: SystemReport | null,
  userId?: string,
): SystemReport {
  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr);
  const monthIndex = parseInt(monthStr) - 1;
  const allDays = getDaysInMonth(year, monthIndex);
  
  // Only count days up to today if current month
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;
  const activeDays = isCurrentMonth
    ? allDays.filter(d => d <= `${year}-${monthStr}-${String(today.getDate()).padStart(2, '0')}`)
    : allDays;

  // ── Non-Negotiables ──
  const activeNNs = nonNegotiables.filter(nn => nn.active);
  const nnCount = activeNNs.length;

  let nnScore = 0;
  if (nnCount > 0 && activeDays.length > 0) {
    let totalPossible = 0;
    let totalCompleted = 0;
    for (const date of activeDays) {
      const nnsForDay = activeNNs.filter(nn => {
        const created = nn.created_at.split('T')[0];
        return created <= date;
      });
      totalPossible += nnsForDay.length;
      totalCompleted += nnsForDay.filter(nn =>
        nnCompletions.some(c => c.non_negotiable_id === nn.id && c.completion_date === date)
      ).length;
    }
    nnScore = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  }

  // ── Habits ──
  const habitsCount = habits.length;

  let habitsScore = 0;
  if (habitsCount > 0 && activeDays.length > 0) {
    let totalPossible = 0;
    let totalCompleted = 0;
    for (const date of activeDays) {
      const d = new Date(date + 'T00:00:00');
      const dayIndex = d.getDay();
      const habitsForDay = habits.filter(h => {
        const created = h.created_at.split('T')[0];
        return created <= date && h.days_of_week.includes(dayIndex);
      });
      totalPossible += habitsForDay.length;
      totalCompleted += habitsForDay.filter(h =>
        habitCompletions.some(c => c.habit_id === h.id && c.completion_date === date)
      ).length;
    }
    habitsScore = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  }

  // ── Tasks ──
  const monthTasks = dailyTasks.filter(t => t.task_date.startsWith(month));
  const completedTasks = monthTasks.filter(t => t.completed);
  const totalTasksCompleted = completedTasks.length;

  const tasksAvgPerDay = activeDays.length > 0
    ? Math.round((monthTasks.length / activeDays.length) * 10) / 10
    : 0;

  const tasksScore = monthTasks.length > 0
    ? Math.round((completedTasks.length / monthTasks.length) * 100)
    : 0;

  // ── Minimums check ──
  const meetsMinimums =
    habitsCount >= MIN_HABITS &&
    tasksAvgPerDay >= MIN_TASKS_PER_DAY &&
    nnCount >= MIN_NON_NEGOTIABLES;

  // ── Weighted score ──
  let rawScore = Math.round(
    habitsScore * WEIGHT_HABITS +
    tasksScore * WEIGHT_TASKS +
    nnScore * WEIGHT_NN
  );

  // Cap at 75 if minimums not met
  const scoreCapped = !meetsMinimums && rawScore > CAPPED_SCORE;
  const score = scoreCapped ? CAPPED_SCORE : Math.min(rawScore, 100);

  // ── Days active (had at least one completion) ──
  const activeDateSet = new Set<string>();
  nnCompletions.forEach(c => {
    if (c.completion_date.startsWith(month)) activeDateSet.add(c.completion_date);
  });
  habitCompletions.forEach(c => {
    if (c.completion_date.startsWith(month)) activeDateSet.add(c.completion_date);
  });
  completedTasks.forEach(t => {
    if (t.task_date.startsWith(month)) activeDateSet.add(t.task_date);
  });
  const totalDaysActive = activeDateSet.size;

  // ── Longest streak ──
  const longestStreak = calculateStreak(activeDateSet, activeDays);

  // ── Personal highlight ──
  const personalHighlight = generateHighlight(
    habitsScore, habitsCount, habits, habitCompletions, month,
    tasksScore, totalTasksCompleted,
    nnScore, nnCount, nonNegotiables, nnCompletions,
    longestStreak, totalDaysActive, activeDays.length,
  );

  // ── Score delta ──
  const scoreDelta = previousReport ? score - previousReport.score : undefined;

  const tier = getTier(score);

  return {
    id: uid(),
    user_id: userId || 'local',
    month,
    score,
    tier,
    meetsMinimums,
    scoreCapped,
    habitsScore,
    habitsCount,
    tasksScore,
    tasksAvgPerDay,
    nnScore,
    nnCount,
    totalTasksCompleted,
    totalDaysActive,
    longestStreak,
    personalHighlight,
    scoreDelta,
    created_at: new Date().toISOString(),
  };
}

// ── Highlight generator ──

function generateHighlight(
  habitsScore: number, habitsCount: number, habits: Habit[], habitCompletions: HabitCompletion[], month: string,
  tasksScore: number, totalTasksCompleted: number,
  nnScore: number, nnCount: number, nonNegotiables: NonNegotiable[], nnCompletions: NonNegotiableCompletion[],
  longestStreak: number, totalDaysActive: number, totalDays: number,
): string {
  const highlights: { text: string; priority: number }[] = [];

  // Perfect score
  if (habitsScore === 100 && tasksScore === 100 && nnScore === 100) {
    highlights.push({ text: 'Perfect execution across every category. Full operational capacity.', priority: 10 });
  }

  // Perfect NN
  if (nnScore === 100 && nnCount >= 2) {
    highlights.push({ text: `Every non-negotiable completed, every single day. ${nnCount} commitments, zero misses.`, priority: 8 });
  }

  // Long streak
  if (longestStreak >= 20) {
    highlights.push({ text: `${longestStreak}-day execution streak. Nearly the entire month without a gap.`, priority: 7 });
  } else if (longestStreak >= 14) {
    highlights.push({ text: `${longestStreak}-day execution streak. Two weeks of unbroken consistency.`, priority: 6 });
  }

  // Most consistent habit
  if (habitsCount > 0) {
    const habitStats = habits.map(h => {
      const completions = habitCompletions.filter(c =>
        c.habit_id === h.id && c.completion_date.startsWith(month)
      ).length;
      return { name: h.name, completions };
    }).sort((a, b) => b.completions - a.completions);

    if (habitStats[0] && habitStats[0].completions > 0) {
      highlights.push({
        text: `Most consistent habit: ${habitStats[0].name} — completed ${habitStats[0].completions} times this month.`,
        priority: 5,
      });
    }
  }

  // High task volume
  if (totalTasksCompleted >= 60) {
    highlights.push({ text: `${totalTasksCompleted} tasks completed this month. Consistent, high-volume execution.`, priority: 5 });
  } else if (totalTasksCompleted >= 30) {
    highlights.push({ text: `${totalTasksCompleted} tasks completed. Steady operational output.`, priority: 4 });
  }

  // Active days
  if (totalDaysActive === totalDays) {
    highlights.push({ text: `Active every single day of the month. No days off.`, priority: 6 });
  } else if (totalDaysActive >= totalDays * 0.9) {
    highlights.push({ text: `Active ${totalDaysActive} of ${totalDays} days. Over 90% presence.`, priority: 4 });
  }

  // Sort by priority and return the top one
  highlights.sort((a, b) => b.priority - a.priority);
  return highlights[0]?.text || `${totalDaysActive} days active. System operational.`;
}
