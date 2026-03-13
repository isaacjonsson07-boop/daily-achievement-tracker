import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Target, Flame, Calendar, CheckCircle, AlertTriangle, X,
  Zap, Shield, FileText, Award, Star, Clock, Gem, Anchor, Power, Lock } from 'lucide-react';
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

// ═══════════════════════════════════════════════════════
// MILESTONE SYSTEM
// ═══════════════════════════════════════════════════════

type MilestoneChapter = 'foundation' | 'momentum' | 'mastery';

interface MilestoneDef {
  id: string;
  title: string;
  description: string;
  chapter: MilestoneChapter;
  icon: React.ElementType;
  check: (ctx: MilestoneContext) => boolean;
  requirement: string;
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
  totalHabitCompletions: number;
  longestStreak80: number;
  longestNNStreak: number;
  hasAnyFullDay: boolean;
}

const CHAPTER_CONFIG: Record<MilestoneChapter, { label: string; subtitle: string; color: string; colorSoft: string; border: string }> = {
  foundation: { label: 'Foundation', subtitle: 'Configure your system', color: '#C5A55A', colorSoft: 'rgba(197,165,90,0.08)', border: 'rgba(197,165,90,0.25)' },
  momentum: { label: 'Momentum', subtitle: 'Build consistent execution', color: '#6DB5F5', colorSoft: 'rgba(109,181,245,0.08)', border: 'rgba(109,181,245,0.25)' },
  mastery: { label: 'Mastery', subtitle: 'Prove operational excellence', color: '#6ECB8B', colorSoft: 'rgba(110,203,139,0.08)', border: 'rgba(110,203,139,0.25)' },
};

const MILESTONES: MilestoneDef[] = [
  // ── Foundation (Gold) ──
  { id: 'system-online', title: 'System Online', description: 'Configure at least 1 non-negotiable and 1 habit.', chapter: 'foundation', icon: Power,
    check: (ctx) => ctx.activeNNs.length >= 1 && ctx.habits.length >= 1, requirement: '1 non-negotiable + 1 habit' },
  { id: 'first-execution', title: 'First Execution', description: 'Complete 100% of all items in a single day.', chapter: 'foundation', icon: Zap,
    check: (ctx) => ctx.hasAnyFullDay, requirement: '100% on any day' },
  { id: 'week-one', title: 'Week One', description: 'Be active for 7 days total.', chapter: 'foundation', icon: Calendar,
    check: (ctx) => ctx.totalActiveDays >= 7, requirement: '7 active days' },
  { id: 'grounded', title: 'Grounded', description: '14 total active days. Your system has roots.', chapter: 'foundation', icon: Anchor,
    check: (ctx) => ctx.totalActiveDays >= 14, requirement: '14 active days' },
  { id: 'executor', title: 'Executor', description: 'Complete 25 tasks. Proof of consistent output.', chapter: 'foundation', icon: CheckCircle,
    check: (ctx) => ctx.totalTasksCompleted >= 25, requirement: '25 tasks completed' },
  // ── Momentum (Blue) ──
  { id: '7-day-streak', title: '7-Day Streak', description: '7 consecutive days at 80%+ completion.', chapter: 'momentum', icon: Flame,
    check: (ctx) => ctx.longestStreak80 >= 7, requirement: '7-day streak at 80%+' },
  { id: 'nn-lock', title: 'Non-Negotiable Lock', description: '7 days straight without missing a single NN.', chapter: 'momentum', icon: Shield,
    check: (ctx) => ctx.longestNNStreak >= 7, requirement: '7-day perfect NN streak' },
  { id: 'first-report', title: 'First Report', description: 'Generate your first monthly System Report.', chapter: 'momentum', icon: FileText,
    check: (ctx) => ctx.systemReports.length >= 1, requirement: 'Generate 1 report' },
  { id: 'fifty-tasks', title: 'Half Century', description: '50 tasks completed. Steady operational output.', chapter: 'momentum', icon: Target,
    check: (ctx) => ctx.totalTasksCompleted >= 50, requirement: '50 tasks completed' },
  { id: 'silver-caliber', title: 'Silver Caliber', description: 'Earn a Silver tier or higher in a monthly report.', chapter: 'momentum', icon: Award,
    check: (ctx) => ctx.systemReports.some(r => ['silver','gold','diamond'].includes(r.tier)), requirement: 'Silver+ monthly report' },
  // ── Mastery (Green) ──
  { id: '14-day-streak', title: '14-Day Streak', description: 'Two weeks of unbroken execution at 80%+.', chapter: 'mastery', icon: TrendingUp,
    check: (ctx) => ctx.longestStreak80 >= 14, requirement: '14-day streak at 80%+' },
  { id: 'gold-standard', title: 'Gold Standard', description: 'Earn Gold tier in a monthly System Report.', chapter: 'mastery', icon: Star,
    check: (ctx) => ctx.systemReports.some(r => ['gold','diamond'].includes(r.tier)), requirement: 'Gold monthly report' },
  { id: 'century', title: 'Century', description: '100 tasks completed. Relentless execution.', chapter: 'mastery', icon: Target,
    check: (ctx) => ctx.totalTasksCompleted >= 100, requirement: '100 tasks completed' },
  { id: '30-day-operator', title: '30-Day Operator', description: '30 active days. Your system runs on autopilot.', chapter: 'mastery', icon: Clock,
    check: (ctx) => ctx.totalActiveDays >= 30, requirement: '30 active days' },
  { id: 'diamond-operator', title: 'Diamond Operator', description: 'Earn a perfect Diamond report. Peak capacity.', chapter: 'mastery', icon: Gem,
    check: (ctx) => ctx.systemReports.some(r => r.tier === 'diamond'), requirement: 'Diamond monthly report (100%)' },
];

