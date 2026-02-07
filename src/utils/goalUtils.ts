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
  if (days === 0 && weeks === 0 && months === 0) return null;
  const dateStr = calculateTargetDateFromDuration(days, weeks, months);
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const isOverdue = (targetDate: string): boolean => {
  return new Date(targetDate) < new Date();
};
