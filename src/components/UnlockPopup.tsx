import React from 'react';
import { Check } from 'lucide-react';
import { UnlockDef } from '../data/unlockContent';

// ============================================
// STRUCTURED ACHIEVEMENT — Unlock Popup
// Shown once when a user triggers a feature
// unlock via a lesson action button.
// ============================================

interface UnlockPopupProps {
  unlock: UnlockDef;
  onDismiss: () => void;
}

function phaseColor(phase: 1 | 2 | 3): string {
  if (phase === 2) return '#6DB5F5';
  if (phase === 3) return '#6ECB8B';
  return '#C5A55A';
}

function phaseLabel(phase: 1 | 2 | 3): string {
  if (phase === 2) return 'Phase II — Reconstruct';
  if (phase === 3) return 'Phase III — Install';
  return 'Phase I — Stabilize';
}

export function UnlockPopup({ unlock, onDismiss }: UnlockPopupProps) {
  const color = phaseColor(unlock.phase);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(13,13,15,0.88)', backdropFilter: 'blur(10px)' }}
      onClick={onDismiss}
    >
      <div
        className="max-w-sm w-full rounded-sa-lg overflow-hidden"
        style={{
          backgroundColor: 'rgba(26,25,23,0.98)',
          border: `1px solid ${color}30`,
          boxShadow: `0 0 40px ${color}10`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Phase accent bar */}
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

        <div className="px-7 py-8 text-center">
          {/* Check icon in phase-colored circle */}
          <div
            className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: `${color}12`,
              border: `1px solid ${color}30`,
            }}
          >
            <Check className="w-6 h-6" style={{ color }} strokeWidth={2.5} />
          </div>

          {/* Phase label */}
          <p
            className="text-[0.65rem] uppercase tracking-[0.15em] mb-2"
            style={{ color: `${color}99` }}
          >
            {phaseLabel(unlock.phase)}
          </p>

          {/* Title */}
          <h2 className="font-serif text-xl text-sa-cream mb-4">
            {unlock.title}
          </h2>

          {/* Explanation */}
          <p className="text-sm text-sa-cream-muted leading-relaxed mb-8">
            {unlock.explanation}
          </p>

          {/* Got it button */}
          <button
            onClick={onDismiss}
            className="px-6 py-2.5 rounded-sa text-sm font-medium transition-colors duration-150"
            style={{
              backgroundColor: `${color}18`,
              border: `1px solid ${color}35`,
              color,
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
