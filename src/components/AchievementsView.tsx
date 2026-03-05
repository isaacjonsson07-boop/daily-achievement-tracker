import React, { useState, useMemo, useEffect } from 'react';
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

// ═══════════════════════════════════════
// ORNATE SVG FRAMES (modal only)
// ═══════════════════════════════════════

// Diamond frame — elaborate scroll corners with inner dotted border
function DiamondFrame({ color }: { color: string }) {
  const c = color;
  const cFaint = color + '60';
  const cSoft = color + '30';

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <rect x="20" y="20" width="calc(100% - 40px)" height="calc(100% - 40px)"
          rx="4" fill="none" stroke={cFaint} strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      {/* Top-left corner */}
      <svg className="absolute top-0 left-0 w-20 h-20" viewBox="0 0 80 80" fill="none">
        <path d="M8 40 C8 22, 22 8, 40 8" stroke={c} strokeWidth="1.5" fill="none" />
        <path d="M4 50 C4 20, 20 4, 50 4" stroke={cFaint} strokeWidth="1" fill="none" />
        <circle cx="12" cy="12" r="4" stroke={c} strokeWidth="1" fill="none" />
        <path d="M16 8 C20 4, 28 4, 32 8" stroke={c} strokeWidth="1" fill="none" />
        <path d="M8 16 C4 20, 4 28, 8 32" stroke={c} strokeWidth="1" fill="none" />
        <path d="M24 4 L26 2 L28 4 L26 6 Z" fill={c} opacity="0.6" />
        <path d="M4 24 L6 22 L8 24 L6 26 Z" fill={c} opacity="0.6" />
      </svg>

      {/* Top-right corner */}
      <svg className="absolute top-0 right-0 w-20 h-20" viewBox="0 0 80 80" fill="none">
        <path d="M72 40 C72 22, 58 8, 40 8" stroke={c} strokeWidth="1.5" fill="none" />
        <path d="M76 50 C76 20, 60 4, 30 4" stroke={cFaint} strokeWidth="1" fill="none" />
        <circle cx="68" cy="12" r="4" stroke={c} strokeWidth="1" fill="none" />
        <path d="M64 8 C60 4, 52 4, 48 8" stroke={c} strokeWidth="1" fill="none" />
        <path d="M72 16 C76 20, 76 28, 72 32" stroke={c} strokeWidth="1" fill="none" />
        <path d="M56 4 L54 2 L52 4 L54 6 Z" fill={c} opacity="0.6" />
        <path d="M76 24 L74 22 L72 24 L74 26 Z" fill={c} opacity="0.6" />
      </svg>

      {/* Bottom-left corner */}
      <svg className="absolute bottom-0 left-0 w-20 h-20" viewBox="0 0 80 80" fill="none">
        <path d="M8 40 C8 58, 22 72, 40 72" stroke={c} strokeWidth="1.5" fill="none" />
        <path d="M4 30 C4 60, 20 76, 50 76" stroke={cFaint} strokeWidth="1" fill="none" />
        <circle cx="12" cy="68" r="4" stroke={c} strokeWidth="1" fill="none" />
        <path d="M16 72 C20 76, 28 76, 32 72" stroke={c} strokeWidth="1" fill="none" />
        <path d="M8 64 C4 60, 4 52, 8 48" stroke={c} strokeWidth="1" fill="none" />
        <path d="M24 76 L26 74 L28 76 L26 78 Z" fill={c} opacity="0.6" />
        <path d="M4 56 L6 54 L8 56 L6 58 Z" fill={c} opacity="0.6" />
      </svg>

      {/* Bottom-right corner */}
      <svg className="absolute bottom-0 right-0 w-20 h-20" viewBox="0 0 80 80" fill="none">
        <path d="M72 40 C72 58, 58 72, 40 72" stroke={c} strokeWidth="1.5" fill="none" />
        <path d="M76 30 C76 60, 60 76, 30 76" stroke={cFaint} strokeWidth="1" fill="none" />
        <circle cx="68" cy="68" r="4" stroke={c} strokeWidth="1" fill="none" />
        <path d="M64 72 C60 76, 52 76, 48 72" stroke={c} strokeWidth="1" fill="none" />
        <path d="M72 64 C76 60, 76 52, 72 48" stroke={c} strokeWidth="1" fill="none" />
        <path d="M56 76 L54 74 L52 76 L54 78 Z" fill={c} opacity="0.6" />
        <path d="M76 56 L74 54 L72 56 L74 58 Z" fill={c} opacity="0.6" />
      </svg>

      {/* Top edge center accent */}
      <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-6" viewBox="0 0 64 24" fill="none">
        <path d="M20 4 L32 0 L44 4" stroke={c} strokeWidth="1" fill="none" />
        <path d="M32 0 L32 8" stroke={cFaint} strokeWidth="0.5" />
        <path d="M28 6 L32 3 L36 6" stroke={c} strokeWidth="0.8" fill="none" />
      </svg>

      {/* Bottom edge center accent */}
      <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-6" viewBox="0 0 64 24" fill="none">
        <path d="M20 20 L32 24 L44 20" stroke={c} strokeWidth="1" fill="none" />
        <path d="M32 24 L32 16" stroke={cFaint} strokeWidth="0.5" />
        <path d="M28 18 L32 21 L36 18" stroke={c} strokeWidth="0.8" fill="none" />
      </svg>
    </div>
  );
}