function getRank(unlocked: number): { title: string; next: string | null } {
  if (unlocked >= 14) return { title: 'Full Stack', next: null };
  if (unlocked >= 10) return { title: 'Architect', next: 'Full Stack' };
  if (unlocked >= 6) return { title: 'Operator', next: 'Architect' };
  if (unlocked >= 3) return { title: 'Initiate', next: 'Operator' };
  return { title: 'Newcomer', next: 'Initiate' };
}

// ═══════════════════════════════════════════════════════
// MILESTONE COMPUTATION
// ═══════════════════════════════════════════════════════

function computeMilestoneContext(
  nonNegotiables: NonNegotiable[], nnCompletions: NonNegotiableCompletion[],
  habits: Habit[], habitCompletions: HabitCompletion[],
  dailyTasks: DailyTask[], systemReports: SystemReport[],
): MilestoneContext {
  const activeNNs = nonNegotiables.filter(n => n.active);

  const allDates = new Set<string>();
  nnCompletions.forEach(c => allDates.add(c.completion_date));
  habitCompletions.forEach(c => allDates.add(c.completion_date));
  dailyTasks.filter(t => t.completed).forEach(t => allDates.add(t.task_date));

  const totalActiveDays = allDates.size;
  const totalTasksCompleted = dailyTasks.filter(t => t.completed).length;
  const totalHabitCompletions = habitCompletions.length;

  const sortedDates = Array.from(allDates).sort();

  // Build eval range from first activity to today
  const evalDates: string[] = [];
  if (sortedDates.length > 0) {
    const start = new Date(sortedDates[0] + 'T00:00:00');
    const end = new Date();
    const cursor = new Date(start);
    while (cursor <= end) { evalDates.push(fmtDateISO(cursor)); cursor.setDate(cursor.getDate() + 1); }
  }

  let hasAnyFullDay = false;
  let longestStreak80 = 0, currentStreak80 = 0;
  let longestNNStreak = 0, currentNNStreak = 0;

  for (const date of evalDates) {
    const d = new Date(date + 'T00:00:00');
    const dayIndex = d.getDay();
    const dayStart = d.getTime();

    const nnsForDay = activeNNs.filter(nn => new Date(nn.created_at).getTime() <= dayStart + 86400000);
    const nnDone = nnsForDay.filter(nn => nnCompletions.some(c => c.non_negotiable_id === nn.id && c.completion_date === date)).length;

    const habitsForDay = habits.filter(h => h.days_of_week.includes(dayIndex) && new Date(h.created_at).getTime() <= dayStart + 86400000);
    const habitsDone = habitsForDay.filter(h => habitCompletions.some(c => c.habit_id === h.id && c.completion_date === date)).length;

    const tasksForDay = dailyTasks.filter(t => t.task_date === date);
    const tasksDone = tasksForDay.filter(t => t.completed).length;

    const total = nnsForDay.length + habitsForDay.length + tasksForDay.length;
    const done = nnDone + habitsDone + tasksDone;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    if (pct === 100 && total > 0) hasAnyFullDay = true;

    // 80%+ streak
    if (pct >= 80 && total > 0) { currentStreak80++; longestStreak80 = Math.max(longestStreak80, currentStreak80); }
    else { currentStreak80 = 0; }

    // NN perfect streak
    if (nnsForDay.length > 0 && nnDone === nnsForDay.length) { currentNNStreak++; longestNNStreak = Math.max(longestNNStreak, currentNNStreak); }
    else if (nnsForDay.length > 0) { currentNNStreak = 0; }
  }

  return {
    activeNNs, habits, nnCompletions, habitCompletions, dailyTasks, systemReports,
    totalActiveDays, totalTasksCompleted, totalHabitCompletions,
    longestStreak80, longestNNStreak, hasAnyFullDay,
  };
}

