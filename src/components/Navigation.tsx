import React from 'react';
import { CheckCircle, BookOpen, BarChart3, Layers, Settings, User } from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  user?: { email?: string } | null;
  plan?: 'free' | 'paid';
  trialEndsAt?: string | null;
  onSignOut: () => void;
  onShowAuth?: () => void;
  installationDay?: number;
}

const tabs: { id: TabType; label: string; mobileLabel: string; icon: React.ElementType }[] = [
  { id: 'today', label: 'Today', mobileLabel: 'Today', icon: CheckCircle },
  { id: 'installation', label: 'Installation', mobileLabel: 'Install', icon: BookOpen },
  { id: 'reviews', label: 'Reviews', mobileLabel: 'Reviews', icon: BarChart3 },
  { id: 'system', label: 'System', mobileLabel: 'System', icon: Layers },
  { id: 'settings', label: 'Settings', mobileLabel: 'Settings', icon: Settings },
];

export function Navigation({
  currentTab,
  onTabChange,
  user,
  plan = 'free',
  trialEndsAt,
  onSignOut,
  onShowAuth,
  installationDay,
}: NavigationProps) {
  const isTrialActive = trialEndsAt ? new Date(trialEndsAt) > new Date() : false;

  return (
    <>
      {/* ===== DESKTOP HEADER ===== */}
      <header className="hidden md:block border-b border-sa-border bg-sa-bg/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="flex items-center justify-between h-16">

            {/* Brand */}
            <span className="text-sm tracking-widest uppercase text-sa-cream-muted">
              Structured Achievement
            </span>

            {/* Desktop tabs */}
            <nav className="flex items-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-sa text-sm transition-all duration-150 ${
                      isActive
                        ? 'text-sa-gold bg-sa-gold-soft font-medium'
                        : 'text-sa-cream-muted hover:text-sa-cream hover:bg-sa-bg-lift'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.id === 'installation' && installationDay != null && installationDay <= 21 && (
                      <span className="text-xs text-sa-gold/70 font-medium">
                        {installationDay}/21
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right side — user info */}
            <div className="flex items-center gap-3">
              {user && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  plan === 'paid'
                    ? 'bg-sa-green-soft text-sa-green border border-sa-green-border'
                    : isTrialActive
                      ? 'bg-sa-gold-soft text-sa-gold border border-sa-gold-border'
                      : 'bg-sa-bg-lift text-sa-cream-faint border border-sa-border-light'
                }`}>
                  {plan === 'paid' ? 'Active' : isTrialActive ? 'Trial' : 'Free'}
                </span>
              )}

              {user ? (
                <span className="text-sm text-sa-cream-muted truncate max-w-[160px]">
                  {user.email}
                </span>
              ) : (
                <button
                  onClick={onShowAuth}
                  className="flex items-center gap-2 text-sm text-sa-cream-muted hover:text-sa-gold transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ===== MOBILE TOP BAR ===== */}
      <header className="md:hidden border-b border-sa-border bg-sa-bg/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-5">
          <span className="text-xs tracking-widest uppercase text-sa-cream-muted">
            Structured Achievement
          </span>

          <div className="flex items-center gap-2.5">
            {user && plan === 'paid' && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sa-green-soft text-sa-green border border-sa-green-border">
                Active
              </span>
            )}

            {user ? (
              <span className="text-xs text-sa-cream-muted truncate max-w-[120px]">
                {user.email}
              </span>
            ) : (
              <button
                onClick={onShowAuth}
                className="flex items-center gap-1.5 text-xs text-sa-cream-muted hover:text-sa-gold transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== MOBILE BOTTOM TAB BAR ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sa-bg-warm/95 backdrop-blur-md border-t border-sa-border">
        <div className="flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-3 min-w-[4rem] rounded-sa-sm transition-colors duration-150 ${
                  isActive
                    ? 'text-sa-gold'
                    : 'text-sa-cream-faint active:text-sa-cream-muted'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
                <span className={`text-[0.65rem] leading-none ${
                  isActive ? 'font-medium' : 'font-normal'
                }`}>
                  {tab.mobileLabel}
                </span>
                {tab.id === 'installation' && installationDay != null && installationDay <= 21 && (
                  <span className="absolute top-0.5 right-1.5 w-2 h-2 rounded-full bg-sa-gold" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
