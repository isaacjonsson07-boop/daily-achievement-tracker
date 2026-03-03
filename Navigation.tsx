import React from 'react';
import { CheckCircle, BookOpen, BarChart3, Trophy, Layers, Settings, User, LogOut } from 'lucide-react';
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
  { id: 'achievements', label: 'Achievements', mobileLabel: 'Achieve', icon: Trophy },
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
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[260px] flex-col bg-sa-bg border-r border-sa-border z-40">

        {/* Brand */}
        <div className="px-7 pt-9 pb-7">
          <h1 className="font-serif text-[1.5rem] text-sa-cream font-normal tracking-[-0.01em] leading-tight">
            Structured<br/>Achievement
          </h1>
          <p className="text-[0.7rem] text-sa-cream-faint mt-1.5 uppercase tracking-[0.12em]">Operating System</p>
        </div>

        {/* Gold gradient divider */}
        <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, var(--gold-border), transparent 80%)' }} />

        {/* Nav tabs */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-[10px] text-[0.88rem] transition-all duration-200 border ${
                  isActive
                    ? 'text-sa-gold bg-sa-gold-glow border-sa-gold-border'
                    : 'text-sa-cream-muted border-transparent hover:text-sa-cream-soft hover:bg-sa-gold-soft'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.id === 'installation' && installationDay != null && installationDay <= 21 && (
                  <span className="text-xs text-sa-gold/60 font-medium tabular-nums">
                    {installationDay}/21
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom section — user */}
        <div className="px-5 pb-5 space-y-3">
          <div className="border-t border-sa-border pt-4" style={{ borderImage: 'linear-gradient(90deg, var(--gold-border), transparent 80%) 1' }} />

          {user && (
            <div className="px-1">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                plan === 'paid'
                  ? 'bg-sa-green-soft text-sa-green border border-sa-green-border'
                  : isTrialActive
                    ? 'bg-sa-gold-soft text-sa-gold border border-sa-gold-border'
                    : 'bg-sa-bg-lift text-sa-cream-faint border border-sa-border-light'
              }`}>
                {plan === 'paid' ? 'Active' : isTrialActive ? 'Trial' : 'Free'}
              </span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-8 h-8 rounded-full bg-sa-bg-lift border border-sa-gold-border flex items-center justify-center flex-shrink-0">
                <span className="text-[0.7rem] text-sa-gold font-medium">
                  {(user.email || '?')[0].toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-sa-cream-faint truncate flex-1">
                {user.email}
              </span>
              <button
                onClick={onSignOut}
                className="p-1 text-sa-cream-faint hover:text-sa-rose transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onShowAuth}
              className="flex items-center gap-2 px-2 text-sm text-sa-cream-muted hover:text-sa-gold transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <header className="md:hidden border-b border-sa-border bg-sa-bg/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-5">
          <span className="font-serif text-base text-sa-cream">
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
