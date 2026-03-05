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

// Diamond frame — elaborate ornamental scrollwork with layered detail
function DiamondFrame({ color }: { color: string }) {
  const c = color;
  const cFaint = color + '50';
  const cSoft = color + '30';

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">
      {/* Top-left corner */}
      <svg className="absolute top-0 left-0 w-28 h-28" viewBox="0 0 112 112" fill="none">
        {/* Outer scroll arc */}
        <path d="M10 56 C10 30, 30 10, 56 10" stroke={c} strokeWidth="1" fill="none" />
        {/* Inner scroll arc */}
        <path d="M16 48 C16 30, 30 16, 48 16" stroke={cFaint} strokeWidth="0.7" fill="none" />
        {/* Corner circle ornament */}
        <circle cx="18" cy="18" r="8" stroke={c} strokeWidth="0.8" fill="none" />
        <circle cx="18" cy="18" r="4" stroke={cFaint} strokeWidth="0.6" fill="none" />
        <circle cx="18" cy="18" r="1.5" fill={c} opacity="0.4" />
        {/* Scroll flourish along top */}
        <path d="M26 10 C30 4, 38 3, 44 6" stroke={c} strokeWidth="0.8" fill="none" />
        <path d="M44 6 C48 8, 50 6, 52 10" stroke={cFaint} strokeWidth="0.6" fill="none" />
        {/* Scroll flourish along left */}
        <path d="M10 26 C4 30, 3 38, 6 44" stroke={c} strokeWidth="0.8" fill="none" />
        <path d="M6 44 C8 48, 6 50, 10 52" stroke={cFaint} strokeWidth="0.6" fill="none" />
        {/* Diamond accents */}
        <path d="M36 6 L38 3 L40 6 L38 9 Z" fill={c} opacity="0.5" />
        <path d="M6 36 L8 33 L10 36 L8 39 Z" fill={c} opacity="0.5" />
        {/* Tiny dot accents */}
        <circle cx="50" cy="10" r="1" fill={c} opacity="0.3" />
        <circle cx="10" cy="50" r="1" fill={c} opacity="0.3" />
        <circle cx="28" cy="6" r="1" fill={c} opacity="0.25" />
        <circle cx="6" cy="28" r="1" fill={c} opacity="0.25" />
      </svg>

      {/* Top-right corner */}
      <svg className="absolute top-0 right-0 w-28 h-28" viewBox="0 0 112 112" fill="none">
        <path d="M102 56 C102 30, 82 10, 56 10" stroke={c} strokeWidth="1" fill="none" />
        <path d="M96 48 C96 30, 82 16, 64 16" stroke={cFaint} strokeWidth="0.7" fill="none" />
        <circle cx="94" cy="18" r="8" stroke={c} strokeWidth="0.8" fill="none" />
        <circle cx="94" cy="18" r="4" stroke={cFaint} strokeWidth="0.6" fill="none" />
        <circle cx="94" cy="18" r="1.5" fill={c} opacity="0.4" />
        <path d="M86 10 C82 4, 74 3, 68 6" stroke={c} strokeWidth="0.8" fill="none" />
        <path d="M68 6 C64 8, 62 6, 60 10" stroke={cFaint} strokeWidth="0.6" fill="none" />
        <path d="M102 26 C108 30, 109 38, 106 44" stroke={c} strokeWidth="0.8" fill="none" />
        <path d="M106 44 C104 48, 106 50, 102 52" stroke={cFaint} strokeWidth="0.6" fill="none" />
        <path d="M76 6 L74 3 L72 6 L74 9 Z" fill={c} opacity="0.5" />
        <path d="M106 36 L104 33 L102 36 L104 39 Z" fill={c} opacity="0.5" />
        <circle cx="62" cy="10" r="1" fill={c} opacity="0.3" />
        <circle cx="102" cy="50" r="1" fill={c} opacity="0.3" />
      </svg>

      {/* Bottom-left corner */}
      <svg className="absolute bottom-0 left-0 w-28 h-28" viewBox="0 0 112 112" fill="none">
        <path d="M10 56 C10 82, 30 102, 56 102" stroke={c} strokeWidth="1" fill="none" />
        <path d="M16 64 C16 82, 30 96, 48 96" stroke={cFaint} strokeWidth="0.7" fill="none" />
        <circle cx="18" cy="94" r="8" stroke={c} strokeWidth="0.8" fill="none" />
        <circle cx="18" cy="94" r="4" stroke={cFaint} strokeWidth="0.6" fill="none" />
        <circle cx="18" cy="94" r="1.5" fill={c} opacity="0.4" />
        <path d="M26 102 C30 108, 38 109, 44 106" stroke={c} strokeWidth="0.8" fill="none" />
        <path d="M44 106 C48 104, 50 106, 52 102" stroke={cFaint} strokeWidth="0.6" fill="none" />
        <path d="M10 86 C4 82, 3 74, 6 68" stroke={c} strokeWidth="0.8" fill="none" />
        <path d="M6 68 C8 64, 6 62, 10 60" stroke={cFaint} strokeWidth="0.6" fill="none" />
        <path d="M36 106 L38 103 L40 106 L38 109 Z" fill={c} opacity="0.5" />
        <path d="M6 76 L8 73 L10 76 L8 79 Z" fill={c} opacity="0.5" />
        <circle cx="50" cy="102" r="1" fill={c} opacity="0.3" />
        <circle cx="10" cy="62" r="1" fill={c} opacity="0.3" />
      </svg>

      {/* Bottom-right corner */}
      <svg className="absolute bottom-0 right-0 w-28 h-28" viewBox="0 0 112 112" fill="none">
        <path d="M102 56 C102 82, 82 102, 56 102" stroke={c} strokeWidth="1" fill="none" />
        <path d="M96 64 C96 82, 82 96, 64 96" stroke={cFaint} strokeWidth="0.7" fill="none" />
        <circle cx="94" cy="94" r="8" stroke={c} strokeWidth="0.8" fill="none" />
        <circle cx="94" cy="94" r="4" stroke={cFaint} strokeWidth="0.6" fill="none" />
        <circle cx="94" cy="94" r="1.5" fill={c} opacity="0.4" />
        <path d="M86 102 C82 108, 74 109, 68 106" stroke={c} strokeWidth="0.8" fill="none" />
        <path d="M68 106 C64 104, 62 106, 60 102" stroke={cFaint} strokeWidth="0.6" fill="none" />
        <path d="M102 86 C108 82, 109 74, 106 68" stroke={c} strokeWidth="0.8" fill="none" />
        <path d="M106 68 C104 64, 106 62, 102 60" stroke={cFaint} strokeWidth="0.6" fill="none" />
        <path d="M76 106 L74 103 L72 106 L74 109 Z" fill={c} opacity="0.5" />
        <path d="M106 76 L104 73 L102 76 L104 79 Z" fill={c} opacity="0.5" />
        <circle cx="62" cy="102" r="1" fill={c} opacity="0.3" />
        <circle cx="102" cy="62" r="1" fill={c} opacity="0.3" />
      </svg>

      {/* Top edge center — crown accent */}
      <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-7" viewBox="0 0 80 28" fill="none">
        <path d="M28 8 L40 1 L52 8" stroke={c} strokeWidth="0.8" fill="none" />
        <path d="M32 6 L40 1 L48 6" stroke={cFaint} strokeWidth="0.5" fill="none" />
        <path d="M40 1 L40 10" stroke={cFaint} strokeWidth="0.4" />
        <path d="M38 5 L40 2 L42 5" fill={c} opacity="0.25" />
        <circle cx="24" cy="8" r="1.5" stroke={c} strokeWidth="0.5" fill="none" />
        <circle cx="56" cy="8" r="1.5" stroke={c} strokeWidth="0.5" fill="none" />
        <path d="M22 8 L18 8" stroke={cSoft} strokeWidth="0.4" />
        <path d="M58 8 L62 8" stroke={cSoft} strokeWidth="0.4" />
      </svg>

      {/* Bottom edge center — inverted crown */}
      <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-7" viewBox="0 0 80 28" fill="none">
        <path d="M28 20 L40 27 L52 20" stroke={c} strokeWidth="0.8" fill="none" />
        <path d="M32 22 L40 27 L48 22" stroke={cFaint} strokeWidth="0.5" fill="none" />
        <path d="M40 27 L40 18" stroke={cFaint} strokeWidth="0.4" />
        <path d="M38 23 L40 26 L42 23" fill={c} opacity="0.25" />
        <circle cx="24" cy="20" r="1.5" stroke={c} strokeWidth="0.5" fill="none" />
        <circle cx="56" cy="20" r="1.5" stroke={c} strokeWidth="0.5" fill="none" />
        <path d="M22 20 L18 20" stroke={cSoft} strokeWidth="0.4" />
        <path d="M58 20 L62 20" stroke={cSoft} strokeWidth="0.4" />
      </svg>
    </div>
  );
}

