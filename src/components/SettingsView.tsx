import React from 'react';
import { Settings, Crown, Shield, Wrench, LogIn, LogOut } from 'lucide-react';
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
  user,
  plan = 'free',
  trialEndsAt = null,
  planSource = 'profile',
  onSignIn,
  onSignOut,
  onStartTrial,
  devSetFreePlan,
  devStartTrial,
  devSetPaidPlan
}: SettingsViewProps) {
  const isTrialActive = trialEndsAt !== null;
  const isDevMode = isDevEnvironment();
  const showDevTools = isDevMode && devSetFreePlan && devStartTrial && devSetPaidPlan;

  const handleManageSubscription = () => {
    window.open('https://yoursite.com/manage', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Account Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Account
        </h3>

        <div className="space-y-4">
          {/* Plan Status */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Current Plan</span>
              <span className={`text-lg font-bold ${
                plan === 'paid' ? 'text-green-600 dark:text-green-400' :
                isTrialActive ? 'text-amber-600 dark:text-amber-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {plan === 'paid' ? 'Paid' : isTrialActive ? 'Free Access (Days 1-7)' : 'Free'}
              </span>
            </div>
          </div>

          {/* Primary CTA */}
          <div>
            {plan === 'free' && !isTrialActive && onStartTrial && (
              <button
                onClick={openWhopTrial}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center"
              >
                <Crown className="w-5 h-5 mr-2" />
                Start Free Access
              </button>
            )}
            {plan === 'free' && isTrialActive && (
              <button
                onClick={openWhopPaid}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center"
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Full Access
              </button>
            )}
            {plan === 'paid' && (
              <button
                onClick={handleManageSubscription}
                className="w-full px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center"
              >
                <Settings className="w-5 h-5 mr-2" />
                Manage Subscription
              </button>
            )}
          </div>

          {/* Sign In/Out */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            {user ? (
              <button
                onClick={onSignOut}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors inline-flex items-center justify-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            ) : (
              <button
                onClick={onSignIn}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dev Tools Section */}
      {showDevTools && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-4 flex items-center">
            <Wrench className="w-5 h-5 mr-2" />
            Dev Tools
            <span className="ml-3 text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
              Development Only
            </span>
          </h3>

          {!user && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Note:</strong> You are not signed in. Changes will be stored locally in dev override mode.
              </p>
            </div>
          )}

          <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>Current Status:</strong>
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Plan: <strong className={plan === 'paid' ? 'text-green-600' : 'text-blue-600'}>{plan.toUpperCase()}</strong>
              </span>
              {trialEndsAt && isTrialActive && (
                <span className="text-gray-600 dark:text-gray-400">
                  Trial: <strong className="text-amber-600">Active (Days 1-7)</strong>
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Source: {planSource === 'dev-override' ? 'Dev Override (localStorage)' : 'User Profile (database)'}
            </div>
          </div>

          <p className="text-sm text-purple-800 dark:text-purple-300 mb-4">
            {user ? 'Quickly switch between access levels for testing:' : 'Test different access levels without signing in:'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={async () => {
                await devSetFreePlan();
                window.location.reload();
              }}
              className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all shadow-md hover:shadow-lg"
            >
              <Shield className="w-4 h-4 mr-2" />
              Set FREE Plan
            </button>

            <button
              onClick={async () => {
                await devStartTrial();
                window.location.reload();
              }}
              className="flex items-center justify-center px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all shadow-md hover:shadow-lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              Start Free Access
            </button>

            <button
              onClick={async () => {
                await devSetPaidPlan();
                window.location.reload();
              }}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              Set PAID Plan
            </button>
          </div>

          <p className="text-xs text-purple-700 dark:text-purple-400 mt-4 italic">
            {user
              ? 'These buttons update your user profile in the database.'
              : 'These buttons store overrides in localStorage for testing without authentication.'}
          </p>
        </div>
      )}
    </div>
  );
}
