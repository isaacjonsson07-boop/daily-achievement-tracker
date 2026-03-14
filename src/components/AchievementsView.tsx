import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Target, Flame, Calendar, CheckCircle, AlertTriangle, X, Gem,
  Zap, Shield, FileText, Award, Star, Clock, Anchor, Power, Lock } from 'lucide-react';
import { NonNegotiable, NonNegotiableCompletion, Habit, HabitCompletion, DailyTask, SystemReport, ReportTier } from '../types';
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
// MILESTONE DEFINITIONS
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
  progressFn?: (ctx: MilestoneContext) => { current: number; target: number };
  completionLabel?: (ctx: MilestoneContext) => string;
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
  { id: 'system-online', title: 'System Online', description: 'Configure at least 1 non-negotiable and 1 habit to bring your system online. This is step zero — nothing tracks until components are installed.', chapter: 'foundation', icon: Power,
    check: c => c.activeNNs.length >= 1 && c.habits.length >= 1, requirement: '1 non-negotiable + 1 habit',
    progressFn: c => ({ current: Math.min(c.activeNNs.length, 1) + Math.min(c.habits.length, 1), target: 2 }),
    completionLabel: c => `${c.activeNNs.length} NNs · ${c.habits.length} habits configured` },
  { id: 'first-execution', title: 'First Execution', description: 'Complete every item in a single day — all non-negotiables, all habits, all tasks. Prove the system can run at full capacity.', chapter: 'foundation', icon: Zap,
    check: c => c.hasAnyFullDay, requirement: '100% completion on any day',
    completionLabel: () => '100% day achieved' },
  { id: 'week-one', title: 'Week One', description: 'Be active for 7 days total. Not consecutive — just 7 days where you showed up and executed. The system is taking root.', chapter: 'foundation', icon: Calendar,
    check: c => c.totalActiveDays >= 7, requirement: '7 active days',
    progressFn: c => ({ current: Math.min(c.totalActiveDays, 7), target: 7 }),
    completionLabel: c => `${c.totalActiveDays} days active` },
  { id: 'grounded', title: 'Grounded', description: '14 total active days. Two weeks of execution behind you. Your system has roots now — it\'s becoming part of how you operate.', chapter: 'foundation', icon: Anchor,
    check: c => c.totalActiveDays >= 14, requirement: '14 active days',
    progressFn: c => ({ current: Math.min(c.totalActiveDays, 14), target: 14 }),
    completionLabel: c => `${c.totalActiveDays} days active` },
  { id: 'executor', title: 'Executor', description: '25 tasks completed. Not started — completed. This is proof of consistent output, not intention.', chapter: 'foundation', icon: CheckCircle,
    check: c => c.totalTasksCompleted >= 25, requirement: '25 tasks completed',
    progressFn: c => ({ current: Math.min(c.totalTasksCompleted, 25), target: 25 }),
    completionLabel: c => `${c.totalTasksCompleted} tasks completed` },
  { id: '7-day-streak', title: '7-Day Streak', description: '7 consecutive days at 80% or higher completion across all categories. This isn\'t a lucky week — it\'s operational discipline.', chapter: 'momentum', icon: Flame,
    check: c => c.longestStreak80 >= 7, requirement: '7-day streak at 80%+',
    progressFn: c => ({ current: Math.min(c.longestStreak80, 7), target: 7 }),
    completionLabel: c => `Best streak: ${c.longestStreak80} days` },
  { id: 'nn-lock', title: 'Non-Negotiable Lock', description: '7 days straight without missing a single non-negotiable. Your non-negotiables are your identity. This proves they\'re locked in.', chapter: 'momentum', icon: Shield,
    check: c => c.longestNNStreak >= 7, requirement: '7-day perfect NN streak',
    progressFn: c => ({ current: Math.min(c.longestNNStreak, 7), target: 7 }),
    completionLabel: c => `${c.longestNNStreak}-day NN streak` },
  { id: 'first-report', title: 'First Report', description: 'Generate your first monthly System Report. See your execution data compiled into a single performance score.', chapter: 'momentum', icon: FileText,
    check: c => c.systemReports.length >= 1, requirement: 'Generate 1 monthly report',
    progressFn: c => ({ current: Math.min(c.systemReports.length, 1), target: 1 }),
    completionLabel: c => `${c.systemReports.length} report${c.systemReports.length !== 1 ? 's' : ''} generated` },
  { id: 'half-century', title: 'Half Century', description: '50 tasks completed. You\'re past the phase where this is new — this is just how you operate now.', chapter: 'momentum', icon: Target,
    check: c => c.totalTasksCompleted >= 50, requirement: '50 tasks completed',
    progressFn: c => ({ current: Math.min(c.totalTasksCompleted, 50), target: 50 }),
    completionLabel: c => `${c.totalTasksCompleted} tasks completed` },
  { id: 'silver-caliber', title: 'Silver Caliber', description: 'Earn Silver tier or higher in a monthly System Report. Silver means 50%+ execution across all categories — you\'re operational.', chapter: 'momentum', icon: Award,
    check: c => c.systemReports.some(r => ['silver','gold','diamond'].includes(r.tier)), requirement: 'Silver+ monthly report',
    completionLabel: c => { const best = c.systemReports.find(r => ['silver','gold','diamond'].includes(r.tier)); return best ? `${best.tier.charAt(0).toUpperCase()+best.tier.slice(1)} earned` : 'Earned'; } },
  { id: '14-day-streak', title: '14-Day Streak', description: 'Two unbroken weeks at 80%+ completion. This is where most people fall off. You didn\'t.', chapter: 'mastery', icon: TrendingUp,
    check: c => c.longestStreak80 >= 14, requirement: '14-day streak at 80%+',
    progressFn: c => ({ current: Math.min(c.longestStreak80, 14), target: 14 }),
    completionLabel: c => `Best streak: ${c.longestStreak80} days` },
  { id: 'gold-standard', title: 'Gold Standard', description: 'Earn Gold tier in a monthly report. 75%+ execution across the board. Your system doesn\'t just run — it performs.', chapter: 'mastery', icon: Star,
    check: c => c.systemReports.some(r => ['gold','diamond'].includes(r.tier)), requirement: 'Gold monthly report',
    completionLabel: () => 'Gold standard reached' },
  { id: 'century', title: 'Century', description: '100 tasks completed. One hundred deliberate actions, each one tracked and finished. Relentless.', chapter: 'mastery', icon: Target,
    check: c => c.totalTasksCompleted >= 100, requirement: '100 tasks completed',
    progressFn: c => ({ current: Math.min(c.totalTasksCompleted, 100), target: 100 }),
    completionLabel: c => `${c.totalTasksCompleted} tasks completed` },
  { id: '30-day-operator', title: '30-Day Operator', description: '30 active days. A full month of operational history. The system runs on autopilot now — execution is identity.', chapter: 'mastery', icon: Clock,
    check: c => c.totalActiveDays >= 30, requirement: '30 active days',
    progressFn: c => ({ current: Math.min(c.totalActiveDays, 30), target: 30 }),
    completionLabel: c => `${c.totalActiveDays} days active` },
  { id: 'diamond-operator', title: 'Diamond Operator', description: 'Earn a perfect Diamond report — 100% execution in every category for an entire month. Peak operational capacity. The system is you.', chapter: 'mastery', icon: Gem,
    check: c => c.systemReports.some(r => r.tier === 'diamond'), requirement: 'Diamond report (100%)',
    completionLabel: () => 'Peak capacity achieved' },
];

