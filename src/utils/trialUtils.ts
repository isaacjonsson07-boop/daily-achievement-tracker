export function isTrialActive(trialEndsAt: string | null): boolean {
  // Trial is active if the user has started it (trialEndsAt is set)
  // It lasts forever, providing access to 7 days until they upgrade
  return trialEndsAt !== null;
}

export function getJournalAccessDays(
  plan: 'free' | 'paid',
  trialEndsAt: string | null
): number {
  if (plan === 'paid') return 21;
  if (isTrialActive(trialEndsAt)) return 7;
  return 0;
}

export function getTrialDaysRemaining(trialEndsAt: string | null): number {
  // Trial never expires - return 0 to indicate no countdown
  return 0;
}
