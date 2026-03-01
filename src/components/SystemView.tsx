import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Pencil, FileText, Target, Shield, Compass, Brain } from 'lucide-react';
import { NonNegotiable, Habit, Goal, SystemDocument } from '../types';
import { uid } from '../utils/dateUtils';
import { supabase } from '../lib/supabase';

interface SystemViewProps {
  nonNegotiables: NonNegotiable[];
  onUpdateNonNegotiables: React.Dispatch<React.SetStateAction<NonNegotiable[]>>;
  habits: Habit[];
  onHabitsChange: () => void;
  goals: Goal[];
  onGoalsChange: () => void;
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
  onUpdateNonNegotiables,
  habits,
  onHabitsChange,
  goals,
  onGoalsChange,
  user,
}: SystemViewProps) {
  const [activeSection, setActiveSection] = useState<string | null>('documents');
  const [showAddNN, setShowAddNN] = useState(false);
  const [newNNTitle, setNewNNTitle] = useState('');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', time: '09:00', days: [1, 2, 3, 4, 5] as number[] });
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', unit: 'times', deadline: '' });

  // System documents (stored in localStorage for now)
  const [documents, setDocuments] = useState<Record<string, string>>({});
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sa_system_documents');
      if (raw) setDocuments(JSON.parse(raw));
    } catch (e) {
      console.warn('Failed to load system documents:', e);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(documents).length > 0) {
      localStorage.setItem('sa_system_documents', JSON.stringify(documents));
    }
  }, [documents]);

  const handleSaveDoc = (key: string) => {
    setDocuments(prev => ({ ...prev, [key]: editBuffer }));
    setEditingDoc(null);
    setEditBuffer('');
  };

  const handleEditDoc = (key: string) => {
    setEditingDoc(key);
    setEditBuffer(documents[key] || '');
  };

  const toggleSection = (id: string) => {
    setActiveSection(activeSection === id ? null : id);
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
    onUpdateNonNegotiables((prev) => [...prev, nn]);
    setNewNNTitle('');
    setShowAddNN(false);
  };

  const handleDeleteNN = (id: string) => {
    onUpdateNonNegotiables((prev) => prev.filter((n) => n.id !== id));
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

  // === Goal Handlers ===
  const handleAddGoal = async () => {
    if (!newGoal.title.trim() || !user) return;
    try {
      await supabase.from('goals').insert({
        user_id: user.id,
        title: newGoal.title.trim(),
        target_amount: parseInt(newGoal.target) || 0,
        current_amount: 0,
        unit: newGoal.unit,
        target_date: newGoal.deadline || null,
        completed: false,
        goal_type: 'task',
      });
      onGoalsChange();
      setNewGoal({ title: '', target: '', unit: 'times', deadline: '' });
      setShowAddGoal(false);
    } catch (e) {
      console.error('Error adding goal:', e);
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
      {activeSection === id ? (
        <ChevronUp className="w-4 h-4 text-sa-cream-faint" />
      ) : (
        <ChevronDown className="w-4 h-4 text-sa-cream-faint" />
      )}
    </button>
  );

  const docsWithContent = DOC_TYPES.filter(d => documents[d.key]?.trim()).length;

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-10 animate-rise">
        <h1 className="font-serif text-2xl sm:text-3xl text-sa-cream">
          Your System
        </h1>
        <p className="text-sm text-sa-cream-muted mt-2">
          The components of your operating system. Edit and reconfigure as needed.
        </p>
      </div>

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
            {activeSection === 'documents' && (
              <div className="py-4 space-y-3">
                <p className="text-xs text-sa-cream-faint mb-2">
                  Living documents built during Installation. Update them during monthly recalibrations.
                </p>

            {DOC_TYPES.map((doc) => {
              const Icon = doc.icon;
              const content = documents[doc.key];
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
        {activeSection === 'non-negotiables' && (
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
        {activeSection === 'habits' && (
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

      {/* ── Goals ── */}
      <div className="animate-rise delay-4">
        <SectionHeader id="goals" title="Goals" count={goals.filter((g) => !g.completed).length} color="var(--green)" />
        {activeSection === 'goals' && (
          <div className="py-4">
            <p className="text-xs text-sa-cream-faint mb-4">
              Longer-term targets your daily system is building toward.
            </p>
            <div className="space-y-2 mb-4">
              {goals
                .filter((g) => !g.completed)
                .map((g) => {
                  const progress = g.target_amount > 0
                    ? Math.min(100, Math.round((g.current_amount / g.target_amount) * 100))
                    : 0;
                  return (
                    <div key={g.id} className="px-4 py-3 bg-sa-bg-warm border border-sa-border rounded-sa">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-sa-cream">{g.title}</span>
                        <span className="text-xs text-sa-cream-muted">
                          {g.current_amount}/{g.target_amount} {g.unit}
                        </span>
                      </div>
                      <div className="sa-progress-track">
                        <div
                          className="sa-progress-fill-green"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>

            {showAddGoal ? (
              <div className="sa-card space-y-3">
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Goal title"
                  autoFocus
                  className="sa-input"
                />
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    placeholder="Target"
                    className="sa-input w-24"
                  />
                  <select
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="sa-input w-28"
                  >
                    <option value="times">times</option>
                    <option value="days">days</option>
                    <option value="hours">hours</option>
                  </select>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="sa-input flex-1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddGoal(false)} className="sa-btn-ghost text-xs">
                    Cancel
                  </button>
                  <button
                    onClick={handleAddGoal}
                    disabled={!newGoal.title.trim() || !user}
                    className="sa-btn-primary text-xs disabled:opacity-30"
                  >
                    {user ? 'Add Goal' : 'Sign in to add'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddGoal(true)}
                className="flex items-center gap-1.5 text-xs text-sa-cream-faint hover:text-sa-green transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add goal
              </button>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
