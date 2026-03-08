import React from 'react';
import { Settings, Crown, LogIn, LogOut, Wrench, Shield } from 'lucide-react';
import { getTrialDaysRemaining } from '../utils/trialUtils';
import { isDevEnvironment } from '../utils/devUtils';
import { openWhopPaid, openWhopTrial } from '../constants';

interface SettingsViewProps {
  user?: { id?: string } | null;
  plan?: 'free' | 'paid';
  trialEndsAt?: string | null;
  planSource?: 'profile' | 'dev-override';
  onSignIn?: () => void;
  onSignOut?: () => void;
  onStartTrial?: () => Promise<void>;
  devSetFreePlan?: () => Promise<any>;
  devStartTrial?: () => Promise<any>;
  devSetPaidPlan?: () => Promise<any>;
}

export function SettingsView({
  user, plan = 'free', trialEndsAt = null, planSource = 'profile',
  onSignIn, onSignOut, onStartTrial,
  devSetFreePlan, devStartTrial, devSetPaidPlan,
}: SettingsViewProps) {
  const trialDaysRemaining = getTrialDaysRemaining(trialEndsAt);
  const isTrialActive = trialDaysRemaining > 0;
  const isDevMode = isDevEnvironment();
  const showDevTools = isDevMode && devSetFreePlan && devStartTrial && devSetPaidPlan;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 animate-rise" />

      {/* Account */}
      <div className="bg-sa-bg-warm border border-sa-border rounded-xl p-6 mb-6 animate-rise delay-1">
        <h3 className="text-[0.7rem] font-medium tracking-[0.1em] uppercase text-sa-gold mb-5">
          Account
        </h3>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[rgba(240,237,230,0.06)]">
          <span className="text-[0.82rem] text-sa-cream-muted">Plan</span>
          <span className="text-[0.85rem] font-medium text-sa-green">Active</span>
        </div>

        <div className="pt-2">
          {user ? (
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sa-cream-muted text-[0.82rem] hover:text-sa-cream transition-colors rounded-lg hover:bg-[rgba(240,237,230,0.04)]"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sa-gold text-[0.82rem] hover:bg-[rgba(201,169,110,0.08)] transition-colors rounded-lg"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Dev Tools */}
      {showDevTools && (
        <div className="bg-sa-bg-warm border border-sa-gold-border rounded-xl p-6 animate-rise delay-2">
          <h3 className="text-[0.7rem] font-medium tracking-[0.1em] uppercase text-sa-cream-muted mb-4 flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5" />
            Dev Tools
          </h3>
          <div className="flex gap-2">
            <button
              onClick={async () => { await devSetFreePlan(); window.location.reload(); }}
              className="flex-1 py-2 bg-[rgba(240,237,230,0.04)] text-sa-cream-muted text-[0.72rem] rounded-lg hover:bg-[rgba(240,237,230,0.08)] transition-colors"
            >
              Free
            </button>
            <button
              onClick={async () => { await devStartTrial(); window.location.reload(); }}
              className="flex-1 py-2 bg-[rgba(201,169,110,0.08)] text-sa-gold text-[0.72rem] rounded-lg hover:bg-[rgba(201,169,110,0.15)] transition-colors"
            >
              Trial
            </button>
            <button
              onClick={async () => { await devSetPaidPlan(); window.location.reload(); }}
              className="flex-1 py-2 bg-[rgba(90,219,126,0.08)] text-sa-green text-[0.72rem] rounded-lg hover:bg-[rgba(90,219,126,0.15)] transition-colors"
            >
              Paid
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
