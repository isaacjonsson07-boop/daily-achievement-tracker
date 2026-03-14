import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, TrendingUp, TrendingDown, Minus, Target, Flame, Calendar, CheckCircle, AlertTriangle, X, Gem, Zap, Shield, FileText, Award, Star, Clock, Anchor, Power, Lock } from 'lucide-react';
import {
  NonNegotiable, NonNegotiableCompletion,
  Habit, HabitCompletion, DailyTask,
  SystemReport, ReportTier,
} from '../types';
import { uid, fmtDateISO } from '../utils/dateUtils';
import { generateMonthlyReport, getTier, TIER_CONFIG } from '../utils/scoreUtils';

interface AchievementsViewProps {
  nonNegotiables: NonNegotiable[];
  nnCompletions: NonNegotiableCompletion[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  dailyTasks: DailyTask[];
  userId?: string;
  systemReports: SystemReport[];
  onSaveSystemReport: (report: SystemReport) => void;
}

// ── Month helpers ──

function getMonthLabel(month: string): string {
  const [y, m] = month.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getShortMonthLabel(month: string): string {
  const [y, m] = month.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1);
  return date.toLocaleDateString('en-US', { month: 'short' });
}

function getYearLabel(month: string): string {
  return month.split('-')[0];
}

// ═══════════════════════════════════════
// ORNATE SVG FRAMES (modal only)
// ═══════════════════════════════════════

// Diamond frame — real ornamental corner piece
function DiamondFrame() {
  const cornerStyle = (transform: string): React.CSSProperties => ({
    position: 'absolute',
    width: '85px',
    height: '85px',
    opacity: 0.85,
    transform,
    pointerEvents: 'none',
    filter: 'drop-shadow(0 0 6px rgba(184, 212, 232, 0.4))',
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">
      <img src="/corner-diamond.svg" alt="" style={{ ...cornerStyle('scaleY(-1)'), top: 0, left: 0 }} />
      <img src="/corner-diamond.svg" alt="" style={{ ...cornerStyle('scale(-1, -1)'), top: 0, right: 0 }} />
      <img src="/corner-diamond.svg" alt="" style={{ ...cornerStyle('none'), bottom: 0, left: 0 }} />
      <img src="/corner-diamond.svg" alt="" style={{ ...cornerStyle('scaleX(-1)'), bottom: 0, right: 0 }} />
    </div>
  );
}

// Gold frame — real ornamental corner piece
function GoldFrame() {
  const cornerStyle = (transform: string): React.CSSProperties => ({
    position: 'absolute',
    width: '65px',
    height: '65px',
    opacity: 0.75,
    transform,
    pointerEvents: 'none',
    filter: 'drop-shadow(0 0 4px rgba(197, 165, 90, 0.3))',
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">
      <img src="/corner-gold.svg" alt="" style={{ ...cornerStyle('none'), top: 0, left: 0 }} />
      <img src="/corner-gold.svg" alt="" style={{ ...cornerStyle('scaleX(-1)'), top: 0, right: 0 }} />
      <img src="/corner-gold.svg" alt="" style={{ ...cornerStyle('scaleY(-1)'), bottom: 0, left: 0 }} />
      <img src="/corner-gold.svg" alt="" style={{ ...cornerStyle('scale(-1, -1)'), bottom: 0, right: 0 }} />
    </div>
  );
}

// Silver frame — clean geometric corners
function SilverFrame({ color }: { color: string }) {
  const c = color;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">
      <svg className="absolute top-0 left-0 w-12 h-12" viewBox="0 0 48 48" fill="none">
        <path d="M4 24 L4 8 C4 6, 6 4, 8 4 L24 4" stroke={c} strokeWidth="1" />
        <path d="M8 4 L4 4 L4 8" stroke={c} strokeWidth="1.5" />
      </svg>
      <svg className="absolute top-0 right-0 w-12 h-12" viewBox="0 0 48 48" fill="none">
        <path d="M44 24 L44 8 C44 6, 42 4, 40 4 L24 4" stroke={c} strokeWidth="1" />
        <path d="M40 4 L44 4 L44 8" stroke={c} strokeWidth="1.5" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-12 h-12" viewBox="0 0 48 48" fill="none">
        <path d="M4 24 L4 40 C4 42, 6 44, 8 44 L24 44" stroke={c} strokeWidth="1" />
        <path d="M8 44 L4 44 L4 40" stroke={c} strokeWidth="1.5" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-12 h-12" viewBox="0 0 48 48" fill="none">
        <path d="M44 24 L44 40 C44 42, 42 44, 40 44 L24 44" stroke={c} strokeWidth="1" />
        <path d="M40 44 L44 44 L44 40" stroke={c} strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// Bronze frame — minimal corner marks
function BronzeFrame({ color }: { color: string }) {
  const c = color;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">
      <svg className="absolute top-0 left-0 w-8 h-8" viewBox="0 0 32 32" fill="none">
        <path d="M4 16 L4 6 C4 5, 5 4, 6 4 L16 4" stroke={c} strokeWidth="1" />
      </svg>
      <svg className="absolute top-0 right-0 w-8 h-8" viewBox="0 0 32 32" fill="none">
        <path d="M28 16 L28 6 C28 5, 27 4, 26 4 L16 4" stroke={c} strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-8 h-8" viewBox="0 0 32 32" fill="none">
        <path d="M4 16 L4 26 C4 27, 5 28, 6 28 L16 28" stroke={c} strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-8 h-8" viewBox="0 0 32 32" fill="none">
        <path d="M28 16 L28 26 C28 27, 27 28, 26 28 L16 28" stroke={c} strokeWidth="1" />
      </svg>
    </div>
  );
}

// Frame selector
function TierFrame({ tier }: { tier: ReportTier }) {
  const config = TIER_CONFIG[tier];
  switch (tier) {
    case 'diamond': return <DiamondFrame />;
    case 'gold': return <GoldFrame />;
    case 'silver': return <SilverFrame color={config.color} />;
    case 'bronze': return <BronzeFrame color={config.color} />;
  }
}

// ═══════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════

function ScoreRing({ score, tier, size = 80 }: { score: number; tier: ReportTier; size?: number }) {
  const config = TIER_CONFIG[tier];
  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius}
          stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius}
          stroke={config.color} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-xl" style={{ color: config.color }}>{score}</span>
      </div>
    </div>
  );
}