// ═══════════════════════════════════════════════════════
// MILESTONE UI COMPONENTS
// ═══════════════════════════════════════════════════════

function MilestoneNode({ milestone, unlocked, isNext }: { milestone: MilestoneDef; unlocked: boolean; isNext: boolean }) {
  const ch = CHAPTER_CONFIG[milestone.chapter];
  const Icon = milestone.icon;

  return (
    <div className={`relative flex items-start gap-4 py-4 px-5 rounded-sa-lg border transition-all duration-300 ${
      unlocked ? '' : isNext ? '' : 'border-sa-border opacity-50'
    }`} style={{
      borderColor: unlocked ? ch.border : isNext ? ch.border : undefined,
      backgroundColor: unlocked ? ch.colorSoft : isNext ? 'rgba(255,255,255,0.02)' : 'transparent',
      ...(isNext && !unlocked ? { animation: 'milestonePulse 2.5s ease-in-out infinite' } : {}),
    }}>
      {unlocked && <div className="absolute inset-0 rounded-sa-lg pointer-events-none" style={{ boxShadow: `inset 0 0 30px ${ch.colorSoft}, 0 0 15px ${ch.colorSoft}` }} />}

      {/* Icon */}
      <div className={`relative flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${unlocked ? '' : 'border border-dashed'}`}
        style={{
          backgroundColor: unlocked ? ch.color : 'transparent',
          borderColor: unlocked ? 'transparent' : isNext ? ch.color : 'var(--cream-faint)',
          boxShadow: unlocked ? `0 0 12px ${ch.border}` : 'none',
        }}>
        {unlocked
          ? <Icon className="w-5 h-5" style={{ color: '#131316' }} strokeWidth={2.2} />
          : <Icon className="w-5 h-5" style={{ color: isNext ? ch.color : 'var(--cream-faint)' }} strokeWidth={1.5} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`font-serif text-[1.05rem] ${unlocked ? 'text-sa-cream' : isNext ? 'text-sa-cream-soft' : 'text-sa-cream-faint'}`}>{milestone.title}</span>
          {unlocked && <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: ch.color }} strokeWidth={2.5} />}
          {isNext && !unlocked && (
            <span className="text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-full font-medium"
              style={{ color: ch.color, backgroundColor: ch.colorSoft, border: `1px solid ${ch.border}` }}>Next</span>
          )}
        </div>
        <p className={`text-[0.82rem] leading-relaxed ${unlocked ? 'text-sa-cream-muted' : 'text-sa-cream-faint'}`}>{milestone.description}</p>
        {!unlocked && <p className="text-[0.72rem] mt-1.5" style={{ color: isNext ? ch.color : 'var(--cream-faint)' }}>{milestone.requirement}</p>}
      </div>

      {!unlocked && !isNext && <Lock className="w-4 h-4 flex-shrink-0 text-sa-cream-faint mt-1 opacity-40" />}
    </div>
  );
}