function getRank(n: number) {
  if (n >= 14) return { title: 'Full Stack', next: null };
  if (n >= 10) return { title: 'Architect', next: 'Full Stack' };
  if (n >= 6)  return { title: 'Operator', next: 'Architect' };
  if (n >= 3)  return { title: 'Initiate', next: 'Operator' };
  return { title: 'Newcomer', next: 'Initiate' };
}

// ═══════════════════════════════════════════════════════
// COMPUTE
// ═══════════════════════════════════════════════════════

function computeCtx(nns: NonNegotiable[], nnC: NonNegotiableCompletion[], habits: Habit[], hC: HabitCompletion[], tasks: DailyTask[], reports: SystemReport[]): MilestoneContext {
  const activeNNs = nns.filter(n => n.active);
  const allDates = new Set<string>();
  nnC.forEach(c => allDates.add(c.completion_date));
  hC.forEach(c => allDates.add(c.completion_date));
  tasks.filter(t => t.completed).forEach(t => allDates.add(t.task_date));
  const sorted = Array.from(allDates).sort();
  const evalDates: string[] = [];
  if (sorted.length > 0) { const cursor = new Date(sorted[0]+'T00:00:00'); const end = new Date(); while (cursor <= end) { evalDates.push(fmtDateISO(cursor)); cursor.setDate(cursor.getDate()+1); } }
  let hasAnyFullDay = false, longestStreak80 = 0, cur80 = 0, longestNNStreak = 0, curNN = 0;
  for (const date of evalDates) {
    const d = new Date(date+'T00:00:00'), di = d.getDay(), ds = d.getTime();
    const nnsDay = activeNNs.filter(nn => new Date(nn.created_at).getTime() <= ds+86400000);
    const nnDone = nnsDay.filter(nn => nnC.some(c => c.non_negotiable_id === nn.id && c.completion_date === date)).length;
    const habDay = habits.filter(h => h.days_of_week.includes(di) && new Date(h.created_at).getTime() <= ds+86400000);
    const habDone = habDay.filter(h => hC.some(c => c.habit_id === h.id && c.completion_date === date)).length;
    const tDay = tasks.filter(t => t.task_date === date), tDone = tDay.filter(t => t.completed).length;
    const total = nnsDay.length + habDay.length + tDay.length, done = nnDone + habDone + tDone;
    const pct = total > 0 ? Math.round((done/total)*100) : 0;
    if (pct === 100 && total > 0) hasAnyFullDay = true;
    if (pct >= 80 && total > 0) { cur80++; longestStreak80 = Math.max(longestStreak80, cur80); } else cur80 = 0;
    if (nnsDay.length > 0 && nnDone === nnsDay.length) { curNN++; longestNNStreak = Math.max(longestNNStreak, curNN); } else if (nnsDay.length > 0) curNN = 0;
  }
  return { activeNNs, habits, nnCompletions: nnC, habitCompletions: hC, dailyTasks: tasks, systemReports: reports,
    totalActiveDays: allDates.size, totalTasksCompleted: tasks.filter(t => t.completed).length, longestStreak80, longestNNStreak, hasAnyFullDay };
}

