import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Target, Flame, Calendar, CheckCircle, AlertTriangle, X } from 'lucide-react';
import {
  NonNegotiable, NonNegotiableCompletion,
  Habit, HabitCompletion, DailyTask,
  SystemReport, ReportTier,
} from '../types';
import { uid } from '../utils/dateUtils';
import { generateMonthlyReport, getTier, TIER_CONFIG } from '../utils/scoreUtils';

interface AchievementsViewProps {
  nonNegotiables: NonNegotiable[];
  nnCompletions: NonNegotiableCompletion[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  dailyTasks: DailyTask[];
  userId?: string;
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

// ── Animated glow for diamond tier cards ──

function DiamondGlow({ width, height }: { width: number; height: number }) {
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!width || !height) return;
    const speed = 55;

    function animate() {
      const perimeter = 2 * width + 2 * height;
      const now = performance.now() / 1000;

      [line1Ref, line2Ref].forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;
        const dist = ((now * speed) + (i * perimeter / 2)) % perimeter;

        // Prismatic color shift based on position
        const ratio = dist / perimeter;
        const hue = 195 + Math.sin(ratio * Math.PI * 2 + now * 0.5) * 30; // shifts between cool blue and soft violet
        const glowColor = `hsla(${hue}, 55%, 78%, 0.55)`;

        if (dist < width) {
          el.style.top = '-1px';
          el.style.left = `${dist - 35}px`;
          el.style.bottom = 'auto';
          el.style.right = 'auto';
          el.style.width = '70px';
          el.style.height = '2px';
          el.style.background = `radial-gradient(ellipse at 50% 50%, ${glowColor} 0%, transparent 70%)`;
        } else if (dist < width + height) {
          const d = dist - width;
          el.style.top = `${d - 35}px`;
          el.style.left = `${width - 1}px`;
          el.style.right = 'auto';
          el.style.bottom = 'auto';
          el.style.width = '2px';
          el.style.height = '70px';
          el.style.background = `radial-gradient(ellipse at 50% 50%, ${glowColor} 0%, transparent 70%)`;
        } else if (dist < 2 * width + height) {
          const d = dist - width - height;
          el.style.top = `${height - 1}px`;
          el.style.left = `${width - d - 35}px`;
          el.style.bottom = 'auto';
          el.style.right = 'auto';
          el.style.width = '70px';
          el.style.height = '2px';
          el.style.background = `radial-gradient(ellipse at 50% 50%, ${glowColor} 0%, transparent 70%)`;
        } else {
          const d = dist - 2 * width - height;
          el.style.top = `${height - d - 35}px`;
          el.style.left = '-1px';
          el.style.bottom = 'auto';
          el.style.right = 'auto';
          el.style.width = '2px';
          el.style.height = '70px';
          el.style.background = `radial-gradient(ellipse at 50% 50%, ${glowColor} 0%, transparent 70%)`;
        }
      });

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height]);

  return (
    <>
      <div ref={line1Ref} className="absolute pointer-events-none z-10" style={{ position: 'absolute' }} />
      <div ref={line2Ref} className="absolute pointer-events-none z-10" style={{ position: 'absolute' }} />
    </>
  );
}

// ── Score ring (circular progress) ──

function ScoreRing({ score, tier, size = 80 }: { score: number; tier: ReportTier; size?: number }) {
  const config = TIER_CONFIG[tier];
  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={config.color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-xl" style={{ color: config.color }}>{score}</span>
      </div>
    </div>
  );
}

// ── Delta indicator ──

function DeltaBadge({ delta }: { delta?: number }) {
  if (delta === undefined || delta === null) return null;

  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-sa-green">
        <TrendingUp className="w-3 h-3" />+{delta} <span className="text-sa-cream-faint">vs last</span>
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-sa-rose">
        <TrendingDown className="w-3 h-3" />{delta} <span className="text-sa-cream-faint">vs last</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-sa-cream-faint">
      <Minus className="w-3 h-3" />0 vs last
    </span>
  );
}

// ── Progress bar for category score ──

function CategoryBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-sa-cream-muted">{label}</span>
        <span className="text-xs font-medium tabular-nums" style={{ color }}>{score}%</span>
      </div>
      <div className="w-full h-1.5 bg-sa-bg-lift rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── System Card (compact, in grid) ──