function ChapterSection({ chapter, milestones, unlockedIds, nextId }: { chapter: MilestoneChapter; milestones: MilestoneDef[]; unlockedIds: Set<string>; nextId: string | null }) {
  const config = CHAPTER_CONFIG[chapter];
  const chapterMs = milestones.filter(m => m.chapter === chapter);
  const done = chapterMs.filter(m => unlockedIds.has(m.id)).length;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: config.color }} />
        <span className="text-[0.75rem] font-medium uppercase tracking-[0.14em]" style={{ color: config.color }}>{config.label}</span>
        <span className="text-[0.7rem] text-sa-cream-faint">{done}/{chapterMs.length}</span>
      </div>
      <p className="text-[0.85rem] text-sa-cream-faint mb-5 ml-[22px]">{config.subtitle}</p>

      <div className="relative ml-[20px]">
        <div className="absolute left-[2px] top-6 bottom-6 w-px" style={{ background: `linear-gradient(to bottom, ${config.border}, rgba(255,255,255,0.04))` }} />
        <div className="space-y-2">
          {chapterMs.map(m => (
            <div key={m.id} className="relative">
              <div className="absolute -left-[5px] top-[26px] w-[11px] h-[11px] rounded-full z-10" style={{
                backgroundColor: unlockedIds.has(m.id) ? config.color : 'var(--bg-warm)',
                border: `2px solid ${unlockedIds.has(m.id) ? config.color : 'var(--cream-faint)'}`,
                boxShadow: unlockedIds.has(m.id) ? `0 0 8px ${config.border}` : 'none',
              }} />
              <div className="ml-5"><MilestoneNode milestone={m} unlocked={unlockedIds.has(m.id)} isNext={m.id === nextId} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MilestoneProgressRing({ unlocked, total, rank }: { unlocked: number; total: number; rank: { title: string; next: string | null } }) {
  const pct = total > 0 ? (unlocked / total) * 100 : 0;
  const size = 100;
  const sw = 3.5;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? '#6ECB8B' : pct >= 40 ? '#6DB5F5' : '#C5A55A';

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth={sw} fill="none" />
          <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={sw} fill="none"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-2xl text-sa-cream">{unlocked}</span>
          <span className="text-[0.6rem] text-sa-cream-faint">/ {total}</span>
        </div>
      </div>
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-cream-faint mb-1">Current Rank</p>
        <p className="font-serif text-xl text-sa-cream">{rank.title}</p>
        {rank.next && <p className="text-[0.75rem] text-sa-cream-faint mt-1">Next rank: <span style={{ color }}>{rank.next}</span></p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EXISTING REPORT COMPONENTS (preserved)
// ═══════════════════════════════════════════════════════

function getMonthLabel(month: string): string { const [y,m] = month.split('-'); return new Date(parseInt(y), parseInt(m)-1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); }
function getShortMonthLabel(month: string): string { const [y,m] = month.split('-'); return new Date(parseInt(y), parseInt(m)-1).toLocaleDateString('en-US', { month: 'short' }); }
function getYearLabel(month: string): string { return month.split('-')[0]; }

function DiamondFrame() {
  const cs = (t: string): React.CSSProperties => ({ position: 'absolute', width: '85px', height: '85px', opacity: 0.85, transform: t, pointerEvents: 'none', filter: 'drop-shadow(0 0 6px rgba(184,212,232,0.4))' });
  return (<div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">
    <img src="/corner-diamond.svg" alt="" style={{ ...cs('scaleY(-1)'), top: 0, left: 0 }} />
    <img src="/corner-diamond.svg" alt="" style={{ ...cs('scale(-1,-1)'), top: 0, right: 0 }} />
    <img src="/corner-diamond.svg" alt="" style={{ ...cs('none'), bottom: 0, left: 0 }} />
    <img src="/corner-diamond.svg" alt="" style={{ ...cs('scaleX(-1)'), bottom: 0, right: 0 }} />
  </div>);
}

function GoldFrame() {
  const cs = (t: string): React.CSSProperties => ({ position: 'absolute', width: '65px', height: '65px', opacity: 0.75, transform: t, pointerEvents: 'none', filter: 'drop-shadow(0 0 4px rgba(197,165,90,0.3))' });
  return (<div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">
    <img src="/corner-gold.svg" alt="" style={{ ...cs('none'), top: 0, left: 0 }} />
    <img src="/corner-gold.svg" alt="" style={{ ...cs('scaleX(-1)'), top: 0, right: 0 }} />
    <img src="/corner-gold.svg" alt="" style={{ ...cs('scaleY(-1)'), bottom: 0, left: 0 }} />
    <img src="/corner-gold.svg" alt="" style={{ ...cs('scale(-1,-1)'), bottom: 0, right: 0 }} />
  </div>);
}

function SilverFrame({ color }: { color: string }) {
  const paths = [
    ['top-0 left-0', 'M4 24 L4 8 C4 6,6 4,8 4 L24 4', 'M8 4 L4 4 L4 8'],
    ['top-0 right-0', 'M44 24 L44 8 C44 6,42 4,40 4 L24 4', 'M40 4 L44 4 L44 8'],
    ['bottom-0 left-0', 'M4 24 L4 40 C4 42,6 44,8 44 L24 44', 'M8 44 L4 44 L4 40'],
    ['bottom-0 right-0', 'M44 24 L44 40 C44 42,42 44,40 44 L24 44', 'M40 44 L44 44 L44 40'],
  ];
  return (<div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">
    {paths.map(([pos, d1, d2], i) => (<svg key={i} className={`absolute ${pos} w-12 h-12`} viewBox="0 0 48 48" fill="none"><path d={d1} stroke={color} strokeWidth="1" /><path d={d2} stroke={color} strokeWidth="1.5" /></svg>))}
  </div>);
}

function BronzeFrame({ color }: { color: string }) {
  const paths = [['top-0 left-0','M4 16 L4 6 C4 5,5 4,6 4 L16 4'],['top-0 right-0','M28 16 L28 6 C28 5,27 4,26 4 L16 4'],['bottom-0 left-0','M4 16 L4 26 C4 27,5 28,6 28 L16 28'],['bottom-0 right-0','M28 16 L28 26 C28 27,27 28,26 28 L16 28']];
  return (<div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">
    {paths.map(([pos, d], i) => (<svg key={i} className={`absolute ${pos} w-8 h-8`} viewBox="0 0 32 32" fill="none"><path d={d} stroke={color} strokeWidth="1" /></svg>))}
  </div>);
}

function TierFrame({ tier }: { tier: ReportTier }) {
  const c = TIER_CONFIG[tier]; switch (tier) { case 'diamond': return <DiamondFrame />; case 'gold': return <GoldFrame />; case 'silver': return <SilverFrame color={c.color} />; case 'bronze': return <BronzeFrame color={c.color} />; }
}

function ScoreRing({ score, tier, size = 80 }: { score: number; tier: ReportTier; size?: number }) {
  const c = TIER_CONFIG[tier]; const sw = 3; const r = (size-sw*2)/2; const circ = 2*Math.PI*r; const off = circ-(score/100)*circ;
  return (<div className="relative" style={{ width: size, height: size }}><svg width={size} height={size} className="transform -rotate-90"><circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth={sw} fill="none" /><circle cx={size/2} cy={size/2} r={r} stroke={c.color} strokeWidth={sw} fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-serif text-xl" style={{ color: c.color }}>{score}</span></div></div>);
}

function DeltaBadge({ delta }: { delta?: number }) {
  if (delta === undefined || delta === null) return null;
  if (delta > 0) return <span className="inline-flex items-center gap-1 text-xs text-sa-green"><TrendingUp className="w-3 h-3" />+{delta} <span className="text-sa-cream-faint">vs last</span></span>;
  if (delta < 0) return <span className="inline-flex items-center gap-1 text-xs text-sa-rose"><TrendingDown className="w-3 h-3" />{delta} <span className="text-sa-cream-faint">vs last</span></span>;
  return <span className="inline-flex items-center gap-1 text-xs text-sa-cream-faint"><Minus className="w-3 h-3" />0 vs last</span>;
}

function CategoryBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (<div className="space-y-1.5"><div className="flex items-center justify-between"><span className="text-xs text-sa-cream-muted">{label}</span><span className="text-xs font-medium tabular-nums" style={{ color }}>{score}%</span></div><div className="w-full h-1.5 bg-sa-bg-lift rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${score}%`, backgroundColor: color }} /></div></div>);
}

function SystemCard({ report, onClick }: { report: SystemReport; onClick: () => void }) {
  const c = TIER_CONFIG[report.tier];
  return (
    <button onClick={onClick} className="w-full text-left group relative rounded-sa-lg transition-all duration-200 hover:scale-[1.01]"
      style={{ border: `1px solid ${c.border}`, backgroundColor: c.bg }}>
      <div className="relative p-5"><div className="flex items-center gap-4">
        <ScoreRing score={report.score} tier={report.tier} size={64} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-serif text-base text-sa-cream">{getShortMonthLabel(report.month)}</span>
            <span className="text-xs text-sa-cream-faint">{getYearLabel(report.month)}</span>
            {report.isInstallationReport && <span className="text-[0.6rem] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: c.color, backgroundColor: c.bg, border: `1px solid ${c.border}` }}>Day 21</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: c.color }}>{c.label}</span>
            <DeltaBadge delta={report.scoreDelta} />
          </div>
          {report.scoreCapped && <div className="flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3 text-sa-cream-faint" /><span className="text-[0.65rem] text-sa-cream-faint">Below minimums — score capped</span></div>}
        </div>
      </div></div>
    </button>
  );
}

function ExpandedReport({ report, onClose }: { report: SystemReport; onClose: () => void }) {
  const c = TIER_CONFIG[report.tier]; const isDiamond = report.tier === 'diamond';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-lg rounded-sa-lg" onClick={e => e.stopPropagation()}
        style={{ border: `1px solid ${c.border}`, backgroundColor: '#151518',
          boxShadow: isDiamond ? '0 0 40px rgba(184,212,232,0.10),0 0 80px rgba(184,212,232,0.04)' : report.tier === 'gold' ? '0 0 30px rgba(197,165,90,0.08)' : 'none' }}>
        <TierFrame tier={report.tier} />
        <div className="max-h-[90vh] overflow-y-auto rounded-sa-lg">
          <div className="relative z-20 p-8 sm:p-10">
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-sa-cream-faint hover:text-sa-cream transition-colors rounded-sa-sm hover:bg-sa-bg-lift z-30"><X className="w-4 h-4" /></button>
            <div className="text-center mb-8">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-sa-cream-faint mb-3">System Report</p>
              <h2 className="font-serif text-2xl text-sa-cream mb-1">{getMonthLabel(report.month)}</h2>
              {report.isInstallationReport && <p className="text-xs mt-1" style={{ color: c.color }}>Installation Complete — Day 21</p>}
              <div className="flex justify-center mt-6 mb-3"><ScoreRing score={report.score} tier={report.tier} size={100} /></div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-sm font-medium uppercase tracking-wider" style={{ color: c.color }}>{c.label}</span>
                <DeltaBadge delta={report.scoreDelta} />
              </div>
              {report.scoreCapped && <div className="flex items-center justify-center gap-1.5 mt-2"><AlertTriangle className="w-3.5 h-3.5 text-sa-cream-faint" /><span className="text-xs text-sa-cream-faint">Score capped at 75 — below system minimums</span></div>}
            </div>
            <div className="h-px mb-6" style={{ background: `linear-gradient(90deg, transparent, ${c.border}, transparent)` }} />
            <div className="space-y-4 mb-8">
              <p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-cream-faint">Performance Breakdown</p>
              <CategoryBar label={`Habits (${report.habitsCount} tracked)`} score={report.habitsScore} color={c.color} />
              <CategoryBar label={`Tasks (avg ${report.tasksAvgPerDay}/day)`} score={report.tasksScore} color={c.color} />
              <CategoryBar label={`Non-Negotiables (${report.nnCount} active)`} score={report.nnScore} color={c.color} />
            </div>
            {!report.meetsMinimums && <div className="mb-6 p-3 rounded-sa text-xs text-sa-cream-faint" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}><p className="font-medium text-sa-cream-muted mb-1">Below system minimums</p><p>Full scoring requires {report.habitsCount < 3 ? `3+ habits (you have ${report.habitsCount})` : ''}{report.habitsCount < 3 && report.tasksAvgPerDay < 3 ? ', ' : ''}{report.tasksAvgPerDay < 3 ? `3+ tasks/day avg (you avg ${report.tasksAvgPerDay})` : ''}{(report.habitsCount < 3 || report.tasksAvgPerDay < 3) && report.nnCount < 2 ? ', ' : ''}{report.nnCount < 2 ? `2+ non-negotiables (you have ${report.nnCount})` : ''}.</p></div>}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[{ icon: CheckCircle, label: 'Tasks Done', value: String(report.totalTasksCompleted), suffix: '' },
                { icon: Flame, label: 'Streak', value: String(report.longestStreak), suffix: 'days' },
                { icon: Calendar, label: 'Days Active', value: String(report.totalDaysActive), suffix: '' },
                { icon: Target, label: 'Score', value: String(report.score), suffix: '/100', useColor: true },
              ].map(stat => { const SI = stat.icon; return (
                <div key={stat.label} className="p-3 rounded-sa" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-1.5 mb-1"><SI className="w-3.5 h-3.5" style={{ color: c.color }} /><span className="text-[0.65rem] uppercase tracking-wider text-sa-cream-faint">{stat.label}</span></div>
                  <span className="font-serif text-xl" style={{ color: (stat as any).useColor ? c.color : 'var(--cream)' }}>{stat.value}{stat.suffix && <span className="text-sm text-sa-cream-faint ml-1">{stat.suffix}</span>}</span>
                </div>); })}
            </div>
            <div className="mb-2 text-center">
              <div className="h-px mb-5" style={{ background: `linear-gradient(90deg, transparent, ${c.border}, transparent)` }} />
              <p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-cream-faint mb-3">Personal Highlight</p>
              <p className="text-sm text-sa-cream-soft italic leading-relaxed">"{report.personalHighlight}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

export function AchievementsView({
  nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, userId,
  systemReports, onSaveSystemReport,
}: AchievementsViewProps) {
  const reports = systemReports;
  const [expandedReport, setExpandedReport] = useState<SystemReport | null>(null);
  const [activeSection, setActiveSection] = useState<'milestones' | 'reports'>('milestones');

  // Milestone computation
  const milestoneCtx = useMemo(() => computeMilestoneContext(nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, systemReports), [nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, systemReports]);

  const { unlockedIds, nextId } = useMemo(() => {
    const ids = new Set<string>();
    let next: string | null = null;
    for (const m of MILESTONES) { if (m.check(milestoneCtx)) { ids.add(m.id); } else if (!next) { next = m.id; } }
    return { unlockedIds: ids, nextId: next };
  }, [milestoneCtx]);

  const rank = useMemo(() => getRank(unlockedIds.size), [unlockedIds]);

  // Report logic
  const currentMonth = useMemo(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`; }, []);
  const hasCurrentReport = reports.some(r => r.month === currentMonth);

  const autoGenRan = useRef(false);
  useEffect(() => {
    if (autoGenRan.current) return;
    if (reports.length === 0 && nonNegotiables.length === 0 && habits.length === 0) return;
    const allDates = [...nnCompletions.map(c => c.completion_date), ...habitCompletions.map(c => c.completion_date), ...dailyTasks.map(t => t.task_date)].filter(Boolean).sort();
    if (allDates.length === 0) return;
    const firstMonth = allDates[0].substring(0, 7);
    const months: string[] = [];
    const [fy, fm] = firstMonth.split('-').map(Number);
    const [cy, cm] = currentMonth.split('-').map(Number);
    let y = fy, m = fm;
    while (y < cy || (y === cy && m < cm)) { months.push(`${y}-${String(m).padStart(2,'0')}`); m++; if (m > 12) { m = 1; y++; } }
    const existing = new Set(reports.map(r => r.month));
    const missing = months.filter(mo => !existing.has(mo));
    if (missing.length === 0) { autoGenRan.current = true; return; }
    const sorted = [...reports].sort((a, b) => a.month.localeCompare(b.month));
    let prev: SystemReport | null = sorted.length > 0 ? sorted[sorted.length-1] : null;
    for (const mo of missing) {
      const report = generateMonthlyReport(mo, nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, prev, userId);
      const hadActivity = [...nnCompletions.filter(c => c.completion_date.startsWith(mo)), ...habitCompletions.filter(c => c.completion_date.startsWith(mo)), ...dailyTasks.filter(t => t.task_date.startsWith(mo))].length > 0;
      if (hadActivity) { onSaveSystemReport(report); prev = report; }
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
    return { avg: Math.round(reports.reduce((s, r) => s + r.score, 0) / reports.length), best: Math.max(...reports.map(r => r.score)), goldCount: reports.filter(r => r.tier === 'gold' || r.tier === 'diamond').length, total: reports.length };
  }, [reports]);

  return (
    <div className="pt-6 max-w-2xl mx-auto">
      <style>{`@keyframes milestonePulse { 0%,100% { box-shadow: 0 0 0 0 rgba(197,165,90,0); } 50% { box-shadow: 0 0 0 4px rgba(197,165,90,0.12); } }`}</style>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-5 h-5 text-sa-gold opacity-80" />
          <h2 className="font-serif text-2xl text-sa-cream">Achievements</h2>
        </div>
        <p className="text-sm text-sa-cream-muted">Your operational history. Milestones earned. Performance recorded.</p>
      </div>

      {/* Section toggle */}
      <div className="flex gap-1 mb-8 animate-rise delay-1">
        {(['milestones','reports'] as const).map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`px-4 py-2 text-xs font-medium rounded-sa-sm transition-colors ${activeSection === s ? 'text-sa-gold bg-sa-gold-soft' : 'text-sa-cream-muted hover:text-sa-cream-soft'}`}>
            {s === 'milestones' ? 'Milestones' : 'System Reports'}
          </button>
        ))}
      </div>

      {/* ════════ MILESTONES ════════ */}
      {activeSection === 'milestones' && (
        <div className="animate-rise delay-2">
          <div className="sa-card-elevated mb-10 flex items-center justify-between flex-wrap gap-6">
            <MilestoneProgressRing unlocked={unlockedIds.size} total={MILESTONES.length} rank={rank} />
            <div className="flex gap-3">
              {(['foundation','momentum','mastery'] as const).map(ch => {
                const cfg = CHAPTER_CONFIG[ch];
                const tot = MILESTONES.filter(m => m.chapter === ch).length;
                const dn = MILESTONES.filter(m => m.chapter === ch && unlockedIds.has(m.id)).length;
                return (<div key={ch} className="text-center px-3 py-2 rounded-sa" style={{ backgroundColor: cfg.colorSoft }}>
                  <span className="block font-serif text-lg" style={{ color: cfg.color }}>{dn}</span>
                  <span className="text-[0.6rem] uppercase tracking-wider text-sa-cream-faint">/ {tot}</span>
                </div>);
              })}
            </div>
          </div>

          {(['foundation','momentum','mastery'] as const).map(ch => (
            <ChapterSection key={ch} chapter={ch} milestones={MILESTONES} unlockedIds={unlockedIds} nextId={nextId} />
          ))}

          {unlockedIds.size === MILESTONES.length && (
            <div className="mt-4 py-8 px-8 text-center rounded-sa-lg" style={{ border: '1px solid rgba(110,203,139,0.3)', backgroundColor: 'rgba(110,203,139,0.06)' }}>
              <Gem className="w-8 h-8 text-sa-green mx-auto mb-3" />
              <p className="font-serif text-xl text-sa-green mb-1">All milestones unlocked.</p>
              <p className="text-sm text-sa-cream-muted">Full Stack rank achieved. System at maximum operational capacity.</p>
            </div>
          )}
        </div>
      )}

      {/* ════════ SYSTEM REPORTS ════════ */}
      {activeSection === 'reports' && (
        <div className="animate-rise delay-2">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-sa-gold-soft border border-sa-gold-border flex items-center justify-center mb-6"><Trophy className="w-7 h-7 text-sa-gold opacity-70" /></div>
              <h3 className="font-serif text-xl text-sa-cream mb-2">No System Reports Yet</h3>
              <p className="text-sm text-sa-cream-muted max-w-sm mb-6 leading-relaxed">System Reports are generated monthly to track your operational performance. Each report becomes a card in your achievement history.</p>
              <button onClick={handleGenerate} className="sa-btn-primary">Generate Current Month Report</button>
            </div>
          ) : (<>
            {stats && <div className="grid grid-cols-4 gap-2 mb-8">
              {[{ label: 'Reports', value: stats.total }, { label: 'Avg Score', value: stats.avg }, { label: 'Best', value: stats.best }, { label: 'Gold+', value: stats.goldCount }].map(s => (
                <div key={s.label} className="text-center py-3 rounded-sa" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="block font-serif text-lg text-sa-cream">{s.value}</span>
                  <span className="text-[0.6rem] uppercase tracking-wider text-sa-cream-faint">{s.label}</span>
                </div>))}
            </div>}
            <div className="mb-6"><button onClick={handleGenerate} className={hasCurrentReport ? 'sa-btn-secondary w-full' : 'sa-btn-primary w-full'}>{hasCurrentReport ? `Update ${getMonthLabel(currentMonth)} Report` : `Generate ${getMonthLabel(currentMonth)} Report`}</button></div>
            <div className="space-y-3">{sortedReports.map((r, i) => (<div key={r.id} className="animate-rise" style={{ animationDelay: `${i*0.05}s`, opacity: 0 }}><SystemCard report={r} onClick={() => setExpandedReport(r)} /></div>))}</div>
          </>)}
        </div>
      )}

      {expandedReport && <ExpandedReport report={expandedReport} onClose={() => setExpandedReport(null)} />}
    </div>
  );
}