// ═══════════════════════════════════════════════════════
// STATUS MESSAGE (the milestones page talks)
// ═══════════════════════════════════════════════════════

function getStatusMessage(unlockedCount: number, nextIndex: number | null, ctx: MilestoneContext): { message: string; color: string } {
  if (unlockedCount === MILESTONES.length) {
    return { message: 'All 15 milestones unlocked. Full Stack rank achieved. There is nothing left to prove.', color: '#6ECB8B' };
  }
  if (unlockedCount === 0) {
    return { message: 'No milestones unlocked yet. Configure your first non-negotiable and habit to bring the system online.', color: '#C5A55A' };
  }
  if (nextIndex !== null) {
    const next = MILESTONES[nextIndex];
    const progress = next.progressFn ? next.progressFn(ctx) : null;
    if (progress) {
      const remaining = progress.target - progress.current;
      if (remaining === 1) {
        return { message: `1 away from "${next.title}." One more and it's yours.`, color: CHAPTER_META[next.chapter].color };
      }
      if (remaining <= 3) {
        return { message: `${remaining} away from "${next.title}." Almost there.`, color: CHAPTER_META[next.chapter].color };
      }
      return { message: `${unlockedCount} milestones down. Next: "${next.title}" — ${progress.current}/${progress.target}.`, color: CHAPTER_META[next.chapter].color };
    }
    return { message: `${unlockedCount} milestones down. Next: "${next.title}."`, color: CHAPTER_META[next.chapter].color };
  }
  return { message: `${unlockedCount} milestones unlocked.`, color: '#C5A55A' };
}

// ═══════════════════════════════════════════════════════
// MILESTONE CARD (rich, with all improvements)
// ═══════════════════════════════════════════════════════