// Gold frame — geometric art-deco with diamond shapes and circles
function GoldFrame({ color }: { color: string }) {
  const c = color;
  const cFaint = color + '50';

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">
      {/* Top-left corner */}
      <svg className="absolute top-0 left-0 w-16 h-16" viewBox="0 0 64 64" fill="none">
        <path d="M6 32 L6 10 C6 7, 7 6, 10 6 L32 6" stroke={c} strokeWidth="1.5" />
        <path d="M10 28 L10 14 C10 12, 12 10, 14 10 L28 10" stroke={c} strokeWidth="0.8" />
        <path d="M6 6 L9 3 L12 6 L9 9 Z" fill={c} opacity="0.5" />
        <circle cx="20" cy="6" r="2" stroke={c} strokeWidth="0.8" fill="none" />
        <circle cx="6" cy="20" r="2" stroke={c} strokeWidth="0.8" fill="none" />
      </svg>

      {/* Top-right corner */}
      <svg className="absolute top-0 right-0 w-16 h-16" viewBox="0 0 64 64" fill="none">
        <path d="M58 32 L58 10 C58 7, 57 6, 54 6 L32 6" stroke={c} strokeWidth="1.5" />
        <path d="M54 28 L54 14 C54 12, 52 10, 50 10 L36 10" stroke={c} strokeWidth="0.8" />
        <path d="M58 6 L55 3 L52 6 L55 9 Z" fill={c} opacity="0.5" />
        <circle cx="44" cy="6" r="2" stroke={c} strokeWidth="0.8" fill="none" />
        <circle cx="58" cy="20" r="2" stroke={c} strokeWidth="0.8" fill="none" />
      </svg>

      {/* Bottom-left corner */}
      <svg className="absolute bottom-0 left-0 w-16 h-16" viewBox="0 0 64 64" fill="none">
        <path d="M6 32 L6 54 C6 57, 7 58, 10 58 L32 58" stroke={c} strokeWidth="1.5" />
        <path d="M10 36 L10 50 C10 52, 12 54, 14 54 L28 54" stroke={c} strokeWidth="0.8" />
        <path d="M6 58 L9 61 L12 58 L9 55 Z" fill={c} opacity="0.5" />
        <circle cx="20" cy="58" r="2" stroke={c} strokeWidth="0.8" fill="none" />
        <circle cx="6" cy="44" r="2" stroke={c} strokeWidth="0.8" fill="none" />
      </svg>

      {/* Bottom-right corner */}
      <svg className="absolute bottom-0 right-0 w-16 h-16" viewBox="0 0 64 64" fill="none">
        <path d="M58 32 L58 54 C58 57, 57 58, 54 58 L32 58" stroke={c} strokeWidth="1.5" />
        <path d="M54 36 L54 50 C54 52, 52 54, 50 54 L36 54" stroke={c} strokeWidth="0.8" />
        <path d="M58 58 L55 61 L52 58 L55 55 Z" fill={c} opacity="0.5" />
        <circle cx="44" cy="58" r="2" stroke={c} strokeWidth="0.8" fill="none" />
        <circle cx="58" cy="44" r="2" stroke={c} strokeWidth="0.8" fill="none" />
      </svg>

      {/* Top center accent */}
      <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-5" viewBox="0 0 48 20" fill="none">
        <path d="M24 2 L26 6 L24 10 L22 6 Z" fill={c} opacity="0.4" />
        <path d="M16 6 L24 6" stroke={cFaint} strokeWidth="0.5" />
        <path d="M32 6 L24 6" stroke={cFaint} strokeWidth="0.5" />
        <circle cx="14" cy="6" r="1.5" stroke={c} strokeWidth="0.5" fill="none" />
        <circle cx="34" cy="6" r="1.5" stroke={c} strokeWidth="0.5" fill="none" />
      </svg>

      {/* Bottom center accent */}
      <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-5" viewBox="0 0 48 20" fill="none">
        <path d="M24 18 L26 14 L24 10 L22 14 Z" fill={c} opacity="0.4" />
        <path d="M16 14 L24 14" stroke={cFaint} strokeWidth="0.5" />
        <path d="M32 14 L24 14" stroke={cFaint} strokeWidth="0.5" />
        <circle cx="14" cy="14" r="1.5" stroke={c} strokeWidth="0.5" fill="none" />
        <circle cx="34" cy="14" r="1.5" stroke={c} strokeWidth="0.5" fill="none" />
      </svg>
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
    case 'diamond': return <DiamondFrame color={config.color} />;
    case 'gold': return <GoldFrame color={config.color} />;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-lg rounded-sa-lg"
        style={{
          border: `1px solid ${config.border}`,
          backgroundColor: '#151518',
          boxShadow: isDiamond
            ? '0 0 40px rgba(184, 212, 232, 0.10), 0 0 80px rgba(184, 212, 232, 0.04)'
            : report.tier === 'gold' ? '0 0 30px rgba(197, 165, 90, 0.08)' : 'none',
        }}>

        {/* Ornate tier frame */}
        <TierFrame tier={report.tier} />

        {/* Scrollable content */}
        <div className="max-h-[90vh] overflow-y-auto rounded-sa-lg">
          <div className="relative z-20 p-8 sm:p-10">
            <button onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-sa-cream-faint hover:text-sa-cream transition-colors rounded-sa-sm hover:bg-sa-bg-lift z-30">
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-8">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-sa-cream-faint mb-3">System Report</p>
              <h2 className="font-serif text-2xl text-sa-cream mb-1">{getMonthLabel(report.month)}</h2>
              {report.isInstallationReport && (
                <p className="text-xs mt-1" style={{ color: config.color }}>Installation Complete — Day 21</p>
              )}
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

            <div className="h-px mb-6" style={{ background: `linear-gradient(90deg, transparent, ${config.border}, transparent)` }} />

            <div className="space-y-4 mb-8">
              <p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-cream-faint">Performance Breakdown</p>
              <CategoryBar label={`Habits (${report.habitsCount} tracked)`} score={report.habitsScore} color={config.color} />
              <CategoryBar label={`Tasks (avg ${report.tasksAvgPerDay}/day)`} score={report.tasksScore} color={config.color} />
              <CategoryBar label={`Non-Negotiables (${report.nnCount} active)`} score={report.nnScore} color={config.color} />
            </div>

            {!report.meetsMinimums && (
              <div className="mb-6 p-3 rounded-sa text-xs text-sa-cream-faint"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="font-medium text-sa-cream-muted mb-1">Below system minimums</p>
                <p>
                  Full scoring requires {report.habitsCount < 3 ? `3+ habits (you have ${report.habitsCount})` : ''}
                  {report.habitsCount < 3 && report.tasksAvgPerDay < 3 ? ', ' : ''}
                  {report.tasksAvgPerDay < 3 ? `3+ tasks/day avg (you avg ${report.tasksAvgPerDay})` : ''}
                  {(report.habitsCount < 3 || report.tasksAvgPerDay < 3) && report.nnCount < 2 ? ', ' : ''}
                  {report.nnCount < 2 ? `2+ non-negotiables (you have ${report.nnCount})` : ''}.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { icon: CheckCircle, label: 'Tasks Done', value: String(report.totalTasksCompleted), suffix: '' },
                { icon: Flame, label: 'Streak', value: String(report.longestStreak), suffix: 'days' },
                { icon: Calendar, label: 'Days Active', value: String(report.totalDaysActive), suffix: '' },
                { icon: Target, label: 'Score', value: String(report.score), suffix: '/100', useColor: true },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="p-3 rounded-sa"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                      <span className="text-[0.65rem] uppercase tracking-wider text-sa-cream-faint">{stat.label}</span>
                    </div>
                    <span className="font-serif text-xl" style={{ color: stat.useColor ? config.color : 'var(--cream)' }}>
                      {stat.value}
                      {stat.suffix && <span className="text-sm text-sa-cream-faint ml-1">{stat.suffix}</span>}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mb-2">
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
        System Reports are generated monthly to track your operational performance.
        Each report becomes a card in your achievement history.
      </p>
      <button onClick={onGenerate} className="sa-btn-primary">Generate Current Month Report</button>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

export function AchievementsView({
  nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, userId,
}: AchievementsViewProps) {
  const [reports, setReports] = useState<SystemReport[]>(() => {
    try { const raw = localStorage.getItem('sa_system_reports'); return raw ? JSON.parse(raw) : []; }
    catch { return []; }
  });
  const [expandedReport, setExpandedReport] = useState<SystemReport | null>(null);

  useEffect(() => { localStorage.setItem('sa_system_reports', JSON.stringify(reports)); }, [reports]);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const hasCurrentReport = reports.some(r => r.month === currentMonth);

  const handleGenerate = () => {
    const sorted = [...reports].sort((a, b) => b.month.localeCompare(a.month));
    const previousReport = sorted[0] || null;
    const report = generateMonthlyReport(
      currentMonth, nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, previousReport, userId,
    );
    setReports(prev => {
      const filtered = prev.filter(r => r.month !== currentMonth);
      return [...filtered, report];
    });
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
              <div key={report.id} className="animate-rise"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <SystemCard report={report} onClick={() => setExpandedReport(report)} />
              </div>
            ))}
          </div>
        </>
      )}

      {expandedReport && (
        <ExpandedReport report={expandedReport} onClose={() => setExpandedReport(null)} />
      )}
    </div>
  );
}