function DeltaBadge({ delta }: { delta?: number }) {
  if (delta === undefined || delta === null) return null;
  if (delta > 0) return (
    <span className="inline-flex items-center gap-1 text-xs text-sa-green">
      <TrendingUp className="w-3 h-3" />+{delta} <span className="text-sa-cream-faint">vs last</span>
    </span>
  );
  if (delta < 0) return (
    <span className="inline-flex items-center gap-1 text-xs text-sa-rose">
      <TrendingDown className="w-3 h-3" />{delta} <span className="text-sa-cream-faint">vs last</span>
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-sa-cream-faint">
      <Minus className="w-3 h-3" />0 vs last
    </span>
  );
}

function CategoryBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-sa-cream-muted">{label}</span>
        <span className="text-xs font-medium tabular-nums" style={{ color }}>{score}%</span>
      </div>
      <div className="w-full h-1.5 bg-sa-bg-lift rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// SYSTEM CARD (compact, clean — no frame)
// ═══════════════════════════════════════

function SystemCard({ report, onClick }: { report: SystemReport; onClick: () => void }) {
  const config = TIER_CONFIG[report.tier];

  return (
    <button onClick={onClick}
      className="w-full text-left group relative rounded-sa-lg transition-all duration-200 hover:scale-[1.01]"
      style={{ border: `1px solid ${config.border}`, backgroundColor: config.bg }}>
      <div className="relative p-5">
        <div className="flex items-center gap-4">
          <ScoreRing score={report.score} tier={report.tier} size={64} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-serif text-base text-sa-cream">{getShortMonthLabel(report.month)}</span>
              <span className="text-xs text-sa-cream-faint">{getYearLabel(report.month)}</span>
              {report.isInstallationReport && (
                <span className="text-[0.6rem] uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ color: config.color, backgroundColor: config.bg, border: `1px solid ${config.border}` }}>
                  Day 21
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: config.color }}>
                {config.label}
              </span>
              <DeltaBadge delta={report.scoreDelta} />
            </div>
            {report.scoreCapped && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3 text-sa-cream-faint" />
                <span className="text-[0.65rem] text-sa-cream-faint">Below minimums — score capped</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════
// EXPANDED REPORT (with ornate frame)
// ═══════════════════════════════════════

function ExpandedReport({ report, onClose }: { report: SystemReport; onClose: () => void }) {
  const config = TIER_CONFIG[report.tier];
  const isDiamond = report.tier === 'diamond';

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="relative w-full max-w-lg max-h-[85vh] rounded-sa-lg"
        onClick={(e) => e.stopPropagation()}
        style={{
          border: `1px solid ${config.border}`,
          backgroundColor: '#151518',
          boxShadow: isDiamond
            ? '0 0 40px rgba(184, 212, 232, 0.10), 0 0 80px rgba(184, 212, 232, 0.04)'
            : report.tier === 'gold' ? '0 0 30px rgba(197, 165, 90, 0.08)' : 'none',
        }}>

        {/* Ornate tier frame */}
        <TierFrame tier={report.tier} />

        {/* Content */}
        <div className="rounded-sa-lg">
          <div className="relative z-20 p-4 sm:p-8 md:p-10">
            <button onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 text-sa-cream-faint hover:text-sa-cream transition-colors rounded-sa-sm hover:bg-sa-bg-lift z-30">
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-3 sm:mb-8">
              <p className="text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.2em] text-sa-cream-faint mb-1.5 sm:mb-3">System Report</p>
              <h2 className="font-serif text-xl sm:text-2xl text-sa-cream mb-1">{getMonthLabel(report.month)}</h2>
              {report.isInstallationReport && (
                <p className="text-xs mt-1" style={{ color: config.color }}>Installation Complete — Day 21</p>
              )}
              <div className="flex justify-center mt-3 sm:mt-6 mb-1.5 sm:mb-3">
                <ScoreRing score={report.score} tier={report.tier} size={70} />
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-xs sm:text-sm font-medium uppercase tracking-wider" style={{ color: config.color }}>
                  {config.label}
                </span>
                <DeltaBadge delta={report.scoreDelta} />
              </div>
              {report.scoreCapped && (
                <div className="flex items-center justify-center gap-1.5 mt-1.5 sm:mt-2">
                  <AlertTriangle className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-sa-cream-faint" />
                  <span className="text-[0.65rem] sm:text-xs text-sa-cream-faint">Score capped at 75 — below system minimums</span>
                </div>
              )}
            </div>

            <div className="h-px mb-3 sm:mb-6" style={{ background: `linear-gradient(90deg, transparent, ${config.border}, transparent)` }} />

            <div className="space-y-2.5 sm:space-y-4 mb-3 sm:mb-8">
              <p className="text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.15em] text-sa-cream-faint">Performance Breakdown</p>
              <CategoryBar label={`Habits (${report.habitsCount} tracked)`} score={report.habitsScore} color={config.color} />
              <CategoryBar label={`Tasks (avg ${report.tasksAvgPerDay}/day)`} score={report.tasksScore} color={config.color} />
              <CategoryBar label={`Non-Negotiables (${report.nnCount} active)`} score={report.nnScore} color={config.color} />
            </div>

            {!report.meetsMinimums && (
              <div className="mb-3 sm:mb-6 p-2 sm:p-3 rounded-sa text-[0.65rem] sm:text-xs text-sa-cream-faint"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="font-medium text-sa-cream-muted mb-0.5 sm:mb-1">Below system minimums</p>
                <p>
                  Full scoring requires {report.habitsCount < 3 ? `3+ habits (you have ${report.habitsCount})` : ''}
                  {report.habitsCount < 3 && report.tasksAvgPerDay < 3 ? ', ' : ''}
                  {report.tasksAvgPerDay < 3 ? `3+ tasks/day avg (you avg ${report.tasksAvgPerDay})` : ''}
                  {(report.habitsCount < 3 || report.tasksAvgPerDay < 3) && report.nnCount < 2 ? ', ' : ''}
                  {report.nnCount < 2 ? `2+ non-negotiables (you have ${report.nnCount})` : ''}.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-1.5 sm:gap-3 mb-3 sm:mb-8">
              {[
                { icon: CheckCircle, label: 'Tasks Done', value: String(report.totalTasksCompleted), suffix: '' },
                { icon: Flame, label: 'Streak', value: String(report.longestStreak), suffix: 'days' },
                { icon: Calendar, label: 'Days Active', value: String(report.totalDaysActive), suffix: '' },
                { icon: Target, label: 'Score', value: String(report.score), suffix: '/100', useColor: true },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="p-2 sm:p-3 rounded-sa"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                      <Icon className="w-3 sm:w-3.5 h-3 sm:h-3.5" style={{ color: config.color }} />
                      <span className="text-[0.55rem] sm:text-[0.65rem] uppercase tracking-wider text-sa-cream-faint">{stat.label}</span>
                    </div>
                    <span className="font-serif text-base sm:text-xl" style={{ color: stat.useColor ? config.color : 'var(--cream)' }}>
                      {stat.value}
                      {stat.suffix && <span className="text-[0.65rem] sm:text-sm text-sa-cream-faint ml-1">{stat.suffix}</span>}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <div className="h-px mb-2.5 sm:mb-5" style={{ background: `linear-gradient(90deg, transparent, ${config.border}, transparent)` }} />
              <p className="text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.15em] text-sa-cream-faint mb-1.5 sm:mb-3">Personal Highlight</p>
              <p className="text-[0.8rem] sm:text-sm text-sa-cream-soft italic leading-relaxed">"{report.personalHighlight}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Empty state ──

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-sa-gold-soft border border-sa-gold-border flex items-center justify-center mb-6">
        <Trophy className="w-7 h-7 text-sa-gold opacity-70" />
      </div>
      <h3 className="font-serif text-xl text-sa-cream mb-2">No System Reports Yet</h3>
      <p className="text-sm text-sa-cream-muted max-w-sm mb-6 leading-relaxed">
        System Reports are generated monthly to track your operational performance.
        Each report becomes a card in your achievement history.
      </p>
      <button onClick={onGenerate} className="sa-btn-primary">Generate Current Month Report</button>
    </div>
  );
}


// ═══════════════════════════════════════
// MILESTONE SYSTEM (new feature)
// ═══════════════════════════════════════

type MilestoneChapter = 'foundation' | 'momentum' | 'mastery';

interface MilestoneDef {
  id: string;
  title: string;
  description: string;
  chapter: MilestoneChapter;
  icon: React.ElementType;
  check: (ctx: MilestoneContext) => boolean;
  requirement: string;
  progressFn?: (ctx: MilestoneContext) => { current: number; target: number };
}

interface MilestoneContext {
  activeNNs: NonNegotiable[];
  habits: Habit[];
  nnCompletions: NonNegotiableCompletion[];
  habitCompletions: HabitCompletion[];
  dailyTasks: DailyTask[];
  systemReports: SystemReport[];
  totalActiveDays: number;
  totalTasksCompleted: number;
  longestStreak80: number;
  longestNNStreak: number;
  hasAnyFullDay: boolean;
}

const CHAPTER_META: Record<MilestoneChapter, { label: string; subtitle: string; color: string; colorSoft: string; border: string; glow: string }> = {
  foundation: { label: 'Foundation', subtitle: 'Configure your system', color: '#C5A55A', colorSoft: 'rgba(197,165,90,0.06)', border: 'rgba(197,165,90,0.25)', glow: 'rgba(197,165,90,0.35)' },
  momentum:   { label: 'Momentum',   subtitle: 'Build consistent execution', color: '#6DB5F5', colorSoft: 'rgba(109,181,245,0.06)', border: 'rgba(109,181,245,0.25)', glow: 'rgba(109,181,245,0.35)' },
  mastery:    { label: 'Mastery',     subtitle: 'Prove operational excellence', color: '#6ECB8B', colorSoft: 'rgba(110,203,139,0.06)', border: 'rgba(110,203,139,0.25)', glow: 'rgba(110,203,139,0.35)' },
};

const MILESTONES: MilestoneDef[] = [
  { id: 'system-online', title: 'System Online', description: 'Configure at least 1 non-negotiable and 1 habit to bring your system online. This is step zero \u2014 nothing tracks until components are installed.', chapter: 'foundation', icon: Power,
    check: c => c.activeNNs.length >= 1 && c.habits.length >= 1, requirement: '1 non-negotiable + 1 habit',
    progressFn: c => ({ current: Math.min(c.activeNNs.length, 1) + Math.min(c.habits.length, 1), target: 2 }) },
  { id: 'first-execution', title: 'First Execution', description: 'Complete every item in a single day \u2014 all non-negotiables, all habits, all tasks. Prove the system can run at full capacity.', chapter: 'foundation', icon: Zap,
    check: c => c.hasAnyFullDay, requirement: '100% completion on any day' },
  { id: 'week-one', title: 'Week One', description: 'Be active for 7 days total. Not consecutive \u2014 just 7 days where you showed up and executed.', chapter: 'foundation', icon: Calendar,
    check: c => c.totalActiveDays >= 7, requirement: '7 active days',
    progressFn: c => ({ current: Math.min(c.totalActiveDays, 7), target: 7 }) },
  { id: 'grounded', title: 'Grounded', description: '14 total active days. Two weeks of execution behind you. Your system has roots now.', chapter: 'foundation', icon: Anchor,
    check: c => c.totalActiveDays >= 14, requirement: '14 active days',
    progressFn: c => ({ current: Math.min(c.totalActiveDays, 14), target: 14 }) },
  { id: 'executor', title: 'Executor', description: '25 tasks completed. Not started \u2014 completed. Proof of consistent output.', chapter: 'foundation', icon: CheckCircle,
    check: c => c.totalTasksCompleted >= 25, requirement: '25 tasks completed',
    progressFn: c => ({ current: Math.min(c.totalTasksCompleted, 25), target: 25 }) },
  { id: '7-day-streak', title: '7-Day Streak', description: '7 consecutive days at 80%+ completion. Operational discipline.', chapter: 'momentum', icon: Flame,
    check: c => c.longestStreak80 >= 7, requirement: '7-day streak at 80%+',
    progressFn: c => ({ current: Math.min(c.longestStreak80, 7), target: 7 }) },
  { id: 'nn-lock', title: 'Non-Negotiable Lock', description: '7 days straight without missing a single non-negotiable.', chapter: 'momentum', icon: Shield,
    check: c => c.longestNNStreak >= 7, requirement: '7-day perfect NN streak',
    progressFn: c => ({ current: Math.min(c.longestNNStreak, 7), target: 7 }) },
  { id: 'first-report', title: 'First Report', description: 'Generate your first monthly System Report.', chapter: 'momentum', icon: FileText,
    check: c => c.systemReports.length >= 1, requirement: 'Generate 1 monthly report',
    progressFn: c => ({ current: Math.min(c.systemReports.length, 1), target: 1 }) },
  { id: 'half-century', title: 'Half Century', description: '50 tasks completed. This is just how you operate now.', chapter: 'momentum', icon: Target,
    check: c => c.totalTasksCompleted >= 50, requirement: '50 tasks completed',
    progressFn: c => ({ current: Math.min(c.totalTasksCompleted, 50), target: 50 }) },
  { id: 'silver-caliber', title: 'Silver Caliber', description: 'Earn Silver tier or higher in a monthly System Report.', chapter: 'momentum', icon: Award,
    check: c => c.systemReports.some(r => ['silver','gold','diamond'].includes(r.tier)), requirement: 'Silver+ monthly report' },
  { id: '14-day-streak', title: '14-Day Streak', description: 'Two unbroken weeks at 80%+ completion. Most people fall off here. You didn\u2019t.', chapter: 'mastery', icon: TrendingUp,
    check: c => c.longestStreak80 >= 14, requirement: '14-day streak at 80%+',
    progressFn: c => ({ current: Math.min(c.longestStreak80, 14), target: 14 }) },
  { id: 'gold-standard', title: 'Gold Standard', description: 'Earn Gold tier in a monthly report. 75%+ execution across the board.', chapter: 'mastery', icon: Star,
    check: c => c.systemReports.some(r => ['gold','diamond'].includes(r.tier)), requirement: 'Gold monthly report' },
  { id: 'century', title: 'Century', description: '100 tasks completed. Relentless.', chapter: 'mastery', icon: Target,
    check: c => c.totalTasksCompleted >= 100, requirement: '100 tasks completed',
    progressFn: c => ({ current: Math.min(c.totalTasksCompleted, 100), target: 100 }) },
  { id: '30-day-operator', title: '30-Day Operator', description: '30 active days. The system runs on autopilot now.', chapter: 'mastery', icon: Clock,
    check: c => c.totalActiveDays >= 30, requirement: '30 active days',
    progressFn: c => ({ current: Math.min(c.totalActiveDays, 30), target: 30 }) },
  { id: 'diamond-operator', title: 'Diamond Operator', description: 'Earn a perfect Diamond report \u2014 100% execution for an entire month.', chapter: 'mastery', icon: Gem,
    check: c => c.systemReports.some(r => r.tier === 'diamond'), requirement: 'Diamond report (100%)' },
];

function getRankFromCount(n: number) {
  if (n >= 14) return { title: 'Full Stack', next: null };
  if (n >= 10) return { title: 'Architect', next: 'Full Stack' };
  if (n >= 6)  return { title: 'Operator', next: 'Architect' };
  if (n >= 3)  return { title: 'Initiate', next: 'Operator' };
  return { title: 'Newcomer', next: 'Initiate' };
}

function computeMilestoneCtx(nns: NonNegotiable[], nnC: NonNegotiableCompletion[], habits: Habit[], hC: HabitCompletion[], tasks: DailyTask[], reports: SystemReport[]): MilestoneContext {
  const activeNNs = nns.filter(n => n.active);
  const allDates = new Set<string>();
  nnC.forEach(c => allDates.add(c.completion_date));
  hC.forEach(c => allDates.add(c.completion_date));
  tasks.filter(t => t.completed).forEach(t => allDates.add(t.task_date));
  const sorted = Array.from(allDates).sort();
  const evalDates: string[] = [];
  if (sorted.length > 0) {
    const cursor = new Date(sorted[0] + 'T00:00:00');
    const end = new Date();
    while (cursor <= end) {
      evalDates.push(fmtDateISO(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  let hasAnyFullDay = false, longestStreak80 = 0, cur80 = 0, longestNNStreak = 0, curNN = 0;
  for (const date of evalDates) {
    const d = new Date(date + 'T00:00:00'), di = d.getDay(), ds = d.getTime();
    const nnsDay = activeNNs.filter(nn => new Date(nn.created_at).getTime() <= ds + 86400000);
    const nnDone = nnsDay.filter(nn => nnC.some(c => c.non_negotiable_id === nn.id && c.completion_date === date)).length;
    const habDay = habits.filter(h => h.days_of_week.includes(di) && new Date(h.created_at).getTime() <= ds + 86400000);
    const habDone = habDay.filter(h => hC.some(c => c.habit_id === h.id && c.completion_date === date)).length;
    const tDay = tasks.filter(t => t.task_date === date), tDone = tDay.filter(t => t.completed).length;
    const total = nnsDay.length + habDay.length + tDay.length, done = nnDone + habDone + tDone;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    if (pct === 100 && total > 0) hasAnyFullDay = true;
    if (pct >= 80 && total > 0) { cur80++; longestStreak80 = Math.max(longestStreak80, cur80); } else cur80 = 0;
    if (nnsDay.length > 0 && nnDone === nnsDay.length) { curNN++; longestNNStreak = Math.max(longestNNStreak, curNN); } else if (nnsDay.length > 0) curNN = 0;
  }
  return {
    activeNNs, habits, nnCompletions: nnC, habitCompletions: hC, dailyTasks: tasks, systemReports: reports,
    totalActiveDays: allDates.size, totalTasksCompleted: tasks.filter(t => t.completed).length,
    longestStreak80, longestNNStreak, hasAnyFullDay,
  };
}

function getMilestoneStatus(unlockedCount: number, nextIndex: number | null, ctx: MilestoneContext): { message: string; color: string } {
  if (unlockedCount === MILESTONES.length) return { message: 'All 15 milestones unlocked. Full Stack rank achieved.', color: '#6ECB8B' };
  if (unlockedCount === 0) return { message: 'No milestones unlocked yet. Configure your first non-negotiable and habit.', color: '#C5A55A' };
  if (nextIndex !== null) {
    const next = MILESTONES[nextIndex];
    const progress = next.progressFn ? next.progressFn(ctx) : null;
    if (progress) {
      const remaining = progress.target - progress.current;
      if (remaining <= 3) return { message: `${remaining} away from "${next.title}." Almost there.`, color: CHAPTER_META[next.chapter].color };
      return { message: `${unlockedCount} milestones down. Next: "${next.title}" \u2014 ${progress.current}/${progress.target}.`, color: CHAPTER_META[next.chapter].color };
    }
    return { message: `${unlockedCount} milestones down. Next: "${next.title}."`, color: CHAPTER_META[next.chapter].color };
  }
  return { message: `${unlockedCount} milestones unlocked.`, color: '#C5A55A' };
}

function MilestoneCard({ milestone, index, unlocked, isNext, isLocked, ctx }: {
  milestone: MilestoneDef; index: number; unlocked: boolean; isNext: boolean; isLocked: boolean; ctx: MilestoneContext;
}) {
  const ch = CHAPTER_META[milestone.chapter];
  const Icon = milestone.icon;
  const progress = isNext && milestone.progressFn ? milestone.progressFn(ctx) : null;
  const progressPct = progress ? Math.round((progress.current / progress.target) * 100) : 0;

  return (
    <div className={`relative flex gap-5 ${isLocked ? 'opacity-30' : ''}`}>
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 52 }}>
        <div className="relative">
          {unlocked && <div className="absolute -inset-2 rounded-full" style={{ background: ch.glow, filter: 'blur(10px)' }} />}
          {isNext && <div className="absolute -inset-3 rounded-full" style={{ background: ch.glow, filter: 'blur(12px)', opacity: 0.4, animation: 'nodePulse 2.5s ease-in-out infinite' }} />}
          <div className={`relative w-[52px] h-[52px] rounded-full flex items-center justify-center ${unlocked ? '' : isNext ? 'border-2' : 'border border-dashed'}`}
            style={{
              backgroundColor: unlocked ? ch.color : 'rgba(255,255,255,0.03)',
              borderColor: unlocked ? 'transparent' : isNext ? ch.color : 'rgba(255,255,255,0.12)',
              boxShadow: unlocked ? `0 0 20px ${ch.glow}` : 'none',
            }}>
            {unlocked
              ? <Icon className="w-6 h-6" style={{ color: '#131316' }} strokeWidth={2} />
              : <Icon className="w-5 h-5" style={{ color: isNext ? ch.color : 'rgba(255,255,255,0.2)' }} strokeWidth={1.5} />}
          </div>
        </div>
        <div className="flex-1 w-px min-h-[24px]" style={{
          background: unlocked ? `linear-gradient(to bottom, ${ch.color}, ${ch.border})` : isNext ? `linear-gradient(to bottom, ${ch.border}, rgba(255,255,255,0.04))` : 'rgba(255,255,255,0.04)',
        }} />
      </div>
      <div className={`flex-1 min-w-0 ${isNext ? 'pb-8' : 'pb-5'}`}>
        <div className={`${isNext ? 'p-5 rounded-sa-lg' : ''}`} style={isNext ? {
          border: `1.5px solid ${ch.border}`, backgroundColor: ch.colorSoft,
          boxShadow: `0 0 30px ${ch.colorSoft}, inset 0 0 40px ${ch.colorSoft}`,
        } : {}}>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="text-[0.65rem] font-medium tabular-nums" style={{
              color: unlocked ? ch.color : isNext ? ch.color : 'var(--cream-faint)', opacity: isLocked ? 0.5 : 1,
            }}>{String(index + 1).padStart(2, '0')}</span>
            <h3 className={`font-serif text-[1.15rem] leading-tight ${unlocked ? 'text-sa-cream' : isNext ? 'text-sa-cream' : 'text-sa-cream-faint'}`}>
              {milestone.title}
            </h3>
            {unlocked && (
              <span className="flex items-center gap-1 text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-full font-medium"
                style={{ color: ch.color, backgroundColor: ch.colorSoft, border: `1px solid ${ch.border}` }}>
                <CheckCircle className="w-3 h-3" strokeWidth={2.5} /> Done
              </span>
            )}
            {isNext && (
              <span className="text-[0.6rem] uppercase tracking-widest px-2.5 py-1 rounded-full font-medium"
                style={{ color: '#131316', backgroundColor: ch.color }}>
                Current
              </span>
            )}
            {isLocked && <Lock className="w-3.5 h-3.5 text-sa-cream-faint opacity-40" />}
          </div>
          <p className={`text-[0.85rem] leading-relaxed ${unlocked ? 'text-sa-cream-muted' : isNext ? 'text-sa-cream-soft mb-2.5' : 'text-sa-cream-faint mb-2.5'}`}>
            {milestone.description}
          </p>
          {!unlocked && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[0.72rem] px-2.5 py-1 rounded-sa-sm" style={{
                color: isNext ? ch.color : 'var(--cream-faint)',
                backgroundColor: isNext ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isNext ? ch.border : 'rgba(255,255,255,0.06)'}`,
              }}>
                {milestone.requirement}
              </span>
            </div>
          )}
          {isNext && progress && (
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${ch.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.75rem] font-medium" style={{ color: ch.color }}>Progress</span>
                <span className="text-[0.8rem] font-medium tabular-nums" style={{ color: ch.color }}>
                  {progress.current} / {progress.target}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-700 ease-out" style={{
                  width: `${progressPct}%`, backgroundColor: ch.color, boxShadow: `0 0 12px ${ch.glow}`,
                }} />
              </div>
              {progressPct > 0 && progressPct < 100 && (
                <p className="text-[0.7rem] text-sa-cream-faint mt-1.5">{progress.target - progress.current} more to unlock</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChapterHeader({ chapter }: { chapter: MilestoneChapter }) {
  const ch = CHAPTER_META[chapter];
  return (
    <div className="flex items-center gap-4 mb-6 mt-3">
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: ch.color, boxShadow: `0 0 8px ${ch.glow}` }} />
      <div>
        <span className="text-[0.72rem] font-medium uppercase tracking-[0.16em] block" style={{ color: ch.color }}>{ch.label}</span>
        <span className="text-[0.75rem] text-sa-cream-faint">{ch.subtitle}</span>
      </div>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${ch.border}, transparent 80%)` }} />
    </div>
  );
}

function MilestoneRankHeader({ unlocked, total, rank }: { unlocked: number; total: number; rank: { title: string; next: string | null } }) {
  const pct = total > 0 ? (unlocked / total) * 100 : 0;
  const color = pct >= 80 ? '#6ECB8B' : pct >= 40 ? '#6DB5F5' : '#C5A55A';
  const sz = 88, sw = 3, r = (sz - sw * 2) / 2, circ = 2 * Math.PI * r, off = circ - (pct / 100) * circ;
  return (
    <div className="sa-card-elevated mb-8">
      <div className="flex items-center justify-between flex-wrap gap-5">
        <div className="flex items-center gap-5">
          <div className="relative" style={{ width: sz, height: sz }}>
            <svg width={sz} height={sz} className="transform -rotate-90">
              <circle cx={sz / 2} cy={sz / 2} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth={sw} fill="none" />
              <circle cx={sz / 2} cy={sz / 2} r={r} stroke={color} strokeWidth={sw} fill="none"
                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-xl text-sa-cream">{unlocked}</span>
              <span className="text-[0.55rem] text-sa-cream-faint">/ {total}</span>
            </div>
          </div>
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.15em] text-sa-cream-faint mb-0.5">Current Rank</p>
            <p className="font-serif text-xl text-sa-cream">{rank.title}</p>
            {rank.next && <p className="text-[0.7rem] text-sa-cream-faint mt-0.5">Next: <span style={{ color }}>{rank.next}</span></p>}
          </div>
        </div>
        <div className="flex gap-2">
          {(['foundation', 'momentum', 'mastery'] as const).map(c => {
            const meta = CHAPTER_META[c];
            const tot = MILESTONES.filter(m => m.chapter === c).length;
            const start = c === 'foundation' ? 0 : c === 'momentum' ? 5 : 10;
            const dn = Math.max(0, Math.min(unlocked - start, tot));
            return (
              <div key={c} className="text-center px-3 py-2 rounded-sa" style={{ backgroundColor: `${meta.color}10` }}>
                <span className="block font-serif text-base" style={{ color: meta.color }}>{dn}</span>
                <span className="text-[0.55rem] text-sa-cream-faint">/{tot}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export function AchievementsView({
  nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, userId,
  systemReports, onSaveSystemReport,
}: AchievementsViewProps) {
  const reports = systemReports;
  const [expandedReport, setExpandedReport] = useState<SystemReport | null>(null);
  const [activeSection, setActiveSection] = useState<'milestones' | 'reports'>('milestones');

  // ── Milestone computation ──
  const ctx = useMemo(() => computeMilestoneCtx(nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, systemReports), [nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, systemReports]);
  const { unlockedCount, nextIndex } = useMemo(() => {
    let count = 0;
    for (const m of MILESTONES) { if (m.check(ctx)) count++; else break; }
    return { unlockedCount: count, nextIndex: count < MILESTONES.length ? count : null };
  }, [ctx]);
  const rank = useMemo(() => getRankFromCount(unlockedCount), [unlockedCount]);
  const status = useMemo(() => getMilestoneStatus(unlockedCount, nextIndex, ctx), [unlockedCount, nextIndex, ctx]);
  const chapters: { chapter: MilestoneChapter; milestones: { def: MilestoneDef; index: number }[] }[] = [
    { chapter: 'foundation', milestones: MILESTONES.slice(0, 5).map((m, i) => ({ def: m, index: i })) },
    { chapter: 'momentum', milestones: MILESTONES.slice(5, 10).map((m, i) => ({ def: m, index: i + 5 })) },
    { chapter: 'mastery', milestones: MILESTONES.slice(10, 15).map((m, i) => ({ def: m, index: i + 10 })) },
  ];

  // ── Report logic (original, unchanged) ──
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);
  const hasCurrentReport = reports.some(r => r.month === currentMonth);

  const autoGenRan = useRef(false);
  useEffect(() => {
    if (autoGenRan.current) return;
    if (reports.length === 0 && nonNegotiables.length === 0 && habits.length === 0) return;
    const allDates = [
      ...nnCompletions.map(c => c.completion_date),
      ...habitCompletions.map(c => c.completion_date),
      ...dailyTasks.map(t => t.task_date),
    ].filter(Boolean).sort();
    if (allDates.length === 0) return;
    const firstMonth = allDates[0].substring(0, 7);
    const months: string[] = [];
    const [fy, fm] = firstMonth.split('-').map(Number);
    const [cy, cm] = currentMonth.split('-').map(Number);
    let y = fy, m = fm;
    while (y < cy || (y === cy && m < cm)) {
      months.push(`${y}-${String(m).padStart(2, '0')}`);
      m++; if (m > 12) { m = 1; y++; }
    }
    const existingMonths = new Set(reports.map(r => r.month));
    const missingMonths = months.filter(mo => !existingMonths.has(mo));
    if (missingMonths.length === 0) { autoGenRan.current = true; return; }
    const sortedExisting = [...reports].sort((a, b) => a.month.localeCompare(b.month));
    let prevReport: SystemReport | null = sortedExisting.length > 0 ? sortedExisting[sortedExisting.length - 1] : null;
    for (const mo of missingMonths) {
      const report = generateMonthlyReport(mo, nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, prevReport, userId);
      const hadActivity = [
        ...nnCompletions.filter(c => c.completion_date.startsWith(mo)),
        ...habitCompletions.filter(c => c.completion_date.startsWith(mo)),
        ...dailyTasks.filter(t => t.task_date.startsWith(mo)),
      ].length > 0;
      if (hadActivity) { onSaveSystemReport(report); prevReport = report; }
    }
    autoGenRan.current = true;
  }, [reports, nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, currentMonth, userId, onSaveSystemReport]);

  const handleGenerate = () => {
    const sorted = [...reports].sort((a, b) => b.month.localeCompare(a.month));
    const report = generateMonthlyReport(currentMonth, nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, sorted[0] || null, userId);
    onSaveSystemReport(report);
    setExpandedReport(report);
  };

  const sortedReports = useMemo(() => [...reports].sort((a, b) => b.month.localeCompare(a.month)), [reports]);
  const stats = useMemo(() => {
    if (reports.length === 0) return null;
    const avg = Math.round(reports.reduce((sum, r) => sum + r.score, 0) / reports.length);
    const best = Math.max(...reports.map(r => r.score));
    const goldCount = reports.filter(r => r.tier === 'gold' || r.tier === 'diamond').length;
    return { avg, best, goldCount, total: reports.length };
  }, [reports]);

  return (
    <div className="pt-6 max-w-2xl mx-auto">
      <style>{`
        @keyframes nodePulse { 0%,100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.5); opacity: 0.1; } }
      `}</style>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-5 h-5 text-sa-gold opacity-80" />
          <h2 className="font-serif text-2xl text-sa-cream">Achievements</h2>
        </div>
        <p className="text-sm text-sa-cream-muted">Your operational history. Milestones earned. Performance recorded.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-8 animate-rise delay-1">
        {(['milestones', 'reports'] as const).map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`px-4 py-2 text-xs font-medium rounded-sa-sm transition-colors ${activeSection === s ? 'text-sa-gold bg-sa-gold-soft' : 'text-sa-cream-muted hover:text-sa-cream-soft'}`}>
            {s === 'milestones' ? 'Milestones' : 'System Reports'}
          </button>
        ))}
      </div>

      {/* ════ MILESTONES TAB ════ */}
      {activeSection === 'milestones' && (
        <div className="animate-rise delay-2">
          <MilestoneRankHeader unlocked={unlockedCount} total={MILESTONES.length} rank={rank} />
          <div className="mb-8 px-5 py-4 rounded-sa border flex items-start gap-3" style={{
            borderColor: `${status.color}40`, backgroundColor: `${status.color}08`,
          }}>
            <span className="text-base flex-shrink-0 mt-px" style={{ color: status.color }}>
              {unlockedCount === MILESTONES.length ? '\u25cf' : '\u25c6'}
            </span>
            <p className="text-sm leading-relaxed" style={{ color: status.color }}>{status.message}</p>
          </div>
          {chapters.map(({ chapter, milestones: ms }) => (
            <div key={chapter}>
              <ChapterHeader chapter={chapter} />
              <div className="ml-1">
                {ms.map(({ def, index }) => (
                  <MilestoneCard key={def.id} milestone={def} index={index}
                    unlocked={index < unlockedCount} isNext={index === nextIndex}
                    isLocked={index > (nextIndex ?? unlockedCount)} ctx={ctx} />
                ))}
              </div>
            </div>
          ))}
          {unlockedCount === MILESTONES.length && (
            <div className="mt-8 py-8 px-8 text-center rounded-sa-lg" style={{ border: '1px solid rgba(110,203,139,0.3)', backgroundColor: 'rgba(110,203,139,0.06)' }}>
              <Gem className="w-8 h-8 text-sa-green mx-auto mb-3" />
              <p className="font-serif text-xl text-sa-green mb-1">All milestones unlocked.</p>
              <p className="text-sm text-sa-cream-muted">Full Stack rank achieved. Peak operational capacity.</p>
            </div>
          )}
        </div>
      )}

      {/* ════ REPORTS TAB (original layout, unchanged) ════ */}
      {activeSection === 'reports' && (
        <div className="animate-rise delay-2">
          {reports.length === 0 ? (
            <EmptyState onGenerate={handleGenerate} />
          ) : (
            <>
              {stats && (
                <div className="grid grid-cols-4 gap-2 mb-8">
                  {[
                    { label: 'Reports', value: stats.total },
                    { label: 'Avg Score', value: stats.avg },
                    { label: 'Best', value: stats.best },
                    { label: 'Gold+', value: stats.goldCount },
                  ].map(s => (
                    <div key={s.label} className="text-center py-3 rounded-sa"
                      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="block font-serif text-lg text-sa-cream">{s.value}</span>
                      <span className="text-[0.6rem] uppercase tracking-wider text-sa-cream-faint">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mb-6">
                <button onClick={handleGenerate}
                  className={hasCurrentReport ? 'sa-btn-secondary w-full' : 'sa-btn-primary w-full'}>
                  {hasCurrentReport ? `Update ${getMonthLabel(currentMonth)} Report` : `Generate ${getMonthLabel(currentMonth)} Report`}
                </button>
              </div>
              <div className="space-y-3">
                {sortedReports.map((report, i) => (
                  <div key={report.id} className="animate-rise" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                    <SystemCard report={report} onClick={() => setExpandedReport(report)} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {expandedReport && (
        <ExpandedReport report={expandedReport} onClose={() => setExpandedReport(null)} />
      )}
    </div>
  );
}