function SystemCard({
  report,
  onClick,
}: {
  report: SystemReport;
  onClick: () => void;
}) {
  const config = TIER_CONFIG[report.tier];
  const isDiamond = report.tier === 'diamond';
  const isGoldTier = report.tier === 'gold' || isDiamond;
  const cardRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (cardRef.current) {
      const { width, height } = cardRef.current.getBoundingClientRect();
      setDims({ w: width, h: height });
    }
  }, []);

  return (
    <button
      onClick={onClick}
      className="w-full text-left group relative overflow-hidden rounded-sa-lg transition-all duration-200 hover:scale-[1.01]"
      style={{
        border: `1.5px solid ${isDiamond ? config.color : config.border}`,
        backgroundColor: config.bg,
        boxShadow: isDiamond ? '0 0 20px rgba(184, 212, 232, 0.08), 0 0 40px rgba(184, 212, 232, 0.04)' : 'none',
      }}
    >
      <div ref={cardRef} className="relative p-5">
        {isDiamond && dims.w > 0 && (
          <DiamondGlow width={dims.w} height={dims.h} />
        )}

        {/* Corner accents for gold and diamond */}
        {isGoldTier && (
          <>
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: config.color, opacity: isDiamond ? 0.7 : 0.5 }} />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r" style={{ borderColor: config.color, opacity: isDiamond ? 0.7 : 0.5 }} />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l" style={{ borderColor: config.color, opacity: isDiamond ? 0.7 : 0.5 }} />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{ borderColor: config.color, opacity: isDiamond ? 0.7 : 0.5 }} />
          </>
        )}

        {/* Card content */}
        <div className="relative z-20 flex items-center gap-4">
          <ScoreRing score={report.score} tier={report.tier} size={64} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-serif text-base text-sa-cream">{getShortMonthLabel(report.month)}</span>
              <span className="text-xs text-sa-cream-faint">{getYearLabel(report.month)}</span>
              {report.isInstallationReport && (
                <span className="text-[0.6rem] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: config.color, backgroundColor: config.bg, border: `1px solid ${config.border}` }}>
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

// ── Expanded Report (full view) ──

function ExpandedReport({
  report,
  onClose,
}: {
  report: SystemReport;
  onClose: () => void;
}) {
  const config = TIER_CONFIG[report.tier];
  const isDiamond = report.tier === 'diamond';
  const isGoldTier = report.tier === 'gold' || isDiamond;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      {/* Outer frame — non-scrolling, holds corners and glow */}
      <div
        className="relative w-full max-w-lg rounded-sa-lg"
        style={{
          border: `1.5px solid ${isDiamond ? config.color : config.border}`,
          backgroundColor: '#151518',
          boxShadow: isDiamond
            ? '0 0 40px rgba(184, 212, 232, 0.12), 0 0 80px rgba(184, 212, 232, 0.05), inset 0 0 60px rgba(184, 212, 232, 0.02)'
            : 'none',
        }}
      >
        {/* Corner accents — fixed to the visual frame */}
        {isGoldTier && (
          <>
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 rounded-tl-sa-lg z-30 pointer-events-none" style={{ borderColor: config.color, opacity: isDiamond ? 0.8 : 0.4 }} />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 rounded-tr-sa-lg z-30 pointer-events-none" style={{ borderColor: config.color, opacity: isDiamond ? 0.8 : 0.4 }} />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 rounded-bl-sa-lg z-30 pointer-events-none" style={{ borderColor: config.color, opacity: isDiamond ? 0.8 : 0.4 }} />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 rounded-br-sa-lg z-30 pointer-events-none" style={{ borderColor: config.color, opacity: isDiamond ? 0.8 : 0.4 }} />
          </>
        )}

        {/* Diamond shimmer bar at top */}
        {isDiamond && (
          <div className="absolute top-0 left-0 right-0 h-px z-20 overflow-hidden pointer-events-none">
            <div
              className="h-full w-24"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(184,212,232,0.6), transparent)',
                animation: 'shimmerSlide 3s ease-in-out infinite',
              }}
            />
          </div>
        )}

        {/* Scrollable content */}
        <div className="max-h-[90vh] overflow-y-auto rounded-sa-lg">
          <div className="relative z-20 p-6 sm:p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-sa-cream-faint hover:text-sa-cream transition-colors rounded-sa-sm hover:bg-sa-bg-lift z-30"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-sa-cream-faint mb-3">System Report</p>
            <h2 className="font-serif text-2xl text-sa-cream mb-1">{getMonthLabel(report.month)}</h2>
            {report.isInstallationReport && (
              <p className="text-xs mt-1" style={{ color: config.color }}>Installation Complete — Day 21</p>
            )}

            {/* Score ring centered */}
            <div className="flex justify-center mt-6 mb-3">
              <ScoreRing score={report.score} tier={report.tier} size={100} />
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="text-sm font-medium uppercase tracking-wider" style={{ color: config.color }}>
                {config.label}
              </span>
              <DeltaBadge delta={report.scoreDelta} />
            </div>

            {report.scoreCapped && (
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <AlertTriangle className="w-3.5 h-3.5 text-sa-cream-faint" />
                <span className="text-xs text-sa-cream-faint">Score capped at 75 — below system minimums</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px mb-6" style={{ background: `linear-gradient(90deg, transparent, ${config.border}, transparent)` }} />

          {/* Category breakdown */}
          <div className="space-y-4 mb-8">
            <p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-cream-faint">Performance Breakdown</p>
            <CategoryBar label={`Habits (${report.habitsCount} tracked)`} score={report.habitsScore} color={config.color} />
            <CategoryBar label={`Tasks (avg ${report.tasksAvgPerDay}/day)`} score={report.tasksScore} color={config.color} />
            <CategoryBar label={`Non-Negotiables (${report.nnCount} active)`} score={report.nnScore} color={config.color} />
          </div>

          {/* Minimums status */}
          {!report.meetsMinimums && (
            <div className="mb-6 p-3 rounded-sa text-xs text-sa-cream-faint" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-medium text-sa-cream-muted mb-1">Below system minimums</p>
              <p>
                Full scoring requires {report.habitsCount < 3 ? `3+ habits (you have ${report.habitsCount})` : ''}
                {report.habitsCount < 3 && report.tasksAvgPerDay < 3 ? ', ' : ''}
                {report.tasksAvgPerDay < 3 ? `3+ tasks/day avg (you avg ${report.tasksAvgPerDay})` : ''}
                {(report.habitsCount < 3 || report.tasksAvgPerDay < 3) && report.nnCount < 2 ? ', ' : ''}
                {report.nnCount < 2 ? `2+ non-negotiables (you have ${report.nnCount})` : ''}
                .
              </p>
            </div>
          )}

          {/* Key stats */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="p-3 rounded-sa" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle className="w-3.5 h-3.5" style={{ color: config.color }} />
                <span className="text-[0.65rem] uppercase tracking-wider text-sa-cream-faint">Tasks Done</span>
              </div>
              <span className="font-serif text-xl text-sa-cream">{report.totalTasksCompleted}</span>
            </div>

            <div className="p-3 rounded-sa" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Flame className="w-3.5 h-3.5" style={{ color: config.color }} />
                <span className="text-[0.65rem] uppercase tracking-wider text-sa-cream-faint">Streak</span>
              </div>
              <span className="font-serif text-xl text-sa-cream">{report.longestStreak}<span className="text-sm text-sa-cream-faint ml-1">days</span></span>
            </div>

            <div className="p-3 rounded-sa" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5" style={{ color: config.color }} />
                <span className="text-[0.65rem] uppercase tracking-wider text-sa-cream-faint">Days Active</span>
              </div>
              <span className="font-serif text-xl text-sa-cream">{report.totalDaysActive}</span>
            </div>

            <div className="p-3 rounded-sa" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5" style={{ color: config.color }} />
                <span className="text-[0.65rem] uppercase tracking-wider text-sa-cream-faint">Score</span>
              </div>
              <span className="font-serif text-xl" style={{ color: config.color }}>{report.score}<span className="text-sm text-sa-cream-faint">/100</span></span>
            </div>
          </div>

          {/* Personal highlight */}
          <div className="mb-6">
            <div className="h-px mb-5" style={{ background: `linear-gradient(90deg, transparent, ${config.border}, transparent)` }} />
            <p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-cream-faint mb-3">Personal Highlight</p>
            <p className="text-sm text-sa-cream-soft italic leading-relaxed">"{report.personalHighlight}"</p>
          </div>
        </div>
        </div>
      </div>
    </div>
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
        System Reports are generated monthly to track your operational performance. Each report becomes a card in your achievement history.
      </p>
      <button
        onClick={onGenerate}
        className="sa-btn-primary"
      >
        Generate Current Month Report
      </button>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export function AchievementsView({
  nonNegotiables,
  nnCompletions,
  habits,
  habitCompletions,
  dailyTasks,
  userId,
}: AchievementsViewProps) {
  const [reports, setReports] = useState<SystemReport[]>(() => {
    try {
      const raw = localStorage.getItem('sa_system_reports');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [expandedReport, setExpandedReport] = useState<SystemReport | null>(null);

  // Persist reports
  useEffect(() => {
    localStorage.setItem('sa_system_reports', JSON.stringify(reports));
  }, [reports]);

  // Current month string
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Check if current month already has a report
  const hasCurrentReport = reports.some(r => r.month === currentMonth);

  // Generate report for current month
  const handleGenerate = () => {
    // Find previous report for delta calculation
    const sorted = [...reports].sort((a, b) => b.month.localeCompare(a.month));
    const previousReport = sorted[0] || null;

    const report = generateMonthlyReport(
      currentMonth,
      nonNegotiables,
      nnCompletions,
      habits,
      habitCompletions,
      dailyTasks,
      previousReport,
      userId,
    );

    // Replace if already exists for this month, otherwise add
    setReports(prev => {
      const filtered = prev.filter(r => r.month !== currentMonth);
      return [...filtered, report];
    });

    setExpandedReport(report);
  };

  // Sort reports newest first
  const sortedReports = useMemo(() =>
    [...reports].sort((a, b) => b.month.localeCompare(a.month)),
    [reports]
  );

  // Stats summary
  const stats = useMemo(() => {
    if (reports.length === 0) return null;
    const avg = Math.round(reports.reduce((sum, r) => sum + r.score, 0) / reports.length);
    const best = Math.max(...reports.map(r => r.score));
    const goldCount = reports.filter(r => r.tier === 'gold' || r.tier === 'diamond').length;
    return { avg, best, goldCount, total: reports.length };
  }, [reports]);

  return (
    <div className="pt-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-5 h-5 text-sa-gold opacity-80" />
          <h2 className="font-serif text-2xl text-sa-cream">Achievements</h2>
        </div>
        <p className="text-sm text-sa-cream-muted">
          Monthly System Reports. Your operational history, measured and recorded.
        </p>
      </div>

      {reports.length === 0 ? (
        <EmptyState onGenerate={handleGenerate} />
      ) : (
        <>
          {/* Stats bar */}
          {stats && (
            <div className="grid grid-cols-4 gap-2 mb-8">
              {[
                { label: 'Reports', value: stats.total },
                { label: 'Avg Score', value: stats.avg },
                { label: 'Best', value: stats.best },
                { label: 'Gold+', value: stats.goldCount },
              ].map(s => (
                <div key={s.label} className="text-center py-3 rounded-sa" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="block font-serif text-lg text-sa-cream">{s.value}</span>
                  <span className="text-[0.6rem] uppercase tracking-wider text-sa-cream-faint">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Generate / Update button */}
          <div className="mb-6">
            <button
              onClick={handleGenerate}
              className={hasCurrentReport ? 'sa-btn-secondary w-full' : 'sa-btn-primary w-full'}
            >
              {hasCurrentReport ? `Update ${getMonthLabel(currentMonth)} Report` : `Generate ${getMonthLabel(currentMonth)} Report`}
            </button>
          </div>

          {/* Cards grid */}
          <div className="space-y-3">
            {sortedReports.map((report, i) => (
              <div
                key={report.id}
                className="animate-rise"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <SystemCard
                  report={report}
                  onClick={() => setExpandedReport(report)}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Expanded report modal */}
      {expandedReport && (
        <ExpandedReport
          report={expandedReport}
          onClose={() => setExpandedReport(null)}
        />
      )}
    </div>
  );
}
