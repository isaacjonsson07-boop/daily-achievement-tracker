import React, { useState, useEffect } from 'react';
import { Check, X, ArrowLeft, Lock, ChevronRight, BookOpen } from 'lucide-react';
import { JournalEntry } from '../types';
import { uid } from '../utils/dateUtils';
import { getJournalAccessDays } from '../utils/trialUtils';
import { openWhopPaid, openWhopTrial } from '../constants';
import { LESSON_DATA, getLessonByDay } from '../data/lessonContent';
import { PATCH_DATA, SystemPatchData } from '../data/patchContent';
import { LessonRenderer } from './LessonRenderer';

// ============================================
// STRUCTURED ACHIEVEMENT — Installation View
// Unified: editorial landing + lesson + journal
// ============================================

// Journal templates with specific content for each day
const JOURNAL_TEMPLATES = {
  1: {
    title: "Day 1 — Creating Your North Star (Journal)",
    quote: "When you change the causes you live by, the results have no choice but to change with them.",
    questions: [
      "Over the next 21 days, what does life look like when you are operating at your best?\nDescribe this clearly. Focus on behavior, discipline, focus, and how you move through each day.",
      "What are 3–5 specific outcomes that would prove this vision is real by the end of the challenge?\nThese should be observable results, not intentions.",
      "Which single outcome feels like the strongest cause for everything else to improve?\nIf you could only get one thing right during these 21 days, which would it be — and why?"
    ],
    separateLastQuestion: true
  },
  2: {
    title: "Day 2 — Building Your System of Success (Journal)",
    quote: "When you change the causes you live by, the results have no choice but to change with them.",
    questions: [
      "Choose one clear outcome from your 21-day vision that you will know has been achieved by the end of the sprint.",
      "What daily or recurring actions would make this outcome inevitable if you followed through consistently?",
      "Write one clear identity statement you are choosing to operate from during this challenge.\n\"I am the kind of person who…\""
    ]
  },
  3: {
    title: "Day 3 — Auditing Your Time and Energy (Journal)",
    quote: "What you repeatedly give your time and energy to quietly becomes your future.",
    questions: [
      "Write a brief snapshot of a period you observed today.\nFor each activity, note your energy level: H (High), M (Medium), or L (Low).\n\n(Example: 08:00–09:00 — Emails (L))",
      "Which activities gave you the most energy and which drained it?\nWhat patterns do you notice?",
      "Based on what you observed, what one pattern will you strengthen or reduce — and why?"
    ]
  },
  4: {
    title: "Day 4 — Turning Clarity into Precision (Journal)",
    quote: "What you repeatedly give your time and energy to quietly becomes your future.",
    questions: [
      "What is one goal you want to achieve during this 21-day sprint that directly supports your North Star?\nWrite it clearly in one sentence.",
      "Rewrite this goal so it is Specific and Measurable.\nWhat exactly will you do, and how will you know it's happening?",
      "Make it Time-bound. By when or how often will you act on this goal during the sprint?"
    ]
  },
  5: {
    title: "Day 5 — Your Keystone Goal (Journal)",
    quote: "When your focus is concentrated, progress accelerates — not because you do more, but because every action matters.",
    questions: [
      "Which single goal would create the greatest positive ripple effect if achieved during these 21 days?\nWrite it clearly.",
      "Rewrite your keystone goal as a clear SMART-ER statement.\nBe precise about what you will do, how often, and for how long.",
      "What distractions or secondary goals could pull focus away?\nWhich ones will you consciously deprioritize for the rest of the sprint?"
    ]
  },
  6: {
    title: "Day 6 — Breaking Goals into Action (Journal)",
    quote: "When action becomes consistent, success stops being a question of chance.",
    questions: [
      "What is the single core action that most directly moves your keystone goal forward?\nThis should be something you can realistically do every day.",
      "Define what \"done\" looks like for this action.\nHow much, how long, or how often must you act for it to count?",
      "What daily trigger will you attach this action to?\nComplete: \"After I ________, I will ________.\""
    ]
  },
  7: {
    title: "Day 7 — Weekly Review & Reset (Journal)",
    quote: "Progress accelerates when you stop repeating the same causes and start consciously choosing better ones.",
    questions: [
      "Where did you stay most consistent this week?\nWhich habits, actions, or systems worked better than expected?",
      "Where did you lose focus or struggle? Be specific about moments and causes — not judgments.",
      "What one adjustment will you make to your system or routine to improve Week 2?\nKeep it small, clear, and realistic."
    ],
    separateLastQuestion: true
  },
  8: {
    title: "Day 8 — Understanding Habit Loops (Journal)",
    quote: "You don't change behavior by force — you change it by understanding the loop that runs it.",
    questions: [
      "Identify one habit you want to understand or change.\nThis can be something you want to reduce or replace.",
      "Map the loop: What is the cue that triggers it? What routine follows? What emotional reward does it give you?\n(Write each clearly: Cue → Routine → Reward)",
      "What surprised you most about this habit once you broke it into its parts?"
    ]
  },
  9: {
    title: "Day 9 — Replacing a Habit That Holds You Back (Journal)",
    quote: "You don't break habits — you replace them with responses that serve you better.",
    questions: [
      "Which habit will you replace? What is the cue that triggers it?",
      "What new routine will you use instead?\nIt should be simple, immediate, and deliver a similar emotional reward.",
      "Complete this sentence: \"When [cue] appears, I will [new routine] instead of [old routine].\""
    ]
  },
  10: {
    title: "Day 10 — Design a Life That Pulls You Forward (Journal)",
    quote: "You don't need more discipline — you need an environment that makes the right choice feel natural.",
    questions: [
      "Look at your current environment. What does it quietly encourage you to do most often?",
      "Name one physical or digital change you can make today that would make your desired behavior easier or more obvious.",
      "If your environment consistently reflected the person you're becoming, what would look different day to day?"
    ]
  },
  11: {
    title: "Day 11 — Make Success Easier Than Failure (Journal)",
    quote: "When the right action is easier than the wrong one, discipline becomes automatic.",
    questions: [
      "What action do you want to perform consistently? What friction currently makes it harder than it needs to be?",
      "What one change will you make to reduce friction and make this action easier to begin?",
      "What unwanted behavior will you add friction to? What will you do to make it less convenient?"
    ]
  },
  12: {
    title: "Day 12 — Identity Is the Root of All Achievement (Journal)",
    quote: "You don't rise to who you want to be — you act in alignment with who you believe you already are becoming.",
    questions: [
      "What concrete evidence from the last 12 days proves you are already changing?\nList behaviors or decisions you wouldn't have made before.",
      "Which belief about yourself has limited you? Rewrite it:\n\"I am becoming someone who…\"",
      "When you face resistance, complete this:\n\"What would the person I'm becoming do right now?\""
    ]
  },
  13: {
    title: "Day 13 — Momentum, Streaks & the Psychology of Winning (Journal)",
    quote: "Momentum grows when your mind starts expecting you to follow through — and you prove it right.",
    questions: [
      "What wins have you accumulated during this challenge so far?\nList the actions you've followed through on.",
      "Which streak are you building? How does it change the way you see yourself?",
      "What do you expect from yourself over the next 7 days? Be specific."
    ]
  },
  14: {
    title: "Day 14 — Your Habits Become Your Future (Journal)",
    quote: "What you repeat daily doesn't just change your results — it quietly changes who you become.",
    questions: [
      "Which small actions have you repeated most consistently over the last 14 days?",
      "What changes have you noticed as a result — in focus, confidence, discipline, or self-trust?",
      "What single habit or action will you deliberately continue compounding for the next 7 days?"
    ],
    separateLastQuestion: true
  },
  15: {
    title: "Day 15 — Turning Structure Into Execution (Journal)",
    quote: "Clarity grows through action — not waiting.",
    questions: [
      "What is the single most important action you need to execute consistently this final week?",
      "What usually creates resistance when it's time to start?\nWhat is the smallest possible starting point that makes beginning effortless?",
      "How does completing this action reinforce the identity you are building?"
    ]
  },
  16: {
    title: "Day 16 — Deep Work and Undivided Attention (Journal)",
    quote: "When your attention is undivided, progress accelerates with less effort.",
    questions: [
      "What task deserves your full attention today? What does \"done\" look like?",
      "When will you schedule a 25–30 minute deep work block? Choose your highest-energy window.",
      "What distractions will you eliminate before starting? Describe how you'll prepare the environment."
    ]
  },
  17: {
    title: "Day 17 — Build a Sustainable Structure (Journal)",
    quote: "You don't rely on motivation when your system tells you exactly what to do next.",
    questions: [
      "What is your Full Version — your ideal daily sequence when time and energy are available?",
      "What is your Short Version — how you adapt on busy or lower-energy days?",
      "What is your Minimum Version — the smallest action that keeps momentum alive, almost impossible to fail?"
    ]
  },
  18: {
    title: "Day 18 — Remove Hidden Obstacles (Journal)",
    quote: "Progress accelerates when the system becomes lighter, not harder.",
    questions: [
      "Which part of your current system creates the most hesitation or resistance? Why?",
      "Is this a bottleneck, a redundant action, or a conflicting pattern?",
      "What is one way you can reduce, simplify, or remove it entirely?"
    ]
  },
  19: {
    title: "Day 19 — Strengthen What Works (Journal)",
    quote: "What you consistently notice, appreciate, and connect to meaning is what stays.",
    questions: [
      "Which behavior from today do you most want to continue long-term?",
      "What positive feeling did it create, and how does it connect to who you're becoming?",
      "How can you make this reinforcement loop repeatable? What cue will remind you to notice and reflect?"
    ]
  },
  20: {
    title: "Day 20 — Integrating Your System (Journal)",
    quote: "When your habits, identity, and system work together, progress stops feeling forced.",
    questions: [
      "Define your three pillars:\n• Keystone action — the one behavior your routine is built around\n• Execution window — the focused block where meaningful work happens\n• Reflection moment — when you review and adjust",
      "How do these three parts support each other when they work together?",
      "Which part feels strongest right now and which needs the most attention?"
    ]
  },
  21: {
    title: "Day 21 — Build Your Personal Operating System (Journal)",
    quote: "Completion is not the end — it's the moment responsibility becomes yours.",
    questions: [
      "Looking back on these 21 days, what changes feel most real and stable?\nFocus on behaviors and structure — not feelings.",
      "Define your Daily Flow — the non-negotiable elements you will follow most days.\n(Keystone action, focused work, habits, reflection.)",
      "Define your Identity Direction. Complete clearly:\n\"I am the kind of person who…\""
    ],
    separateLastQuestion: true
  }
};