// Gold frame — elaborate art-deco with layered geometric ornaments
function GoldFrame({ color }: { color: string }) {
  const c = color;
  const cFaint = color + '50';
  const cSoft = color + '30';

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">
      {/* Top-left corner */}
      <svg className="absolute top-0 left-0 w-24 h-24" viewBox="0 0 96 96" fill="none">
        {/* Double L-bracket (thin) */}
        <path d="M8 44 L8 12 C8 9, 9 8, 12 8 L44 8" stroke={c} strokeWidth="0.8" />
        <path d="M14 36 L14 18 C14 16, 16 14, 18 14 L36 14" stroke={cFaint} strokeWidth="0.5" />
        {/* Corner diamond */}
        <path d="M8 8 L12 3 L16 8 L12 13 Z" stroke={c} strokeWidth="0.7" fill="none" />
        <path d="M12 5 L14 8 L12 11 L10 8 Z" fill={c} opacity="0.3" />
        {/* Circle accents along edges */}
        <circle cx="26" cy="8" r="2.5" stroke={c} strokeWidth="0.6" fill="none" />
        <circle cx="8" cy="26" r="2.5" stroke={c} strokeWidth="0.6" fill="none" />
        <circle cx="38" cy="8" r="1.5" stroke={cFaint} strokeWidth="0.5" fill="none" />
        <circle cx="8" cy="38" r="1.5" stroke={cFaint} strokeWidth="0.5" fill="none" />
        {/* Small diamond along top */}
        <path d="M32 6 L33 4 L34 6 L33 8 Z" fill={c} opacity="0.35" />
        <path d="M6 32 L4 33 L6 34 L8 33 Z" fill={c} opacity="0.35" />
        {/* Dot trail */}
        <circle cx="44" cy="8" r="0.8" fill={c} opacity="0.2" />
        <circle cx="8" cy="44" r="0.8" fill={c} opacity="0.2" />
      </svg>

      {/* Top-right corner */}
      <svg className="absolute top-0 right-0 w-24 h-24" viewBox="0 0 96 96" fill="none">
        <path d="M88 44 L88 12 C88 9, 87 8, 84 8 L52 8" stroke={c} strokeWidth="0.8" />
        <path d="M82 36 L82 18 C82 16, 80 14, 78 14 L60 14" stroke={cFaint} strokeWidth="0.5" />
        <path d="M88 8 L84 3 L80 8 L84 13 Z" stroke={c} strokeWidth="0.7" fill="none" />
        <path d="M84 5 L82 8 L84 11 L86 8 Z" fill={c} opacity="0.3" />
        <circle cx="70" cy="8" r="2.5" stroke={c} strokeWidth="0.6" fill="none" />
        <circle cx="88" cy="26" r="2.5" stroke={c} strokeWidth="0.6" fill="none" />
        <circle cx="58" cy="8" r="1.5" stroke={cFaint} strokeWidth="0.5" fill="none" />
        <circle cx="88" cy="38" r="1.5" stroke={cFaint} strokeWidth="0.5" fill="none" />
        <path d="M64 6 L63 4 L62 6 L63 8 Z" fill={c} opacity="0.35" />
        <path d="M90 32 L92 33 L90 34 L88 33 Z" fill={c} opacity="0.35" />
        <circle cx="52" cy="8" r="0.8" fill={c} opacity="0.2" />
        <circle cx="88" cy="44" r="0.8" fill={c} opacity="0.2" />
      </svg>

      {/* Bottom-left corner */}
      <svg className="absolute bottom-0 left-0 w-24 h-24" viewBox="0 0 96 96" fill="none">
        <path d="M8 52 L8 84 C8 87, 9 88, 12 88 L44 88" stroke={c} strokeWidth="0.8" />
        <path d="M14 60 L14 78 C14 80, 16 82, 18 82 L36 82" stroke={cFaint} strokeWidth="0.5" />
        <path d="M8 88 L12 93 L16 88 L12 83 Z" stroke={c} strokeWidth="0.7" fill="none" />
        <path d="M12 85 L14 88 L12 91 L10 88 Z" fill={c} opacity="0.3" />
        <circle cx="26" cy="88" r="2.5" stroke={c} strokeWidth="0.6" fill="none" />
        <circle cx="8" cy="70" r="2.5" stroke={c} strokeWidth="0.6" fill="none" />
        <circle cx="38" cy="88" r="1.5" stroke={cFaint} strokeWidth="0.5" fill="none" />
        <circle cx="8" cy="58" r="1.5" stroke={cFaint} strokeWidth="0.5" fill="none" />
        <path d="M32 90 L33 92 L34 90 L33 88 Z" fill={c} opacity="0.35" />
        <path d="M6 64 L4 63 L6 62 L8 63 Z" fill={c} opacity="0.35" />
        <circle cx="44" cy="88" r="0.8" fill={c} opacity="0.2" />
        <circle cx="8" cy="52" r="0.8" fill={c} opacity="0.2" />
      </svg>

      {/* Bottom-right corner */}
      <svg className="absolute bottom-0 right-0 w-24 h-24" viewBox="0 0 96 96" fill="none">
        <path d="M88 52 L88 84 C88 87, 87 88, 84 88 L52 88" stroke={c} strokeWidth="0.8" />
        <path d="M82 60 L82 78 C82 80, 80 82, 78 82 L60 82" stroke={cFaint} strokeWidth="0.5" />
        <path d="M88 88 L84 93 L80 88 L84 83 Z" stroke={c} strokeWidth="0.7" fill="none" />
        <path d="M84 85 L82 88 L84 91 L86 88 Z" fill={c} opacity="0.3" />
        <circle cx="70" cy="88" r="2.5" stroke={c} strokeWidth="0.6" fill="none" />
        <circle cx="88" cy="70" r="2.5" stroke={c} strokeWidth="0.6" fill="none" />
        <circle cx="58" cy="88" r="1.5" stroke={cFaint} strokeWidth="0.5" fill="none" />
        <circle cx="88" cy="58" r="1.5" stroke={cFaint} strokeWidth="0.5" fill="none" />
        <path d="M64 90 L63 92 L62 90 L63 88 Z" fill={c} opacity="0.35" />
        <path d="M90 64 L92 63 L90 62 L88 63 Z" fill={c} opacity="0.35" />
        <circle cx="52" cy="88" r="0.8" fill={c} opacity="0.2" />
        <circle cx="88" cy="52" r="0.8" fill={c} opacity="0.2" />
      </svg>

      {/* Top center — art-deco crest */}
      <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-6" viewBox="0 0 64 24" fill="none">
        <path d="M32 3 L35 8 L32 13 L29 8 Z" stroke={c} strokeWidth="0.6" fill="none" />
        <path d="M32 6 L33 8 L32 10 L31 8 Z" fill={c} opacity="0.3" />
        <circle cx="22" cy="8" r="2" stroke={c} strokeWidth="0.5" fill="none" />
        <circle cx="42" cy="8" r="2" stroke={c} strokeWidth="0.5" fill="none" />
        <path d="M24 8 L29 8" stroke={cSoft} strokeWidth="0.4" />
        <path d="M35 8 L40 8" stroke={cSoft} strokeWidth="0.4" />
        <circle cx="18" cy="8" r="0.8" fill={c} opacity="0.2" />
        <circle cx="46" cy="8" r="0.8" fill={c} opacity="0.2" />
      </svg>

      {/* Bottom center — inverted crest */}
      <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-6" viewBox="0 0 64 24" fill="none">
        <path d="M32 21 L35 16 L32 11 L29 16 Z" stroke={c} strokeWidth="0.6" fill="none" />
        <path d="M32 18 L33 16 L32 14 L31 16 Z" fill={c} opacity="0.3" />
        <circle cx="22" cy="16" r="2" stroke={c} strokeWidth="0.5" fill="none" />
        <circle cx="42" cy="16" r="2" stroke={c} strokeWidth="0.5" fill="none" />
        <path d="M24 16 L29 16" stroke={cSoft} strokeWidth="0.4" />
        <path d="M35 16 L40 16" stroke={cSoft} strokeWidth="0.4" />
        <circle cx="18" cy="16" r="0.8" fill={c} opacity="0.2" />
        <circle cx="46" cy="16" r="0.8" fill={c} opacity="0.2" />
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
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-lg rounded-sa-lg"
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
