export const formatCountdown = (targetDate: string): string => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs < 0) {
    const absDiffMs = Math.abs(diffMs);
    const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
    const minutes = Math.floor(absDiffMs / (1000 * 60));

    if (days >= 1) {
      return `Overdue by ${days} day${days === 1 ? '' : 's'}`;
    } else if (hours >= 1) {
      return `Overdue by ${hours} hour${hours === 1 ? '' : 's'}`;
    } else {
      return `Overdue by ${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (days >= 1) {
    return `${days} day${days === 1 ? '' : 's'} left`;
  } else if (hours >= 1) {
    return `${hours} hour${hours === 1 ? '' : 's'} left`;
  } else {
    return `${minutes} minute${minutes === 1 ? '' : 's'} left`;
  }
};

export const calculateTargetDateFromDuration = (
  days: number,
  weeks: number,
  months: number
): string => {
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setMonth(targetDate.getMonth() + months);
  targetDate.setDate(targetDate.getDate() + days + weeks * 7);
  return targetDate.toISOString().split('T')[0];
};

export const formatTargetDatePreview = (
  days: number,
  weeks: number,
  months: number
): string | null => {
  if (!Number.isFinite(days) || !Number.isFinite(weeks) || !Number.isFinite(months)) return null;
  if (days === 0 && weeks === 0 && months === 0) return null;
  try {
    const dateStr = calculateTargetDateFromDuration(days, weeks, months);
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return null;
  }
};

export const isOverdue = (targetDate: string): boolean => {
  return new Date(targetDate) < new Date();
};

export const getScheduledDatesBetween = (
  startDate: string,
  endDate: string,
  daysOfWeek: number[]
): string[] => {
  if (!daysOfWeek || daysOfWeek.length === 0) return [];
  const results: string[] = [];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const cursor = new Date(start);
  while (cursor <= end) {
    if (daysOfWeek.includes(cursor.getDay())) {
      results.push(cursor.toISOString().split('T')[0]);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
};

export const calculateScheduleAwareStreak = (
  completionDates: string[],
  daysOfWeek: number[]
): { current: number; best: number } => {
  if (!daysOfWeek || daysOfWeek.length === 0) {
    return { current: 0, best: 0 };
  }

  const completedSet = new Set(completionDates);
  if (completedSet.size === 0) return { current: 0, best: 0 };

  const allDates = [...completedSet].sort();
  const earliest = allDates[0];
  const latest = allDates[allDates.length - 1];

  // Use the latest completion date or today, whichever is later, to ensure we check up to today
  const todayStr = new Date().toISOString().split('T')[0];
  const endDate = latest > todayStr ? latest : todayStr;

  const scheduledDates = getScheduledDatesBetween(earliest, endDate, daysOfWeek);

  if (scheduledDates.length === 0) {
    // If no scheduled dates match, treat each unique completion as a streak of 1
    const completedCount = completedSet.size;
    return { current: completedCount, best: completedCount };
  }

  // Calculate best streak
  let best = 0;
  let run = 0;
  for (const d of scheduledDates) {
    if (completedSet.has(d)) {
      run++;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }

  if (best === 0 && completedSet.size > 0) {
    best = 1;
  }

  // Calculate current streak - find consecutive chain that includes today
  let current = 0;
  const todayIndex = scheduledDates.indexOf(todayStr);
  const todayCompleted = completedSet.has(todayStr);

  // Check if today is a non-scheduled day but was completed
  const todayIsNonScheduledCompletion = todayIndex < 0 && todayCompleted;

  // Find anchor point: today if scheduled, or find yesterday
  let anchorIndex = todayIndex;
  if (anchorIndex === -1) {
    // Today not scheduled - check if yesterday is in the list and completed
    const yesterday = new Date(todayStr + 'T00:00:00');
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayIndex = scheduledDates.indexOf(yesterdayStr);
    if (yesterdayIndex >= 0 && completedSet.has(yesterdayStr)) {
      anchorIndex = yesterdayIndex;
    }
  }

  // If today is scheduled but not completed, current streak is 0
  if (todayIndex >= 0 && !todayCompleted) {
    current = 0;
  } else if (anchorIndex >= 0) {
    // Count from the anchor point
    if (completedSet.has(scheduledDates[anchorIndex])) {
      current = 1;

      // Count backwards
      for (let i = anchorIndex - 1; i >= 0; i--) {
        if (completedSet.has(scheduledDates[i])) {
          current++;
        } else {
          break;
        }
      }

      // Count forwards through scheduled dates
      let reachedEndOfSchedule = true;
      let lastCountedScheduledIndex = anchorIndex;
      for (let i = anchorIndex + 1; i < scheduledDates.length; i++) {
        if (completedSet.has(scheduledDates[i])) {
          current++;
          lastCountedScheduledIndex = i;
        } else {
          reachedEndOfSchedule = false;
          break;
        }
      }

      // If we completed all scheduled dates, also count consecutive future completions
      if (reachedEndOfSchedule) {
        const lastScheduled = scheduledDates[lastCountedScheduledIndex];
        const sortedCompletions = [...completedSet].sort();
        const futureCompletions = sortedCompletions.filter(d => d > lastScheduled);

        if (futureCompletions.length > 0) {
          let prevDate = lastScheduled;
          for (const completion of futureCompletions) {
            const prev = new Date(prevDate + 'T12:00:00');
            const curr = new Date(completion + 'T12:00:00');
            const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              current++;
              prevDate = completion;
            } else {
              break;
            }
          }
        }
      }
    }
  } else if (todayIsNonScheduledCompletion) {
    // Today is not scheduled but was completed - count as 1
    current = 1;
  }

  return { current, best };
};

export const calculateAttendanceProgress = (
  startDate: string,
  targetDate: string,
  daysOfWeek: number[],
  completionDates: string[]
): { expected: number; completed: number; missed: number; perfect: boolean; rate: number } => {
  const todayStr = new Date().toISOString().split('T')[0];
  const effectiveEnd = targetDate < todayStr ? targetDate : todayStr;
  const scheduledDates = getScheduledDatesBetween(startDate, effectiveEnd, daysOfWeek);
  const completedSet = new Set(completionDates);

  let completed = 0;
  let missed = 0;
  for (const d of scheduledDates) {
    if (completedSet.has(d)) {
      completed++;
    } else {
      missed++;
    }
  }

  const totalExpected = getScheduledDatesBetween(startDate, targetDate, daysOfWeek).length;
  const rate = totalExpected > 0 ? (completed / totalExpected) * 100 : 0;

  return {
    expected: totalExpected,
    completed,
    missed,
    perfect: missed === 0,
    rate
  };
};

export const calculateDurationFromTargetDate = (targetDate: string): { days: number; weeks: number; months: number } => {
  const zero = { days: 0, weeks: 0, months: 0 };
  if (!targetDate) return zero;

  const now = new Date();
  const dateStr = targetDate.includes('T') ? targetDate.split('T')[0] : targetDate;
  const target = new Date(dateStr + 'T00:00:00');

  if (isNaN(target.getTime())) return zero;

  const diffMs = target.getTime() - now.getTime();
  if (diffMs < 0) return zero;

  let totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const months = Math.floor(totalDays / 30);
  totalDays -= months * 30;

  const weeks = Math.floor(totalDays / 7);
  const days = totalDays - weeks * 7;

  return { days, weeks, months };
};