const PHASES = [
  { label: 'Phase I — Stabilize', shortLabel: 'Stabilize', days: [1, 2, 3, 4, 5, 6, 7], description: 'Build the foundation. Direction, structure, discipline, and tracking — the bedrock everything else depends on.' },
  { label: 'Phase II — Reconstruct', shortLabel: 'Reconstruct', days: [8, 9, 10, 11, 12, 13, 14], description: 'Go deeper. Identity, priorities, habits, energy, and decision-making — the strategy that makes the structure permanent.' },
  { label: 'Phase III — Install', shortLabel: 'Install', days: [15, 16, 17, 18, 19, 20, 21], description: 'Make it permanent. Accountability, resilience, self-mastery, and the review cycles that keep the system running for life.' },
];

interface JournalingViewProps {
  journalEntries: JournalEntry[];
  onUpdateJournalEntry: (entry: JournalEntry) => void;
  user?: { id?: string } | null;
  plan?: 'free' | 'paid';
  trialEndsAt?: string | null;
  onStartTrial?: () => Promise<void>;
  readPatches: string[];
  onUpdateReadPatches: (patches: string[]) => void;
  installationCompleteDate: string | null;
  onUpdateInstallationDate: (date: string) => void;
}

export function JournalingView({
  journalEntries,
  onUpdateJournalEntry,
  user,
  plan = 'free',
  trialEndsAt = null,
  onStartTrial,
  readPatches,
  onUpdateReadPatches,
  installationCompleteDate,
  onUpdateInstallationDate,
}: JournalingViewProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedPatch, setSelectedPatch] = useState<SystemPatchData | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<'lesson' | 'journal'>('lesson');

  const journalAccessDays = getJournalAccessDays(plan, trialEndsAt);

  // Initialize journal entries for days 1-21
  const initializeJournalEntries = () => {
    const existingDays = new Set(journalEntries.map(entry => entry.dayNumber));
    const newEntries: JournalEntry[] = [];
    for (let day = 1; day <= 21; day++) {
      if (!existingDays.has(day)) {
        const template = JOURNAL_TEMPLATES[day as keyof typeof JOURNAL_TEMPLATES];
        newEntries.push({
          id: uid(),
          dayNumber: day,
          title: template ? template.title : `Day ${day} Journal`,
          content: '',
          entry_date: new Date().toISOString().split('T')[0],
          entry_type: 'installation',
          answers: {},
          lastModified: new Date().toISOString(),
          userId: user?.id
        });
      }
    }
    newEntries.forEach(entry => onUpdateJournalEntry(entry));
  };

  useEffect(() => { initializeJournalEntries(); }, [user]);

  // Auto-save journal answers
  useEffect(() => {
    if (selectedDay && Object.keys(answers).length > 0) {
      const existingEntry = journalEntries.find(entry => entry.dayNumber === selectedDay);
      if (existingEntry) {
        const hasChanges = Object.keys(answers).some(key =>
          (existingEntry.answers?.[key] || '') !== answers[key]
        );
        if (hasChanges) {
          const updatedEntry: JournalEntry = {
            ...existingEntry,
            answers: { ...answers },
            lastModified: new Date().toISOString()
          };
          onUpdateJournalEntry(updatedEntry);
        }
      }
    }
  }, [answers, selectedDay]);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers(prev => ({ ...prev, [`question_${questionIndex}`]: value }));
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const handleDayClick = (dayNumber: number) => {
    if (dayNumber > journalAccessDays) {
      setShowUpgradePrompt(true);
      return;
    }
    const entry = journalEntries.find(e => e.dayNumber === dayNumber);
    if (entry) {
      setSelectedDay(dayNumber);
      setAnswers(entry.answers || {});
      setActiveTab('lesson');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClose = () => {
    setSelectedDay(null);
    setAnswers({});
    setActiveTab('lesson');
  };

  const handleNextDay = () => {
    if (selectedDay && selectedDay < 21) {
      const nextDay = selectedDay + 1;
      if (nextDay > journalAccessDays) {
        setShowUpgradePrompt(true);
        return;
      }
      const entry = journalEntries.find(e => e.dayNumber === nextDay);
      if (entry) {
        setSelectedDay(nextDay);
        setAnswers(entry.answers || {});
        setActiveTab('lesson');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const hasContent = (entry: JournalEntry) => {
    return (entry.content && entry.content.trim() !== '') ||
      (entry.answers && Object.values(entry.answers).some(a => a && a.trim() !== ''));
  };

  const completedDays = journalEntries.filter(e => e.dayNumber && hasContent(e)).length;
  const progressPercent = Math.round((completedDays / 21) * 100);

  // Patch unlock logic — one per week, starting 1 week after Day 21 completion
  const getPatchUnlockInfo = (patchWeek: number): { unlocked: boolean; unlockDate: string } => {
    if (completedDays < 21) {
      return { unlocked: false, unlockDate: 'After Day 21' };
    }
    let completionDate = installationCompleteDate;
    if (!completionDate) {
      completionDate = new Date().toISOString().split('T')[0];
      onUpdateInstallationDate(completionDate);
    }
    const start = new Date(completionDate + 'T00:00:00');
    const unlock = new Date(start);
    unlock.setDate(unlock.getDate() + patchWeek * 7);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return {
      unlocked: now >= unlock,
      unlockDate: unlock.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  };

  // ── PATCH DETAIL VIEW ──
  if (selectedPatch) {
    const accentColor = 'var(--cream-muted, #A69F93)';

    return (
      <div className="max-w-3xl mx-auto animate-rise">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 sticky top-14 md:top-0 z-10 py-3 -mx-6 px-6 bg-sa-bg/95 backdrop-blur-sm border-b border-sa-border/50">
          <button onClick={() => setSelectedPatch(null)} className="sa-btn-ghost flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <span className="text-xs text-sa-cream-faint font-medium px-2.5 py-1 rounded-full bg-sa-bg-lift border border-sa-border-light">
            Patch {String(selectedPatch.week).padStart(3, '0')}
          </span>
        </div>

        {/* Patch content */}
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-sa-cream-faint mb-3">System Patch {String(selectedPatch.week).padStart(3, '0')}</p>
            <h1 className="font-serif text-2xl sm:text-3xl text-sa-cream mb-4">{selectedPatch.title}</h1>
            <p className="text-sm text-sa-cream-muted italic leading-relaxed max-w-md mx-auto">{selectedPatch.subtitle}</p>
          </div>

          {/* Sections */}
          {selectedPatch.sections.map((section, i) => (
            <div key={i}>
              <h2 className="font-serif text-lg text-sa-cream mb-4" style={{ borderLeft: `2px solid ${accentColor}`, paddingLeft: '16px' }}>
                {section.heading}
              </h2>
              <div className="space-y-4 pl-0">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-sm text-sa-cream-soft leading-relaxed" dangerouslySetInnerHTML={{ __html: p }} />
                ))}
              </div>
            </div>
          ))}

          {/* Configuration task */}
          <div className="mt-10 p-6 rounded-sa-lg" style={{ backgroundColor: 'rgba(197, 165, 90, 0.04)', border: '1px solid rgba(197, 165, 90, 0.12)' }}>
            <p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-gold mb-2">Configuration Task</p>
            <h3 className="font-serif text-base text-sa-cream mb-3">{selectedPatch.configTask.title}</h3>
            <p className="text-sm text-sa-cream-muted leading-relaxed">{selectedPatch.configTask.description}</p>
          </div>

          {/* Done button */}
          {readPatches.includes(selectedPatch.id) ? (
            <div className="mt-8 py-4 text-center">
              <div className="inline-flex items-center gap-2 text-sa-green text-sm">
                <Check className="w-4 h-4" />
                <span>Patch completed</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                const updated = [...readPatches, selectedPatch.id];
                onUpdateReadPatches(updated);
              }}
              className="sa-btn-primary w-full mt-8"
            >
              Mark as Done
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── DAY DETAIL VIEW ──
  if (selectedDay) {
    const selectedEntry = journalEntries.find(e => e.dayNumber === selectedDay);
    const template = JOURNAL_TEMPLATES[selectedDay as keyof typeof JOURNAL_TEMPLATES];
    const lesson = getLessonByDay(selectedDay);
    if (!selectedEntry) return null;

    return (
      <div className="max-w-3xl mx-auto animate-rise">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 sticky top-14 md:top-0 z-10 py-3 -mx-6 px-6 bg-sa-bg/95 backdrop-blur-sm border-b border-sa-border/50">
          <button onClick={handleClose} className="sa-btn-ghost flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Lesson / Journal toggle */}
          <div className="flex items-center bg-sa-bg-warm rounded-sa-sm border border-sa-border p-0.5">
            <button
              onClick={() => setActiveTab('lesson')}
              className={`px-3 py-1.5 text-xs rounded-sa-sm transition-all ${
                activeTab === 'lesson'
                  ? 'bg-sa-gold-glow text-sa-gold border border-sa-gold-border'
                  : 'text-sa-cream-faint hover:text-sa-cream-muted border border-transparent'
              }`}
            >
              Lesson
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`px-3 py-1.5 text-xs rounded-sa-sm transition-all ${
                activeTab === 'journal'
                  ? 'bg-sa-gold-glow text-sa-gold border border-sa-gold-border'
                  : 'text-sa-cream-faint hover:text-sa-cream-muted border border-transparent'
              }`}
            >
              Journal
            </button>
          </div>

          <span className="text-xs text-sa-gold font-medium px-2.5 py-1 rounded-full bg-sa-gold-soft border border-sa-gold-border">
            Day {selectedDay}/21
          </span>
        </div>

        {/* === LESSON TAB === */}
        {activeTab === 'lesson' && lesson && (
          <>
            <LessonRenderer lesson={lesson} />

            {/* Continue to journal CTA */}
            <div className="mt-10 mb-6 p-5 rounded-sa border border-sa-gold-border bg-sa-gold-soft text-center">
              <p className="text-sm text-sa-cream-soft mb-3">
                Finished reading? Reflect on what you learned.
              </p>
              <button
                onClick={() => { setActiveTab('journal'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="sa-btn-primary inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Open Journal
              </button>
            </div>

            {/* Next day link */}
            {selectedDay < 21 && (
              <button
                onClick={handleNextDay}
                className="w-full mt-4 mb-6 p-4 rounded-sa border border-sa-border bg-sa-bg-warm flex items-center justify-between hover:border-sa-gold-border transition-colors"
              >
                <div>
                  <div className="text-xs text-sa-cream-faint">
                    {lesson.nextDay?.eyebrow || `Tomorrow — Day ${selectedDay + 1}`}
                  </div>
                  <div className="text-sm text-sa-cream mt-0.5">
                    {lesson.nextDay?.title || LESSON_DATA[selectedDay]?.title || ''}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-sa-cream-faint" />
              </button>
            )}
          </>
        )}

        {/* === JOURNAL TAB === */}
        {activeTab === 'journal' && (
          <>
            <div className="mb-8">
              <h2 className="font-serif text-xl sm:text-2xl text-sa-cream">
                {selectedEntry.title}
              </h2>
              {template?.quote && (
                <p className="text-sm text-sa-cream-faint italic mt-3">
                  &ldquo;{template.quote}&rdquo;
                </p>
              )}
            </div>

            {template && template.questions ? (
              <div className="space-y-8">
                {template.questions.map((question: string, index: number) => (
                  <div
                    key={index}
                    className={`${
                      index === template.questions.length - 1 && template.separateLastQuestion
                        ? 'pt-8 mt-4 border-t border-sa-border'
                        : ''
                    }`}
                  >
                    <label className="block text-sm text-sa-cream-soft mb-3 leading-relaxed whitespace-pre-line">
                      <span className="text-sa-gold font-medium">{index + 1}.</span>{' '}
                      {question}
                    </label>
                    <textarea
                      value={answers[`question_${index}`] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      onInput={handleTextareaInput}
                      placeholder="Write your answer here..."
                      className="sa-textarea min-h-[5rem]"
                      autoFocus={index === 0}
                      ref={(el) => {
                        if (el && answers[`question_${index}`]) {
                          el.style.height = 'auto';
                          el.style.height = el.scrollHeight + 'px';
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <label className="sa-label">Journal Entry</label>
                <textarea
                  value={selectedEntry.content}
                  onChange={(e) => {
                    const updatedEntry: JournalEntry = {
                      ...selectedEntry,
                      content: e.target.value,
                      lastModified: new Date().toISOString()
                    };
                    onUpdateJournalEntry(updatedEntry);
                  }}
                  onInput={handleTextareaInput}
                  placeholder="Start writing..."
                  className="sa-textarea min-h-[16rem]"
                  autoFocus
                  ref={(el) => {
                    if (el && selectedEntry.content) {
                      el.style.height = 'auto';
                      el.style.height = el.scrollHeight + 'px';
                    }
                  }}
                />
              </div>
            )}

            <div className="flex gap-3 mt-10">
              <button onClick={() => { setActiveTab('lesson'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="sa-btn-ghost flex items-center gap-2 flex-1">
                <ArrowLeft className="w-4 h-4" />
                Back to Lesson
              </button>
              {selectedDay < 21 && (
                <button onClick={handleNextDay} className="sa-btn-primary flex items-center gap-2 flex-1">
                  Day {selectedDay + 1}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-xs text-sa-cream-faint text-center mt-6 mb-4">
              Changes save automatically
            </p>
          </>
        )}
      </div>
    );
  }

  // ── EDITORIAL LANDING / GRID VIEW ──
  return (
    <div className="max-w-3xl mx-auto overflow-x-hidden">
      {/* Custom styles for hover effects */}
      <style>{`
        .sa-lesson-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px 28px;
          background: var(--bg-warm, #24252A);
          border: 1px solid rgba(240,237,230,0.05);
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
          width: 100%;
          text-align: left;
        }
        .sa-lesson-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          border-radius: 3px 0 0 3px;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .sa-lesson-card.sa-gold-accent::before { background: var(--gold, #C5A55A); }
        .sa-lesson-card.sa-blue-accent::before { background: var(--blue, #6DB5F5); }
        .sa-lesson-card.sa-green-accent::before { background: var(--green, #6ECB8B); }
        .sa-lesson-card:hover:not(.sa-locked) {
          border-color: rgba(240,237,230,0.12);
          background: var(--bg-lift, #2A2B31);
          transform: translateX(4px);
        }
        .sa-lesson-card:hover:not(.sa-locked)::before { opacity: 1; }
        .sa-lesson-card .sa-card-arrow {
          opacity: 0;
          transition: all 0.2s ease;
          transform: translateX(-3px);
          flex-shrink: 0;
        }
        .sa-lesson-card:hover:not(.sa-locked) .sa-card-arrow {
          opacity: 1;
          transform: translateX(3px);
        }
        .sa-lesson-card.sa-gold-accent:hover .sa-card-arrow { color: var(--gold, #C5A55A); }
        .sa-lesson-card.sa-blue-accent:hover .sa-card-arrow { color: var(--blue, #6DB5F5); }
        .sa-lesson-card.sa-green-accent:hover .sa-card-arrow { color: var(--green, #6ECB8B); }
        .sa-lesson-card:hover:not(.sa-locked) .sa-card-principle { color: var(--cream-muted, #A69F93); }
        .sa-lesson-card.sa-review-day {
          background: rgba(240,237,230,0.02);
          border-style: dashed;
        }
        .sa-lesson-card.sa-locked {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .sa-lesson-card.sa-completed {
          border-style: solid;
        }
        .sa-lesson-card.sa-completed.sa-gold-accent { border-color: rgba(197,165,90,0.25); background: rgba(197,165,90,0.06); }
        .sa-lesson-card.sa-completed.sa-blue-accent { border-color: rgba(109,181,245,0.25); background: rgba(109,181,245,0.06); }
        .sa-lesson-card.sa-completed.sa-green-accent { border-color: rgba(110,203,139,0.25); background: rgba(110,203,139,0.06); }
        .sa-lesson-card.sa-completed::before { opacity: 1; }
        .sa-brand-line::before, .sa-brand-line::after {
          content: '';
          width: 40px;
          height: 1px;
          background: rgba(197,165,90,0.25);
        }
        .sa-diamond-divider::before, .sa-diamond-divider::after {
          content: '';
          width: 60px;
          height: 1px;
          background: rgba(240,237,230,0.07);
        }
        @keyframes saCardIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sa-lesson-card { animation: saCardIn 0.5s cubic-bezier(0.23, 1, 0.32, 1) both; }
        .sa-lesson-card:nth-child(1) { animation-delay: 0.0s; }
        .sa-lesson-card:nth-child(2) { animation-delay: 0.03s; }
        .sa-lesson-card:nth-child(3) { animation-delay: 0.06s; }
        .sa-lesson-card:nth-child(4) { animation-delay: 0.09s; }
        .sa-lesson-card:nth-child(5) { animation-delay: 0.12s; }
        .sa-lesson-card:nth-child(6) { animation-delay: 0.15s; }
        .sa-lesson-card:nth-child(7) { animation-delay: 0.18s; }
      `}</style>

      {/* Upgrade modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="sa-card-elevated max-w-md w-full">
            <button onClick={() => setShowUpgradePrompt(false)} className="float-right sa-btn-ghost p-1">
              <X className="w-4 h-4" />
            </button>
            <div className="text-center pt-2">
              <Lock className="w-8 h-8 text-sa-gold mx-auto mb-3" />
              <h3 className="font-serif text-lg text-sa-cream mb-2">Unlock Full Installation</h3>
              <p className="text-sm text-sa-cream-muted mb-6">
                Upgrade to access Days 8–21 and complete the full system installation.
              </p>
              <div className="flex flex-col gap-3">
                {onStartTrial && (
                  <button onClick={openWhopTrial} className="sa-btn-secondary w-full">
                    Start Free Access (Days 1–7)
                  </button>
                )}
                <button onClick={openWhopPaid} className="sa-btn-primary w-full">
                  Upgrade to Full Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Free user locked state */}
      {plan === 'free' && journalAccessDays === 0 && (
        <div className="text-center py-16 animate-rise">
          <Lock className="w-10 h-10 text-sa-gold mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-sa-cream mb-3">21-Day Installation</h2>
          <p className="text-sm text-sa-cream-muted max-w-md mx-auto mb-8">
            A structured 21-day corridor that installs your personal operating system.
            Three phases. One component per day. System installed by Day 21.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onStartTrial && (
              <button onClick={openWhopTrial} className="sa-btn-secondary">
                Start Free Access
              </button>
            )}
            <button onClick={openWhopPaid} className="sa-btn-primary">
              Upgrade to Full Access
            </button>
          </div>
        </div>
      )}

      {/* Installation content */}
      {journalAccessDays > 0 && (
        <>
          {/* Hero branding */}
          <div className="text-center pt-6 pb-4">
            <div className="sa-brand-line flex items-center justify-center gap-4 mb-10"
              style={{ fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: 'var(--gold, #C5A55A)' }}>
              Structured Achievement
            </div>

            <h2 className="font-serif text-sa-cream mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, lineHeight: 1.12, letterSpacing: '-0.01em' }}>
              Build your personal<br /><em className="text-sa-gold italic">operating system</em>
            </h2>

            <p className="text-sa-cream-soft mx-auto mb-10" style={{ fontSize: '1.1rem', fontWeight: 300, lineHeight: 1.75, maxWidth: 580 }}>
              21 days. Three phases. One system designed to replace chaos with structure, intention with identity, and effort with compounding results.
            </p>

            {/* Stats bar */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 sm:gap-12 py-8 mb-0" style={{ borderTop: '1px solid rgba(240,237,230,0.07)', borderBottom: '1px solid rgba(240,237,230,0.07)' }}>
              <div className="text-center min-w-[60px]">
                <div className="font-serif text-sa-cream" style={{ fontSize: '2.2rem', lineHeight: 1 }}>{completedDays > 0 ? completedDays : 21}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--cream-muted, #A69F93)', marginTop: 8 }}>
                  {completedDays > 0 ? 'Done' : 'Lessons'}
                </div>
              </div>
              <div className="text-center min-w-[60px]">
                <div className="font-serif text-sa-cream" style={{ fontSize: '2.2rem', lineHeight: 1 }}>3</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--cream-muted, #A69F93)', marginTop: 8 }}>Phases</div>
              </div>
              <div className="text-center min-w-[60px]">
                <div className="font-serif text-sa-cream" style={{ fontSize: '2.2rem', lineHeight: 1 }}>12</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--cream-muted, #A69F93)', marginTop: 8 }}>Principles</div>
              </div>
              <div className="text-center min-w-[60px]">
                <div className="font-serif text-sa-cream" style={{ fontSize: '2.2rem', lineHeight: 1 }}>∞</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--cream-muted, #A69F93)', marginTop: 8 }}>Compound</div>
              </div>
            </div>
          </div>

          {/* Phase sections */}
          {PHASES.map((phase, phaseIndex) => {
            const phaseColor = phaseIndex === 0 ? 'gold' : phaseIndex === 1 ? 'blue' : 'green';
            const colorVar = phaseColor === 'gold' ? 'var(--gold, #C5A55A)' : phaseColor === 'blue' ? 'var(--blue, #6DB5F5)' : 'var(--green, #6ECB8B)';

            return (
              <section key={phase.label} style={{ paddingTop: 72 }}>
                {/* Phase header */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: colorVar }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: colorVar }}>
                    {phase.label}
                  </span>
                </div>
                <p className="mb-7" style={{ fontSize: '1.05rem', fontWeight: 300, color: 'var(--cream-muted, #A69F93)', lineHeight: 1.7, paddingLeft: 28 }}>
                  {phase.description}
                </p>

                {/* Lesson cards */}
                <div className="flex flex-col gap-2">
                  {phase.days.map((dayNumber) => {
                    const entry = journalEntries.find(e => e.dayNumber === dayNumber);
                    const completed = entry && hasContent(entry);
                    const isLocked = dayNumber > journalAccessDays;
                    const lessonData = getLessonByDay(dayNumber);
                    const title = lessonData?.title || `Day ${dayNumber}`;
                    const principle = lessonData?.principleLabel || '';
                    const isReview = dayNumber === 7 || dayNumber === 14 || dayNumber === 21;

                    return (
                      <button
                        key={dayNumber}
                        onClick={() => handleDayClick(dayNumber)}
                        disabled={isLocked}
                        className={`sa-lesson-card sa-${phaseColor}-accent${isReview ? ' sa-review-day' : ''}${isLocked ? ' sa-locked' : ''}${completed ? ' sa-completed' : ''}`}
                      >
                        {/* Day number — phase colored */}
                        <span className="font-serif flex-shrink-0" style={{ fontSize: '1.05rem', width: 28, textAlign: 'right' as const, color: isLocked ? 'var(--cream-faint, #6B665D)' : colorVar }}>
                          {completed ? (
                            <Check className="w-5 h-5 inline" strokeWidth={2.5} style={{ color: colorVar }} />
                          ) : (
                            dayNumber
                          )}
                        </span>

                        {/* Divider */}
                        <div className="flex-shrink-0" style={{ width: 1, height: 28, background: 'rgba(240,237,230,0.08)' }} />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 400, color: 'var(--cream, #F2EDE4)', lineHeight: 1.35 }}>
                            {title}
                          </div>
                          <div className="sa-card-principle truncate" style={{ fontSize: '0.85rem', fontWeight: 300, color: 'var(--cream-faint, #6B665D)', marginTop: 4 }}>
                            {principle}
                          </div>
                        </div>

                        {/* Arrow or lock */}
                        {isLocked ? (
                          <Lock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cream-faint, #6B665D)' }} />
                        ) : (
                          <span className="sa-card-arrow" style={{ fontSize: '1.15rem', color: 'var(--cream-faint, #6B665D)' }}>→</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Bottom section */}
          <div className="text-center" style={{ paddingTop: 80, paddingBottom: 40 }}>
            {/* Diamond divider */}
            <div className="sa-diamond-divider flex items-center justify-center gap-5 mb-12">
              <div style={{ width: 7, height: 7, border: '1px solid var(--cream-faint, #6B665D)', transform: 'rotate(45deg)' }} />
            </div>

            <p className="font-serif italic mx-auto mb-4" style={{ fontSize: '1.4rem', fontWeight: 400, color: 'var(--cream-soft, #D8D2C7)', lineHeight: 1.6, maxWidth: 540 }}>
              Every result has a cause. The system you build here becomes the cause of <strong className="not-italic font-medium text-sa-cream">everything that follows</strong>.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--cream-faint, #6B665D)', letterSpacing: '0.04em' }}>
              — The Law of Cause and Effect
            </p>

            {/* Phase dots footer */}
            <div className="flex justify-center gap-7" style={{ marginTop: 56, paddingTop: 28, borderTop: '1px solid rgba(240,237,230,0.05)' }}>
              <span className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--cream-faint, #6B665D)' }}>
                <span className="rounded-full" style={{ width: 6, height: 6, background: 'var(--gold, #C5A55A)', display: 'inline-block' }} />
                Stabilize
              </span>
              <span className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--cream-faint, #6B665D)' }}>
                <span className="rounded-full" style={{ width: 6, height: 6, background: 'var(--blue, #6DB5F5)', display: 'inline-block' }} />
                Reconstruct
              </span>
              <span className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--cream-faint, #6B665D)' }}>
                <span className="rounded-full" style={{ width: 6, height: 6, background: 'var(--green, #6ECB8B)', display: 'inline-block' }} />
                Install
              </span>
            </div>
          </div>

          {/* Completion state */}
          {completedDays === 21 && (
            <div className="mt-4 py-6 px-8 bg-sa-green-soft border border-sa-green-border rounded-sa text-center">
              <p className="text-sa-green font-serif text-lg">System installed.</p>
              <p className="text-sa-cream-muted text-sm mt-1">All 21 days completed. Operational mode is active.</p>
            </div>
          )}

          {/* ── SYSTEM PATCHES SECTION ── */}
          {PATCH_DATA.length > 0 && (
            <section style={{ paddingTop: 72 }}>
              {/* Section header */}
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-faint, #6B665D)', marginBottom: 8 }}>
                  Post-Installation
                </p>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.7rem', color: 'var(--cream, #F2EDE4)', fontWeight: 400, marginBottom: 8, lineHeight: 1.2 }}>
                  System Patches
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--cream-muted, #A69F93)', lineHeight: 1.6, maxWidth: '540px' }}>
                  Weekly operational refinements. One concept, one application, one configuration task. Designed to keep your system sharp after installation.
                </p>
              </div>

              {/* Before Day 21 — locked message */}
              {completedDays < 21 && (
                <div className="py-8 px-6 rounded-sa text-center" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Lock className="w-5 h-5 mx-auto mb-3" style={{ color: 'var(--cream-faint, #6B665D)' }} />
                  <p className="text-sm text-sa-cream-muted">Complete all 21 days to unlock System Patches.</p>
                  <p className="text-xs text-sa-cream-faint mt-1">{completedDays}/21 days completed</p>
                </div>
              )}

              {/* After Day 21 — patch cards */}
              {completedDays >= 21 && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {PATCH_DATA.map((patch) => {
                      const isRead = readPatches.includes(patch.id);
                      const { unlocked, unlockDate } = getPatchUnlockInfo(patch.week);

                      return (
                        <button
                          key={patch.id}
                          onClick={() => {
                            if (unlocked) setSelectedPatch(patch);
                          }}
                          className="sa-lesson-card"
                          style={{
                            borderColor: isRead ? 'rgba(110, 203, 139, 0.15)' : 'rgba(240,237,230,0.05)',
                            opacity: unlocked ? 1 : 0.5,
                            cursor: unlocked ? 'pointer' : 'default',
                          }}
                        >
                          {/* Patch number / status */}
                          <div style={{
                            width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--serif)', fontSize: '1.1rem', fontWeight: 400,
                            color: !unlocked ? 'var(--cream-faint, #6B665D)' : isRead ? 'var(--green, #6ECB8B)' : 'var(--cream-muted, #A69F93)',
                            border: `1px solid ${!unlocked ? 'rgba(240,237,230,0.05)' : isRead ? 'rgba(110, 203, 139, 0.25)' : 'rgba(240,237,230,0.08)'}`,
                            background: !unlocked ? 'rgba(240,237,230,0.01)' : isRead ? 'rgba(110, 203, 139, 0.06)' : 'rgba(240,237,230,0.02)',
                          }}>
                            {!unlocked ? <Lock className="w-3.5 h-3.5" /> : isRead ? <Check className="w-4 h-4" /> : String(patch.week).padStart(3, '0')}
                          </div>

                          {/* Title + subtitle / unlock date */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontFamily: 'var(--serif)', fontSize: '1.05rem', fontWeight: 400,
                              color: unlocked ? 'var(--cream, #F2EDE4)' : 'var(--cream-faint, #6B665D)', lineHeight: 1.3, marginBottom: 2,
                            }}>
                              {patch.title}
                            </p>
                            <p style={{
                              fontSize: '0.8rem', color: 'var(--cream-faint, #6B665D)',
                              lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {unlocked ? patch.subtitle : `Unlocks ${unlockDate}`}
                            </p>
                          </div>

                          {/* Arrow or lock */}
                          {unlocked ? (
                            <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cream-faint, #6B665D)', opacity: 0.5 }} />
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--cream-faint, #6B665D)', whiteSpace: 'nowrap' }}>
                              Week {patch.week}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* More coming message */}
                  <div className="mt-6 py-4 text-center">
                    <p className="text-xs text-sa-cream-faint italic">New patches are released weekly. More coming soon.</p>
                  </div>
                </>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
