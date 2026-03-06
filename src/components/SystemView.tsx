import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Pencil, FileText, Shield, Compass, Brain } from 'lucide-react';
import { NonNegotiable, Habit, SystemDocument } from '../types';
import { uid } from '../utils/dateUtils';
import { supabase } from '../lib/supabase';

interface SystemViewProps {
  nonNegotiables: NonNegotiable[];
  onAddNonNegotiable: (nn: NonNegotiable) => void;
  onDeleteNonNegotiable: (id: string) => void;
  systemDocuments: Record<string, string>;
  onUpdateSystemDocument: (key: string, content: string) => void;
  habits: Habit[];
  onHabitsChange: () => void;
  user?: { id?: string } | null;
}

const DAY_LABELS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

const DOC_TYPES: { key: SystemDocument['doc_type']; label: string; icon: React.ElementType; placeholder: string; day: string }[] = [
  { key: 'direction', label: 'Direction Statement', icon: Compass, placeholder: 'What you are building and why. Your north star.', day: 'Day 1' },
  { key: 'identity', label: 'Identity Statement', icon: Brain, placeholder: '"I am the kind of person who…"', day: 'Day 8' },
  { key: 'priorities', label: 'Priority Stack', icon: Target, placeholder: 'Your ranked priorities. What gets protected first.', day: 'Day 9' },
  { key: 'decision_rules', label: 'Decision Framework', icon: Shield, placeholder: 'Your rules for making decisions under pressure.', day: 'Day 13' },
  { key: 'failure_protocol', label: 'Failure Protocol', icon: Shield, placeholder: 'What you do when you miss a day or fall off track.', day: 'Day 16' },
  { key: 'operating_manual', label: 'Operating Manual', icon: FileText, placeholder: 'Your complete personal operating system. The consolidation of everything above.', day: 'Day 20' },
];

