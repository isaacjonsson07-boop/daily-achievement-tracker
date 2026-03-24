import React, { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        ref={panelRef}
        onClick={e => e.stopPropagation()}
        className="relative z-10 w-full max-w-[340px] bg-sa-bg-warm border border-sa-border rounded-xl p-5 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150"
      >
        <h3 className="font-display text-[1.05rem] text-sa-cream">{title}</h3>
        <p className="text-[0.85rem] text-sa-cream-muted leading-relaxed">{message}</p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-[0.82rem] font-medium text-sa-cream-muted border border-sa-border rounded-lg hover:bg-sa-border/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-[0.82rem] font-medium text-sa-rose bg-sa-rose-soft border border-sa-rose-border rounded-lg hover:bg-sa-rose/20 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
