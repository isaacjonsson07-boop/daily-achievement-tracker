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
      <div className="mb-10 animate-rise">
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-sa-cream">Settings</h1>
      </div>

      {/* Account */}
      <div className="bg-sa-bg-warm border border-sa-border rounded-xl p-6 mb-6 animate-rise delay-1">
        <h3 className="text-[0.7rem] font-medium tracking-[0.1em] uppercase text-sa-gold mb-5">
          Account
        </h3>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[rgba(240,237,230,0.06)]">
          <span className="text-[0.82rem] text-sa-cream-muted">Plan</span>
          <span className={`text-[0.85rem] font-medium ${
            plan === 'paid' ? 'text-sa-green' : isTrialActive ? 'text-sa-gold' : 'text-sa-cream-muted'
          }`}>
            {plan === 'paid' ? 'Active' : isTrialActive ? `Trial (${trialDaysRemaining}d)` : 'Free'}
          </span>
        </div>

        {plan === 'free' && !isTrialActive && (
          <button
            onClick={openWhopTrial}
            className="w-full py-3 bg-[rgba(201,169,110,0.12)] border border-[rgba(201,169,110,0.25)] text-sa-gold rounded-lg text-[0.85rem] font-medium hover:bg-[rgba(201,169,110,0.2)] transition-colors mb-3"
          >
            Start Free Access
          </button>
        )}

        {plan === 'free' && isTrialActive && (
          <button
            onClick={openWhopPaid}
            className="w-full py-3 bg-[rgba(201,169,110,0.12)] border border-[rgba(201,169,110,0.25)] text-sa-gold rounded-lg text-[0.85rem] font-medium hover:bg-[rgba(201,169,110,0.2)] transition-colors mb-3"
          >
            Upgrade to Full Access
          </button>
        )}

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