export function SystemView({
  nonNegotiables,
  onAddNonNegotiable,
  onDeleteNonNegotiable,
  systemDocuments,
  onUpdateSystemDocument,
  habits,
  onHabitsChange,
  user,
}: SystemViewProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['documents']));
  const [showAddNN, setShowAddNN] = useState(false);
  const [newNNTitle, setNewNNTitle] = useState('');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', time: '09:00', days: [1, 2, 3, 4, 5] as number[] });

  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState('');

  const handleSaveDoc = (key: string) => {
    onUpdateSystemDocument(key, editBuffer);
    setEditingDoc(null);
    setEditBuffer('');
  };

  const handleEditDoc = (key: string) => {
    setEditingDoc(key);
    setEditBuffer(systemDocuments[key] || '');
  };

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // === Non-Negotiable Handlers ===
  const handleAddNN = () => {
    if (!newNNTitle.trim()) return;
    const nn: NonNegotiable = {
      id: uid(),
      user_id: user?.id || 'local',
      title: newNNTitle.trim(),
      order: nonNegotiables.length,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onAddNonNegotiable(nn);
    setNewNNTitle('');
    setShowAddNN(false);
  };

  const handleDeleteNN = (id: string) => {
    onDeleteNonNegotiable(id);
  };

  // === Habit Handlers ===
  const handleAddHabit = async () => {
    if (!newHabit.name.trim() || !user) return;
    try {
      await supabase.from('habits').insert({
        user_id: user.id,
        name: newHabit.name.trim(),
        target_number: 1,
        days_of_week: newHabit.days,
        time: newHabit.time,
      });
      onHabitsChange();
      setNewHabit({ name: '', time: '09:00', days: [1, 2, 3, 4, 5] });
      setShowAddHabit(false);
    } catch (e) {
      console.error('Error adding habit:', e);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!user) return;
    try {
      await supabase.from('habits').delete().eq('id', id);
      onHabitsChange();
    } catch (e) {
      console.error('Error deleting habit:', e);
    }
  };

  // === Shared Components ===
  const SectionHeader = ({ id, title, count, color }: { id: string; title: string; count: number; color: string }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between py-4 px-1 border-b border-sa-border group"
    >
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <span className="sa-section-subtitle" style={{ color }}>{title}</span>
        <span className="text-xs text-sa-cream-faint">({count})</span>
      </div>
      {openSections.has(id) ? (
        <ChevronUp className="w-4 h-4 text-sa-cream-faint" />
      ) : (
        <ChevronDown className="w-4 h-4 text-sa-cream-faint" />
      )}
    </button>
  );

  const docsWithContent = DOC_TYPES.filter(d => systemDocuments[d.key]?.trim()).length;

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header handled by TabCover */}
      <div className="mb-4 animate-rise" />

      {/* ── Two Column Layout ── */}
      <div>

        {/* System Documents */}
        <div>
          <div className="animate-rise delay-1">
            <SectionHeader
              id="documents"
              title="System Documents"
              count={docsWithContent}
              color="var(--gold)"
            />
            {openSections.has('documents') && (
              <div className="py-4 space-y-3">
                <p className="text-xs text-sa-cream-faint mb-2">
                  Living documents built during Installation. Update them during monthly recalibrations.
                </p>

            {DOC_TYPES.map((doc) => {
              const Icon = doc.icon;
              const content = systemDocuments[doc.key];
              const hasContent = content && content.trim().length > 0;
              const isEditing = editingDoc === doc.key;

              return (
                <div key={doc.key} className="sa-card">
                  <div className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${hasContent ? 'text-sa-gold' : 'text-sa-cream-faint'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-sa-cream font-medium">{doc.label}</span>
                          <span className="text-[0.55rem] text-sa-cream-faint uppercase tracking-wider">{doc.day}</span>
                        </div>
                        {!isEditing && (
                          <button
                            onClick={() => handleEditDoc(doc.key)}
                            className="sa-btn-ghost p-1"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="mt-2">
                          <textarea
                            value={editBuffer}
                            onChange={(e) => setEditBuffer(e.target.value)}
                            placeholder={doc.placeholder}
                            autoFocus
                            rows={4}
                            className="sa-textarea text-sm"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => { setEditingDoc(null); setEditBuffer(''); }}
                              className="sa-btn-ghost text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveDoc(doc.key)}
                              className="sa-btn-primary text-xs"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : hasContent ? (
                        <p className="text-sm text-sa-cream-soft whitespace-pre-line leading-relaxed line-clamp-3">
                          {content}
                        </p>
                      ) : (
                        <p className="text-xs text-sa-cream-faint italic">{doc.placeholder}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        </div>

      {/* ── Non-Negotiables ── */}
      <div className="animate-rise delay-2">
        <SectionHeader
          id="non-negotiables"
          title="Non-Negotiables"
          count={nonNegotiables.filter((n) => n.active).length}
          color="var(--gold)"
        />
        {openSections.has('non-negotiables') && (
          <div className="py-4">
            <p className="text-xs text-sa-cream-faint mb-4">
              The behaviors you execute every single day. No exceptions.
            </p>
            <div className="space-y-2 mb-4">
              {nonNegotiables
                .filter((n) => n.active)
                .map((nn) => (
                  <div
                    key={nn.id}
                    className="group flex items-center gap-3 px-4 py-3 bg-sa-bg-warm border border-sa-border rounded-sa"
                  >
                    <div className="w-2 h-2 rounded-full bg-sa-gold flex-shrink-0" />
                    <span className="flex-1 text-sm text-sa-cream">{nn.title}</span>
                    <button
                      onClick={() => handleDeleteNN(nn.id)}
                      className="p-1 text-sa-cream-faint opacity-0 group-hover:opacity-100 hover:text-sa-rose transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>

            {showAddNN ? (
              <div className="sa-card space-y-3">
                <input
                  type="text"
                  value={newNNTitle}
                  onChange={(e) => setNewNNTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNN()}
                  placeholder="e.g., Morning sequence completed"
                  autoFocus
                  className="sa-input"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setShowAddNN(false); setNewNNTitle(''); }} className="sa-btn-ghost text-xs">
                    Cancel
                  </button>
                  <button onClick={handleAddNN} disabled={!newNNTitle.trim()} className="sa-btn-primary text-xs disabled:opacity-30">
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddNN(true)}
                className="flex items-center gap-1.5 text-xs text-sa-cream-faint hover:text-sa-gold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add non-negotiable
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Keystone Habits ── */}
      <div className="animate-rise delay-3">
        <SectionHeader id="habits" title="Keystone Habits" count={habits.length} color="var(--blue)" />
        {openSections.has('habits') && (
          <div className="py-4">
            <p className="text-xs text-sa-cream-faint mb-4">
              Recurring behaviors tied to specific days. These build your operational rhythm.
            </p>
            <div className="space-y-2 mb-4">
              {habits.map((h) => (
                <div
                  key={h.id}
                  className="group flex items-center gap-3 px-4 py-3 bg-sa-bg-warm border border-sa-border rounded-sa"
                >
                  <div className="w-2 h-2 rounded-full bg-sa-blue flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-sa-cream">{h.name}</span>
                    <div className="flex gap-1 mt-1">
                      {DAY_LABELS.map((d) => (
                        <span
                          key={d.value}
                          className={`text-[0.55rem] px-1 rounded ${
                            h.days_of_week.includes(d.value)
                              ? 'text-sa-blue bg-sa-blue-soft'
                              : 'text-sa-cream-faint'
                          }`}
                        >
                          {d.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  {h.time && (
                    <span className="text-xs text-sa-cream-faint">{h.time}</span>
                  )}
                  <button
                    onClick={() => handleDeleteHabit(h.id)}
                    className="p-1 text-sa-cream-faint opacity-0 group-hover:opacity-100 hover:text-sa-rose transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {showAddHabit ? (
              <div className="sa-card space-y-3">
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  placeholder="Habit name"
                  autoFocus
                  className="sa-input"
                />
                <div className="flex gap-3 items-center">
                  <input
                    type="time"
                    value={newHabit.time}
                    onChange={(e) => setNewHabit({ ...newHabit, time: e.target.value })}
                    className="sa-input w-28"
                  />
                  <div className="flex gap-1">
                    {DAY_LABELS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => {
                          const days = newHabit.days.includes(d.value)
                            ? newHabit.days.filter((v) => v !== d.value)
                            : [...newHabit.days, d.value];
                          setNewHabit({ ...newHabit, days });
                        }}
                        className={`w-7 h-7 rounded-sa-sm text-[0.65rem] font-medium transition-colors ${
                          newHabit.days.includes(d.value)
                            ? 'bg-sa-blue-soft text-sa-blue'
                            : 'text-sa-cream-faint hover:text-sa-cream'
                        }`}
                      >
                        {d.label[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddHabit(false)} className="sa-btn-ghost text-xs">
                    Cancel
                  </button>
                  <button
                    onClick={handleAddHabit}
                    disabled={!newHabit.name.trim() || !user}
                    className="sa-btn-primary text-xs disabled:opacity-30"
                  >
                    {user ? 'Add Habit' : 'Sign in to add'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddHabit(true)}
                className="flex items-center gap-1.5 text-xs text-sa-cream-faint hover:text-sa-blue transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add keystone habit
              </button>
            )}
          </div>
        )}
      </div>

      </div>
    </div>
  );
}