function MilestoneCard({ milestone, index, unlocked, isNext, isLocked, ctx }: {
  milestone: MilestoneDef; index: number; unlocked: boolean; isNext: boolean; isLocked: boolean; ctx: MilestoneContext;
}) {
  const ch = CHAPTER_META[milestone.chapter];
  const Icon = milestone.icon;
  const progress = isNext && milestone.progressFn ? milestone.progressFn(ctx) : null;
  const progressPct = progress ? Math.round((progress.current / progress.target) * 100) : 0;
  const completionText = unlocked && milestone.completionLabel ? milestone.completionLabel(ctx) : null;

  return (
    <div className={`relative flex gap-5 ${isLocked ? 'opacity-30' : ''}`}>

      {/* Left: node on the path */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 52 }}>
        <div className="relative">
          {/* Glow behind unlocked */}
          {unlocked && <div className="absolute -inset-2 rounded-full" style={{ background: ch.glow, filter: 'blur(10px)' }} />}
          {/* Pulse for current */}
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
        {/* Connecting line */}
        <div className="flex-1 w-px min-h-[24px]" style={{
          background: unlocked ? `linear-gradient(to bottom, ${ch.color}, ${ch.border})` : isNext ? `linear-gradient(to bottom, ${ch.border}, rgba(255,255,255,0.04))` : 'rgba(255,255,255,0.04)',
        }} />
      </div>

      {/* Right: content — ELEVATED CARD for current milestone */}
      <div className={`flex-1 min-w-0 ${isNext ? 'pb-8' : 'pb-5'}`}>
        <div className={`${isNext ? 'p-5 rounded-sa-lg' : ''}`} style={isNext ? {
          border: `1.5px solid ${ch.border}`,
          backgroundColor: ch.colorSoft,
          boxShadow: `0 0 30px ${ch.colorSoft}, inset 0 0 40px ${ch.colorSoft}`,
        } : {}}>

          {/* Title row */}
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

          {/* Description */}
          <p className={`text-[0.85rem] leading-relaxed mb-2.5 ${unlocked ? 'text-sa-cream-muted' : isNext ? 'text-sa-cream-soft' : 'text-sa-cream-faint'}`}>
            {milestone.description}
          </p>

          {/* Completion context for unlocked milestones */}
          {unlocked && completionText && (
            <p className="text-[0.72rem] mb-2" style={{ color: ch.color }}>
              {completionText}
            </p>
          )}

          {/* Requirement tag */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[0.72rem] px-2.5 py-1 rounded-sa-sm" style={{
              color: unlocked ? ch.color : isNext ? ch.color : 'var(--cream-faint)',
              backgroundColor: unlocked ? ch.colorSoft : isNext ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${unlocked ? ch.border : isNext ? ch.border : 'rgba(255,255,255,0.06)'}`,
            }}>
              {milestone.requirement}
            </span>
          </div>

          {/* Progress bar for current milestone — prominent */}
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
                  width: `${progressPct}%`,
                  backgroundColor: ch.color,
                  boxShadow: `0 0 12px ${ch.glow}`,
                }} />
              </div>
              {progressPct > 0 && progressPct < 100 && (
                <p className="text-[0.7rem] text-sa-cream-faint mt-1.5">
                  {progress.target - progress.current} more to unlock
                </p>
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

function RankHeader({ unlocked, total, rank }: { unlocked: number; total: number; rank: { title: string; next: string | null } }) {
  const pct = total > 0 ? (unlocked / total) * 100 : 0;
  const color = pct >= 80 ? '#6ECB8B' : pct >= 40 ? '#6DB5F5' : '#C5A55A';
  const sz = 88, sw = 3, r = (sz-sw*2)/2, circ = 2*Math.PI*r, off = circ-(pct/100)*circ;
  return (
    <div className="sa-card-elevated mb-8">
      <div className="flex items-center justify-between flex-wrap gap-5">
        <div className="flex items-center gap-5">
          <div className="relative" style={{ width: sz, height: sz }}>
            <svg width={sz} height={sz} className="transform -rotate-90">
              <circle cx={sz/2} cy={sz/2} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth={sw} fill="none" />
              <circle cx={sz/2} cy={sz/2} r={r} stroke={color} strokeWidth={sw} fill="none"
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
          {(['foundation','momentum','mastery'] as const).map(c => {
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

// ═══════════════════════════════════════════════════════
// REPORT COMPONENTS (preserved)
// ═══════════════════════════════════════════════════════

function getMonthLabel(m: string) { const [y, mo] = m.split('-'); return new Date(parseInt(y), parseInt(mo)-1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); }
function getShortMonthLabel(m: string) { const [y, mo] = m.split('-'); return new Date(parseInt(y), parseInt(mo)-1).toLocaleDateString('en-US', { month: 'short' }); }
function getYearLabel(m: string) { return m.split('-')[0]; }

function DiamondFrame() {
  const s = (t: string): React.CSSProperties => ({ position: 'absolute', width: 85, height: 85, opacity: 0.85, transform: t, pointerEvents: 'none', filter: 'drop-shadow(0 0 6px rgba(184,212,232,0.4))' });
  return <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">
    {[['scaleY(-1)','top','left'],['scale(-1,-1)','top','right'],['none','bottom','left'],['scaleX(-1)','bottom','right']].map(([t,v,h],i) => <img key={i} src="/corner-diamond.svg" alt="" style={{...s(t),[v]:0,[h]:0}} />)}
  </div>;
}
function GoldFrame() {
  const s = (t: string): React.CSSProperties => ({ position: 'absolute', width: 65, height: 65, opacity: 0.75, transform: t, pointerEvents: 'none', filter: 'drop-shadow(0 0 4px rgba(197,165,90,0.3))' });
  return <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">
    {[['none','top','left'],['scaleX(-1)','top','right'],['scaleY(-1)','bottom','left'],['scale(-1,-1)','bottom','right']].map(([t,v,h],i) => <img key={i} src="/corner-gold.svg" alt="" style={{...s(t),[v]:0,[h]:0}} />)}
  </div>;
}
function SilverFrame({ color: c }: { color: string }) {
  const p = [['top-0 left-0','M4 24 L4 8 C4 6,6 4,8 4 L24 4','M8 4 L4 4 L4 8'],['top-0 right-0','M44 24 L44 8 C44 6,42 4,40 4 L24 4','M40 4 L44 4 L44 8'],['bottom-0 left-0','M4 24 L4 40 C4 42,6 44,8 44 L24 44','M8 44 L4 44 L4 40'],['bottom-0 right-0','M44 24 L44 40 C44 42,42 44,40 44 L24 44','M40 44 L44 44 L44 40']];
  return <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">{p.map(([pos,d1,d2],i)=><svg key={i} className={`absolute ${pos} w-12 h-12`} viewBox="0 0 48 48" fill="none"><path d={d1} stroke={c} strokeWidth="1"/><path d={d2} stroke={c} strokeWidth="1.5"/></svg>)}</div>;
}
function BronzeFrame({ color: c }: { color: string }) {
  const p = [['top-0 left-0','M4 16 L4 6 C4 5,5 4,6 4 L16 4'],['top-0 right-0','M28 16 L28 6 C28 5,27 4,26 4 L16 4'],['bottom-0 left-0','M4 16 L4 26 C4 27,5 28,6 28 L16 28'],['bottom-0 right-0','M28 16 L28 26 C28 27,27 28,26 28 L16 28']];
  return <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">{p.map(([pos,d],i)=><svg key={i} className={`absolute ${pos} w-8 h-8`} viewBox="0 0 32 32" fill="none"><path d={d} stroke={c} strokeWidth="1"/></svg>)}</div>;
}
function TierFrame({ tier }: { tier: ReportTier }) { const c = TIER_CONFIG[tier]; switch(tier){case 'diamond':return <DiamondFrame/>;case 'gold':return <GoldFrame/>;case 'silver':return <SilverFrame color={c.color}/>;case 'bronze':return <BronzeFrame color={c.color}/>;} }
function ScoreRing({ score, tier, size=80 }: { score: number; tier: ReportTier; size?: number }) {
  const c=TIER_CONFIG[tier],sw=3,r=(size-sw*2)/2,ci=2*Math.PI*r,off=ci-(score/100)*ci;
  return <div className="relative" style={{width:size,height:size}}><svg width={size} height={size} className="transform -rotate-90"><circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth={sw} fill="none"/><circle cx={size/2} cy={size/2} r={r} stroke={c.color} strokeWidth={sw} fill="none" strokeLinecap="round" strokeDasharray={ci} strokeDashoffset={off} style={{transition:'stroke-dashoffset 0.8s ease-out'}}/></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-serif text-xl" style={{color:c.color}}>{score}</span></div></div>;
}
function DeltaBadge({ delta }: { delta?: number }) { if(delta==null)return null; if(delta>0)return <span className="inline-flex items-center gap-1 text-xs text-sa-green"><TrendingUp className="w-3 h-3"/>+{delta}</span>; if(delta<0)return <span className="inline-flex items-center gap-1 text-xs text-sa-rose"><TrendingDown className="w-3 h-3"/>{delta}</span>; return <span className="inline-flex items-center gap-1 text-xs text-sa-cream-faint"><Minus className="w-3 h-3"/>0</span>; }
function CategoryBar({ label, score, color }: { label: string; score: number; color: string }) { return <div className="space-y-1.5"><div className="flex items-center justify-between"><span className="text-xs text-sa-cream-muted">{label}</span><span className="text-xs font-medium tabular-nums" style={{color}}>{score}%</span></div><div className="w-full h-1.5 bg-sa-bg-lift rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700 ease-out" style={{width:`${score}%`,backgroundColor:color}}/></div></div>; }

function SystemCard({ report: rp, onClick }: { report: SystemReport; onClick: () => void }) {
  const c = TIER_CONFIG[rp.tier];
  return <button onClick={onClick} className="w-full text-left group relative rounded-sa-lg transition-all duration-200 hover:scale-[1.01]" style={{border:`1px solid ${c.border}`,backgroundColor:c.bg}}>
    <div className="relative p-5"><div className="flex items-center gap-4"><ScoreRing score={rp.score} tier={rp.tier} size={64}/><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><span className="font-serif text-base text-sa-cream">{getShortMonthLabel(rp.month)}</span><span className="text-xs text-sa-cream-faint">{getYearLabel(rp.month)}</span>{rp.isInstallationReport&&<span className="text-[0.6rem] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{color:c.color,backgroundColor:c.bg,border:`1px solid ${c.border}`}}>Day 21</span>}</div><div className="flex items-center gap-3"><span className="text-xs font-medium uppercase tracking-wider" style={{color:c.color}}>{c.label}</span><DeltaBadge delta={rp.scoreDelta}/></div>{rp.scoreCapped&&<div className="flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3 text-sa-cream-faint"/><span className="text-[0.65rem] text-sa-cream-faint">Below minimums</span></div>}</div></div></div></button>;
}

function ExpandedReport({ report: rp, onClose }: { report: SystemReport; onClose: () => void }) {
  const c = TIER_CONFIG[rp.tier];
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose} style={{backgroundColor:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)'}}>
    <div className="relative w-full max-w-lg rounded-sa-lg" onClick={e=>e.stopPropagation()} style={{border:`1px solid ${c.border}`,backgroundColor:'#151518',boxShadow:rp.tier==='diamond'?'0 0 40px rgba(184,212,232,0.10)':rp.tier==='gold'?'0 0 30px rgba(197,165,90,0.08)':'none'}}>
      <TierFrame tier={rp.tier}/>
      <div className="max-h-[90vh] overflow-y-auto rounded-sa-lg"><div className="relative z-20 p-8 sm:p-10">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-sa-cream-faint hover:text-sa-cream transition-colors rounded-sa-sm hover:bg-sa-bg-lift z-30"><X className="w-4 h-4"/></button>
        <div className="text-center mb-8"><p className="text-[0.65rem] uppercase tracking-[0.2em] text-sa-cream-faint mb-3">System Report</p><h2 className="font-serif text-2xl text-sa-cream mb-1">{getMonthLabel(rp.month)}</h2>{rp.isInstallationReport&&<p className="text-xs mt-1" style={{color:c.color}}>Installation Complete — Day 21</p>}<div className="flex justify-center mt-6 mb-3"><ScoreRing score={rp.score} tier={rp.tier} size={100}/></div><div className="flex items-center justify-center gap-3"><span className="text-sm font-medium uppercase tracking-wider" style={{color:c.color}}>{c.label}</span><DeltaBadge delta={rp.scoreDelta}/></div>{rp.scoreCapped&&<div className="flex items-center justify-center gap-1.5 mt-2"><AlertTriangle className="w-3.5 h-3.5 text-sa-cream-faint"/><span className="text-xs text-sa-cream-faint">Score capped — below minimums</span></div>}</div>
        <div className="h-px mb-6" style={{background:`linear-gradient(90deg, transparent, ${c.border}, transparent)`}}/>
        <div className="space-y-4 mb-8"><p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-cream-faint">Performance</p><CategoryBar label={`Habits (${rp.habitsCount})`} score={rp.habitsScore} color={c.color}/><CategoryBar label={`Tasks (${rp.tasksAvgPerDay}/day)`} score={rp.tasksScore} color={c.color}/><CategoryBar label={`NNs (${rp.nnCount})`} score={rp.nnScore} color={c.color}/></div>
        <div className="grid grid-cols-2 gap-3 mb-8">{[{icon:CheckCircle,l:'Tasks',v:rp.totalTasksCompleted},{icon:Flame,l:'Streak',v:`${rp.longestStreak}d`},{icon:Calendar,l:'Active',v:`${rp.totalDaysActive}d`},{icon:Target,l:'Score',v:rp.score,useC:true}].map(s=>{const I=s.icon;return <div key={s.l} className="p-3 rounded-sa" style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}><div className="flex items-center gap-1.5 mb-1"><I className="w-3.5 h-3.5" style={{color:c.color}}/><span className="text-[0.65rem] uppercase tracking-wider text-sa-cream-faint">{s.l}</span></div><span className="font-serif text-xl" style={{color:(s as any).useC?c.color:'var(--cream)'}}>{String(s.v)}</span></div>;})}</div>
        <div className="text-center"><div className="h-px mb-5" style={{background:`linear-gradient(90deg, transparent, ${c.border}, transparent)`}}/><p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-cream-faint mb-3">Highlight</p><p className="text-sm text-sa-cream-soft italic leading-relaxed">"{rp.personalHighlight}"</p></div>
      </div></div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════

export function AchievementsView({ nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, userId, systemReports, onSaveSystemReport }: AchievementsViewProps) {
  const [expandedReport, setExpandedReport] = useState<SystemReport | null>(null);
  const [activeSection, setActiveSection] = useState<'milestones'|'reports'>('milestones');

  const ctx = useMemo(() => computeCtx(nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, systemReports), [nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, systemReports]);

  const { unlockedCount, nextIndex } = useMemo(() => {
    let count = 0;
    for (const m of MILESTONES) { if (m.check(ctx)) count++; else break; }
    return { unlockedCount: count, nextIndex: count < MILESTONES.length ? count : null };
  }, [ctx]);

  const rank = useMemo(() => getRank(unlockedCount), [unlockedCount]);
  const status = useMemo(() => getStatusMessage(unlockedCount, nextIndex, ctx), [unlockedCount, nextIndex, ctx]);

  // Reports
  const currentMonth = useMemo(() => { const n=new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`; }, []);
  const hasCurrentReport = systemReports.some(r => r.month === currentMonth);

  const autoGenRan = useRef(false);
  useEffect(() => {
    if (autoGenRan.current) return;
    if (systemReports.length === 0 && nonNegotiables.length === 0 && habits.length === 0) return;
    const allDates = [...nnCompletions.map(c=>c.completion_date),...habitCompletions.map(c=>c.completion_date),...dailyTasks.map(t=>t.task_date)].filter(Boolean).sort();
    if (allDates.length === 0) return;
    const fm = allDates[0].substring(0,7);
    const months: string[] = [];
    const [fy,fmo] = fm.split('-').map(Number);
    const [cy,cm] = currentMonth.split('-').map(Number);
    let y=fy,mo=fmo;
    while(y<cy||(y===cy&&mo<cm)){months.push(`${y}-${String(mo).padStart(2,'0')}`);mo++;if(mo>12){mo=1;y++;}}
    const existing = new Set(systemReports.map(r=>r.month));
    const missing = months.filter(m=>!existing.has(m));
    if(missing.length===0){autoGenRan.current=true;return;}
    const sorted = [...systemReports].sort((a,b)=>a.month.localeCompare(b.month));
    let prev: SystemReport|null = sorted.length>0?sorted[sorted.length-1]:null;
    for(const m of missing){
      const rp = generateMonthlyReport(m,nonNegotiables,nnCompletions,habits,habitCompletions,dailyTasks,prev,userId);
      const had = [...nnCompletions.filter(c=>c.completion_date.startsWith(m)),...habitCompletions.filter(c=>c.completion_date.startsWith(m)),...dailyTasks.filter(t=>t.task_date.startsWith(m))].length>0;
      if(had){onSaveSystemReport(rp);prev=rp;}
    }
    autoGenRan.current=true;
  }, [systemReports,nonNegotiables,nnCompletions,habits,habitCompletions,dailyTasks,currentMonth,userId,onSaveSystemReport]);

  const handleGenerate = () => {
    const sorted = [...systemReports].sort((a,b)=>b.month.localeCompare(a.month));
    const rp = generateMonthlyReport(currentMonth,nonNegotiables,nnCompletions,habits,habitCompletions,dailyTasks,sorted[0]||null,userId);
    onSaveSystemReport(rp); setExpandedReport(rp);
  };

  const sortedReports = useMemo(() => [...systemReports].sort((a,b)=>b.month.localeCompare(a.month)), [systemReports]);
  const stats = useMemo(() => {
    if(systemReports.length===0)return null;
    return {avg:Math.round(systemReports.reduce((s,r)=>s+r.score,0)/systemReports.length),best:Math.max(...systemReports.map(r=>r.score)),goldCount:systemReports.filter(r=>r.tier==='gold'||r.tier==='diamond').length,total:systemReports.length};
  }, [systemReports]);

  const chapters: { chapter: MilestoneChapter; milestones: { def: MilestoneDef; index: number }[] }[] = [
    { chapter: 'foundation', milestones: MILESTONES.slice(0,5).map((m,i) => ({ def: m, index: i })) },
    { chapter: 'momentum', milestones: MILESTONES.slice(5,10).map((m,i) => ({ def: m, index: i+5 })) },
    { chapter: 'mastery', milestones: MILESTONES.slice(10,15).map((m,i) => ({ def: m, index: i+10 })) },
  ];

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

      <div className="flex gap-1 mb-8 animate-rise delay-1">
        {(['milestones','reports'] as const).map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`px-4 py-2 text-xs font-medium rounded-sa-sm transition-colors ${activeSection===s?'text-sa-gold bg-sa-gold-soft':'text-sa-cream-muted hover:text-sa-cream-soft'}`}>
            {s==='milestones'?'Milestones':'System Reports'}
          </button>
        ))}
      </div>

      {activeSection === 'milestones' && (
        <div className="animate-rise delay-2">
          <RankHeader unlocked={unlockedCount} total={MILESTONES.length} rank={rank} />

          {/* ── Status message (the page talks) ── */}
          <div className="mb-8 px-5 py-4 rounded-sa border flex items-start gap-3" style={{
            borderColor: `${status.color}40`,
            backgroundColor: `${status.color}08`,
          }}>
            <span className="text-base flex-shrink-0 mt-px" style={{ color: status.color }}>
              {unlockedCount === MILESTONES.length ? '●' : unlockedCount === 0 ? '◆' : '◆'}
            </span>
            <p className="text-sm leading-relaxed" style={{ color: status.color }}>{status.message}</p>
          </div>

          {/* ── Atmospheric glow background ── */}
          <div className="relative">
            {/* Gold glow for Foundation */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[400px] pointer-events-none" style={{
              background: 'radial-gradient(ellipse at center, rgba(197,165,90,0.06) 0%, transparent 70%)',
            }} />
            {/* Blue glow for Momentum */}
            <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[300px] h-[400px] pointer-events-none" style={{
              background: 'radial-gradient(ellipse at center, rgba(109,181,245,0.05) 0%, transparent 70%)',
            }} />
            {/* Green glow for Mastery */}
            <div className="absolute top-[65%] left-1/2 -translate-x-1/2 w-[300px] h-[400px] pointer-events-none" style={{
              background: 'radial-gradient(ellipse at center, rgba(110,203,139,0.05) 0%, transparent 70%)',
            }} />

            {/* ── The path ── */}
            <div className="relative z-10">
              {chapters.map(({ chapter, milestones: ms }) => (
                <div key={chapter}>
                  <ChapterHeader chapter={chapter} />
                  <div className="ml-1">
                    {ms.map(({ def, index }) => (
                      <MilestoneCard
                        key={def.id}
                        milestone={def}
                        index={index}
                        unlocked={index < unlockedCount}
                        isNext={index === nextIndex}
                        isLocked={index > (nextIndex ?? unlockedCount)}
                        ctx={ctx}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {unlockedCount === MILESTONES.length && (
            <div className="mt-8 py-8 px-8 text-center rounded-sa-lg" style={{ border: '1px solid rgba(110,203,139,0.3)', backgroundColor: 'rgba(110,203,139,0.06)' }}>
              <Gem className="w-8 h-8 text-sa-green mx-auto mb-3" />
              <p className="font-serif text-xl text-sa-green mb-1">All milestones unlocked.</p>
              <p className="text-sm text-sa-cream-muted">Full Stack rank achieved. Peak operational capacity.</p>
            </div>
          )}
        </div>
      )}

      {activeSection === 'reports' && (
        <div className="animate-rise delay-2">
          {systemReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-sa-gold-soft border border-sa-gold-border flex items-center justify-center mb-6"><Trophy className="w-7 h-7 text-sa-gold opacity-70"/></div>
              <h3 className="font-serif text-xl text-sa-cream mb-2">No System Reports Yet</h3>
              <p className="text-sm text-sa-cream-muted max-w-sm mb-6 leading-relaxed">Reports are generated monthly to track operational performance.</p>
              <button onClick={handleGenerate} className="sa-btn-primary">Generate Current Report</button>
            </div>
          ) : (<>
            {stats && <div className="grid grid-cols-4 gap-2 mb-8">{[{l:'Reports',v:stats.total},{l:'Avg',v:stats.avg},{l:'Best',v:stats.best},{l:'Gold+',v:stats.goldCount}].map(s=><div key={s.l} className="text-center py-3 rounded-sa" style={{backgroundColor:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)'}}><span className="block font-serif text-lg text-sa-cream">{s.v}</span><span className="text-[0.6rem] uppercase tracking-wider text-sa-cream-faint">{s.l}</span></div>)}</div>}
            <div className="mb-6"><button onClick={handleGenerate} className={hasCurrentReport?'sa-btn-secondary w-full':'sa-btn-primary w-full'}>{hasCurrentReport?`Update ${getMonthLabel(currentMonth)}`:`Generate ${getMonthLabel(currentMonth)}`}</button></div>
            <div className="space-y-3">{sortedReports.map((r,i)=><div key={r.id} className="animate-rise" style={{animationDelay:`${i*0.05}s`,opacity:0}}><SystemCard report={r} onClick={()=>setExpandedReport(r)}/></div>)}</div>
          </>)}
        </div>
      )}

      {expandedReport && <ExpandedReport report={expandedReport} onClose={() => setExpandedReport(null)} />}
    </div>
  );
}
