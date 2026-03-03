import React, { useState, useEffect } from 'react';
import { Check, X, ArrowLeft, Lock, ChevronRight, BookOpen } from 'lucide-react';
import { JournalEntry } from '../types';
import { uid } from '../utils/dateUtils';
import { getJournalAccessDays } from '../utils/trialUtils';
import { openWhopPaid, openWhopTrial } from '../constants';
import { LESSON_DATA, getLessonByDay } from '../data/lessonContent';
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
      "Over the next 21 days, what does life look like when you are operating at your best?\nDescribe this clearly and vividly. Focus on your behavior, discipline, focus, and how you move through each day.",
      "What are 3–5 specific outcomes that would prove this vision is real by the end of the challenge?\nThese should be observable results, not intentions.",
      "Why does each of these outcomes matter to you?\nFor each outcome, explain what achieving it gives you — or what not achieving it costs you.",
      "Imagine yourself at the end of Day 21, looking back on this sprint.\nWhat are you most proud of?\nWhat do you wish you had focused on sooner?",
      "Which single outcome feels like the strongest \"cause\" for everything else to improve?\nIf you could only get one thing right during these 21 days, which would it be — and why?"
    ],
    separateLastQuestion: true
  },
  2: {
    title: "Day 2 — Building Your System of Success (Journal)",
    quote: "When you change the causes you live by, the results have no choice but to change with them.",
    questions: [
      "Choose one clear outcome from your 21-day vision that you will know has been achieved by the end of the sprint.",
      "What daily or recurring actions would make this outcome inevitable if you followed through on them consistently?",
      "What kind of person naturally performs these actions without relying on motivation? Describe the identity behind the behavior.",
      "Write one clear identity statement you are choosing to operate from during this challenge.\n\"I am the kind of person who…\"",
      "Looking at your current habits, which cause (thought, behavior, or belief) needs to change first for this system to work — and why?"
    ]
  },
  3: {
    title: "Day 3 — Auditing Your Time and Energy (Journal)",
    quote: "What you repeatedly give your time and energy to quietly becomes your future.",
    questions: [
      "Which part of your day did you choose to observe (morning, afternoon, or evening), and why did you choose this period?",
      "Write a brief snapshot of what you did during this time.\nFor each activity, note your energy level using H (High), M (Medium), or L (Low).\n\n(Example format: 08:00–09:00 — Emails (L))",
      "Looking at this snapshot, which activities gave you the most energy and which drained it the most?\nWhat patterns do you notice?",
      "How much of this time supported your 21-day vision — and how much did not?\nWhat does this reveal about the causes currently shaping your results?",
      "Keystone Reflection — Awareness as Leverage\nBased on what you observed, what one pattern would you like to strengthen or reduce moving forward — and why?"
    ]
  },
  4: {
    title: "Day 4 — Turning Clarity into Precision (Journal)",
    quote: "What you repeatedly give your time and energy to quietly becomes your future.",
    questions: [
      "What is one goal you want to achieve during this 21-day sprint that directly supports your North Star?\nWrite it clearly, in one sentence.",
      "Rewrite this goal so it is fully Specific and Measurable.\nWhat exactly will you do, and how will you know it's happening?",
      "Is this goal realistically Achievable given your current time, energy, and commitments?\nIf not, how can you adjust it so it stretches you without setting you up for failure?",
      "Why is this goal Relevant to your 21-day vision?\nExplain how achieving it moves your life in the direction you defined on Day 1.",
      "Make the goal Time-bound.\nBy when, or how often, will you act on this goal during the sprint?",
      "Evaluation & Refinement Reflection\nHow will you evaluate progress on this goal as you go — and how will you adjust it if reality doesn't match the plan?"
    ]
  },
  5: {
    title: "Day 5 — Your Keystone Goal (Journal)",
    quote: "When your focus is concentrated, progress accelerates — not because you do more, but because every action matters.",
    questions: [
      "Looking at everything you've defined so far, which single goal would create the greatest positive ripple effect if achieved during these 21 days?\nWrite it clearly.",
      "Why does this goal qualify as your keystone?\nExplain how progress here would make other goals easier, faster, or unnecessary.",
      "Rewrite your keystone goal as a clear SMART-ER statement.\nBe precise about what you will do, how often, and for how long.",
      "How does this keystone goal directly support your 21-day North Star?\nDescribe the connection in your own words.",
      "What distractions, secondary goals, or habits could pull focus away from this keystone goal?\nWhich ones will you consciously deprioritize for the remainder of the sprint?",
      "Keystone Reflection — Commitment to Concentration\nFor the next 21 days, what does protecting this goal look like in practice?\nHow will you ensure it receives your best energy each day?"
    ]
  },
  6: {
    title: "Day 6 — Breaking Goals into Action (Journal)",
    quote: "When action becomes consistent, success stops being a question of chance.",
    questions: [
      "What is your Keystone Goal from Day 5?\nWrite it clearly at the top of this journal.",
      "What is the single core action that most directly moves this goal forward?\nThis should be an action you can realistically perform every day.",
      "Define what \"done\" looks like for this action.\nHow much, how long, or how often must you act for it to count as completed?",
      "What daily trigger will you attach this action to?\nChoose something that already happens every day and complete this sentence:\n\"After I ________, I will ________.\"",
      "When during the day will you protect this action, based on your highest energy window?\nUse what you learned from your Day 3 time and energy audit.",
      "Keystone Reflection — Making Success Inevitable\nIf you performed this one action consistently for the next 21 days, how would it change your confidence, identity, or momentum?"
    ]
  },
  7: {
    title: "Day 7 — Weekly Review & Reset (Journal)",
    quote: "Progress accelerates when you stop repeating the same causes and start consciously choosing better ones.",
    questions: [
      "Looking back at the first six days, where did you stay most consistent?\nWhich habits, actions, or systems worked better than expected?",
      "Where did you lose focus, drift, or struggle the most this week?\nBe specific about moments, not judgments.",
      "For each success or struggle you noticed, what was the cause behind it?\nConsider behaviors, environments, timing, or mental states.",
      "Which weak habit, thought, or action will you consciously replace going into Week 2?\nWhat stronger alternative will you substitute in its place?",
      "What one adjustment will you make to your system, routine, or goals to improve Week 2?\nKeep it small, clear, and realistic.",
      "Keystone Reflection — Locking the Lesson\nWhat single insight from this week, if applied consistently over the next 14 days, would create the greatest improvement?"
    ],
    separateLastQuestion: true
  },
  8: {
    title: "Day 8 — Understanding Habit Loops (Journal)",
    quote: "You don't change behavior by force — you change it by understanding the loop that runs it.",
    questions: [
      "Identify one habit you want to understand or change during this challenge.\nThis can be a behavior you want to reduce or replace — no judgment, just observation.",
      "What is the cue that usually triggers this habit?\nDescribe the signal as clearly as possible (time, place, emotion, situation, or thought).",
      "What is the routine that follows this cue?\nWhat do you actually do when the habit runs?",
      "What is the real reward you get from this habit?\nLook past the behavior and identify the emotional payoff (relief, stimulation, escape, comfort, completion, etc.).",
      "When does this habit usually run on autopilot?\nWhat patterns do you notice about when and how often it appears?",
      "Keystone Reflection — Awareness Before Change\nWhat surprised you most about this habit loop once you broke it into cue, routine, and reward?"
    ]
  },
  9: {
    title: "Day 9 — Replacing a Habit That Holds You Back (Journal)",
    quote: "You don't break habits — you replace them with responses that serve you better.",
    questions: [
      "Which single habit do you want to replace during this challenge?\nBe specific and choose only one.",
      "What is the cue that usually triggers this habit?\nDescribe when, where, or in what state it appears.",
      "What emotional reward does this habit give you?\nFocus on the feeling, not the behavior.",
      "What new routine will you use to replace this habit?\nThis routine should be simple, immediate, and able to deliver a similar reward.",
      "How does this new routine support the person you are becoming during this 21-day sprint?\nDescribe the identity shift it represents.",
      "Keystone Reflection — Locking in the New Loop\nWhen this cue appears next time, what will you consciously choose to do instead — and how will you remind yourself in that moment?"
    ]
  },
  10: {
    title: "Day 10 — Design a Life That Pulls You Forward (Journal)",
    quote: "You don't need more discipline — you need an environment that makes the right choice feel natural.",
    questions: [
      "Look at your current environment. What does it quietly encourage you to do most often?\nThink in terms of habits, distractions, and default behaviors.",
      "Physical Environment Check. Name one physical change you can make today that would make your desired behavior easier or more obvious.\n(Be specific about what you will move, remove, or prepare.)",
      "Digital Environment Check. Which app, notification, or piece of digital clutter most often pulls you away from focus?\nWhat is one adjustment you can make to reduce its influence?",
      "Social Environment Awareness. Which people or conversations most strongly reinforce the identity you want to build right now?\nWhere might you need to reduce exposure to environments that pull you backward?",
      "Environment-to-Identity Link. If your environment consistently reflected the person you want to become, what would it look like day to day?",
      "Keystone Reflection — Designing Attraction. What is the single environmental change that would create the biggest positive pull toward your goals over the next 11 days?"
    ]
  },
  11: {
    title: "Day 11 — Make Success Easier Than Failure (Journal)",
    quote: "When the right action is easier than the wrong one, discipline becomes automatic.",
    questions: [
      "What is the main action you want to perform consistently right now?\n(This should be your keystone action or a habit that directly supports it.)",
      "What friction currently makes this action harder to start than it needs to be?\nList the obstacles, delays, or resistance points you notice.",
      "What is one specific change you can make to reduce friction and make this action easier to begin?\nDescribe exactly what you will prepare, move, or remove.",
      "What habit or behavior do you want to make less convenient starting today?\nBe honest — convenience is usually the real reason it persists.",
      "What friction can you intentionally add to make this unwanted behavior harder to perform?\nThink in terms of distance, effort, or interruption.",
      "Flow Ritual — Your Entry into Focus. Describe the simple sequence you will use to begin your keystone action each day.\n(This should take no more than 1–2 minutes.)"
    ]
  },
  12: {
    title: "Day 12 — Identity Is the Root of All Achievement (Journal)",
    quote: "You don't rise to who you want to be — you act in alignment with who you believe you already are becoming.",
    questions: [
      "Looking at the last 12 days, what concrete evidence do you have that you are already changing?\nList behaviors, actions, or decisions you would not have made before starting this sprint.",
      "Which belief about yourself has limited you in the past but no longer fits who you are becoming?\nDescribe it honestly.",
      "Rewrite that belief into a new identity direction.\nUse language like:\n\"I am becoming someone who…\"\nFocus on direction, not perfection.",
      "How does this new identity explain your recent actions better than your old one did?\nConnect belief to evidence.",
      "When you face resistance or uncertainty, how will you use your future self to guide decisions?\nComplete this sentence:\n\"When I'm unsure, I will ask: 'What would the person I'm becoming do right now?'\"",
      "Keystone Reflection — Identity Lock-In. If you fully trusted this new identity for the rest of the sprint, what would change about how you show up each day?"
    ]
  },
  13: {
    title: "Day 13 — Momentum, Streaks & the Psychology of Winning (Journal)",
    quote: "Momentum grows when your mind starts expecting you to follow through — and you prove it right.",
    questions: [
      "What wins have you already accumulated during this challenge?\nList small or large actions you've followed through on consistently so far.",
      "Which streak are you currently building — intentionally or unintentionally?\nThis could be journaling, your keystone action, a habit, or showing up daily.",
      "How does this streak change the way you see yourself?\nWhat belief about yourself is being reinforced by repeated wins?",
      "What is one small win you can create today that is almost impossible to fail?\nMake it simple, clear, and repeatable.",
      "What do you now expect from yourself over the next 7 days of this sprint?\nBe honest and specific. Expectation shapes behavior.",
      "Keystone Reflection — Momentum Awareness. How does it feel to recognize that progress is already happening — and that momentum is something you can build on purpose?"
    ]
  },
  14: {
    title: "Day 14 — Your Habits Become Your Future (Journal)",
    quote: "What you repeat daily doesn't just change your results — it quietly changes who you become.",
    questions: [
      "Looking back over the last 14 days, which small actions have you repeated most consistently?\nList behaviors you've shown up for — even if they felt minor at the time.",
      "What changes have you already noticed as a result of these repeated actions?\nThink in terms of focus, confidence, discipline, or self-trust.",
      "Which daily action feels most aligned with the person you are becoming?\nExplain why this action matters more than it might seem on its own.",
      "Where have you been tempted to quit, rush, or expect faster results?\nWhat does this reveal about your relationship with patience and trust?",
      "What single habit or action will you deliberately continue compounding for the next 7 days?\nBe clear and realistic.",
      "Keystone Reflection — Trusting the Curve. If you fully trusted the compounding process, how would that change the way you approach tomorrow?"
    ],
    separateLastQuestion: true
  },
  15: {
    title: "Day 15 — Turning Structure Into Execution (Journal)",
    quote: "Clarity grows through action — not waiting.",
    questions: [
      "What is the single most important action you need to execute consistently during this final week?\nThis should be one of your \"critical few\" actions.",
      "Why does this action matter more than most others right now?\nExplain how it directly contributes to finishing strong.",
      "What usually creates resistance or delay when it's time to start this action?\nBe specific about thoughts, feelings, or situations.",
      "What is the smallest possible starting point for this action?\nDefine the \"entry move\" that makes beginning almost effortless.",
      "How will completing this action reinforce the identity you are building?\nDescribe the type of person this behavior proves you are becoming.",
      "Keystone Reflection — Execution Commitment. For the next 7 days, what standard will you hold yourself to when it comes to taking action — even when motivation is low?"
    ]
  },
  16: {
    title: "Day 16 — Deep Work and the Power of Undivided Attention (Journal)",
    quote: "When your attention is undivided, progress accelerates with less effort.",
    questions: [
      "What is the single most important task today that deserves your full attention?\nBe specific about what \"done\" looks like.",
      "Why does this task matter more than others right now?\nExplain how completing it supports your goals or momentum in Week 3.",
      "When will you schedule a 25–30 minute deep work block for this task?\nChoose a realistic time when your energy is highest.",
      "What distractions usually interrupt your focus during work sessions?\nList anything that pulls your attention away — physical, digital, or mental.",
      "What specific steps will you take to create a distraction-free container for this deep work block?\nDescribe how you'll prepare your environment before starting.",
      "Keystone Reflection — Focus as a Skill. How does working with undivided attention change the quality of your output or how you feel afterward?"
    ]
  },
  17: {
    title: "Day 17 — Build a Structure That Makes Success Sustainable (Journal)",
    quote: "You don't rely on motivation when your system tells you exactly what to do next.",
    questions: [
      "What is the main outcome or keystone goal your system needs to support right now?\nKeep this clear and singular.",
      "What is the simple daily sequence you want to follow to support this goal?\nList the key steps in order, focusing on clarity over complexity.",
      "What is your Full Version of this system?\nDescribe what your ideal day looks like when time, energy, and focus are available.",
      "What is your Short Version of this system?\nHow will you adapt the sequence on busy or lower-energy days?",
      "What is your Minimum Version — the smallest action that keeps momentum alive?\nThis should be almost impossible to fail.",
      "Keystone Reflection — System Stability. How does having a defined system change the way you think about discipline, motivation, and consistency?"
    ]
  },
  18: {
    title: "Day 18 — Remove the Hidden Obstacles Inside Your System (Journal)",
    quote: "Progress accelerates when the system becomes lighter, not harder.",
    questions: [
      "Looking at your current system, which step or part creates the most hesitation or resistance?\nThis can be small — even a few seconds of friction.",
      "Why does this step slow you down?\nDescribe what makes it feel heavy, unclear, annoying, or easy to postpone.",
      "Is this step a bottleneck, a redundant action, or a conflicting pattern?\nIdentify which type of friction it is.",
      "What is one simple way you can reduce, simplify, or remove this step entirely?\nThink subtraction, not optimization.",
      "Is there any habit or behavior that quietly works against your system or identity?\nIf so, what is one change that would eliminate that conflict?",
      "Keystone Reflection — System Lightness. How would your daily execution feel if your system ran with less friction and fewer decisions?"
    ]
  },
  19: {
    title: "Day 19 — Strengthen What You Want to Continue (Journal)",
    quote: "What you consistently notice, appreciate, and connect to meaning is what stays.",
    questions: [
      "Which behavior or action from today do you most want to continue long-term?\nChoose one that supports your system or identity.",
      "How did you recognize this behavior today?\nDid you pause, notice it, or acknowledge that you followed through?",
      "What positive feeling did this action create?\nThis could be satisfaction, calm, confidence, relief, or alignment.",
      "How does this behavior connect to the person you are becoming?\nDescribe the identity it reinforces.",
      "How can you make this reinforcement loop repeatable going forward?\nWhat simple cue or moment will remind you to notice, reward, and reflect after completing this action?",
      "Keystone Reflection — Stability Through Reinforcement. How does consciously reinforcing your behavior change the way consistency feels compared to relying on motivation alone?"
    ]
  },
  20: {
    title: "Day 20 — Integrating Your System (Journal)",
    quote: "When your habits, identity, and system work together, progress stops feeling forced.",
    questions: [
      "What is your current keystone action — the one behavior your routine is built around?\nWrite it clearly and simply.",
      "When is your execution window — the focused block where meaningful work happens?\nDescribe when it occurs and what it's primarily used for.",
      "What is your daily reflection moment?\nWhen do you pause to review, reinforce, or adjust your system?",
      "How do these three parts support each other when they work together?\n(Keystone action → execution → reflection)",
      "Which part of your routine feels the strongest right now — and why?",
      "Keystone Reflection — System Integration. If your routine ran exactly like this for the next month, how would your progress and mindset change?"
    ]
  },
  21: {
    title: "Day 21 — Build Your Personal Operating System (Journal)",
    quote: "Completion is not the end — it's the moment responsibility becomes yours.",
    questions: [
      "Looking back on these 21 days, what changes feel most real and stable for you?\nFocus on behaviors, mindset, or structure — not feelings.",
      "Define your Weekly Structure.\nWhat are the key moments in your week that keep you aligned?\n(For example: review, planning, execution, reflection, reset.)",
      "Define your Daily Flow.\nWhat are the non-negotiable elements you will follow most days?\n(Keystone action, focused work, habits, reflection.)",
      "Define your Identity Direction.\nComplete this sentence clearly:\n\"I am the kind of person who…\"",
      "Which part of your system will require the most attention to maintain long-term — and why?\nAwareness here protects consistency.",
      "Keystone Reflection — Continuation. If you followed this Personal Operating System for the next 90 days, how would your life, confidence, and self-trust change?"
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
}

export function JournalingView({
  journalEntries,
  onUpdateJournalEntry,
  user,
  plan = 'free',
  trialEndsAt = null,
  onStartTrial
}: JournalingViewProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
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
    <div className="max-w-3xl mx-auto">
      {/* Custom styles for hover effects */}
      <style>{`
        .sa-lesson-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 18px 24px;
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
          <div className="text-center pt-6 pb-4 animate-rise">
            <div className="sa-brand-line flex items-center justify-center gap-4 mb-10"
              style={{ fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: 'var(--gold, #C5A55A)' }}>
              Structured Achievement
            </div>

            <h2 className="font-serif text-sa-cream mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, lineHeight: 1.12, letterSpacing: '-0.01em' }}>
              Build your personal<br /><em className="text-sa-gold italic">operating system</em>
            </h2>

            <p className="text-sa-cream-soft mx-auto mb-10" style={{ fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.75, maxWidth: 560 }}>
              21 days. Three phases. One system designed to replace chaos with structure, intention with identity, and effort with compounding results.
            </p>

            {/* Stats bar */}
            <div className="flex justify-center gap-12 py-6 mb-0" style={{ borderTop: '1px solid rgba(240,237,230,0.07)', borderBottom: '1px solid rgba(240,237,230,0.07)' }}>
              <div className="text-center">
                <div className="font-serif text-sa-cream" style={{ fontSize: '1.8rem', lineHeight: 1 }}>{completedDays > 0 ? completedDays : 21}</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--cream-muted, #A69F93)', marginTop: 6 }}>
                  {completedDays > 0 ? 'Completed' : 'Lessons'}
                </div>
              </div>
              <div className="text-center">
                <div className="font-serif text-sa-cream" style={{ fontSize: '1.8rem', lineHeight: 1 }}>3</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--cream-muted, #A69F93)', marginTop: 6 }}>Phases</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-sa-cream" style={{ fontSize: '1.8rem', lineHeight: 1 }}>12</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--cream-muted, #A69F93)', marginTop: 6 }}>Principles</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-sa-cream" style={{ fontSize: '1.8rem', lineHeight: 1 }}>∞</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--cream-muted, #A69F93)', marginTop: 6 }}>Compound effect</div>
              </div>
            </div>
          </div>

          {/* Phase sections */}
          {PHASES.map((phase, phaseIndex) => {
            const phaseColor = phaseIndex === 0 ? 'gold' : phaseIndex === 1 ? 'blue' : 'green';
            const colorVar = phaseColor === 'gold' ? 'var(--gold, #C5A55A)' : phaseColor === 'blue' ? 'var(--blue, #6DB5F5)' : 'var(--green, #6ECB8B)';

            return (
              <section key={phase.label} className="animate-rise" style={{ paddingTop: 72 }}>
                {/* Phase header */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colorVar }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: colorVar }}>
                    {phase.label}
                  </span>
                </div>
                <p className="mb-7" style={{ fontSize: '0.92rem', fontWeight: 300, color: 'var(--cream-muted, #A69F93)', lineHeight: 1.7, paddingLeft: 24 }}>
                  {phase.description}
                </p>

                {/* Lesson cards */}
                <div className="flex flex-col gap-1.5">
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
                        <span className="font-serif flex-shrink-0" style={{ fontSize: '0.82rem', width: 20, textAlign: 'right' as const, color: isLocked ? 'var(--cream-faint, #6B665D)' : colorVar }}>
                          {completed ? (
                            <Check className="w-4 h-4 inline" strokeWidth={2.5} style={{ color: colorVar }} />
                          ) : (
                            dayNumber
                          )}
                        </span>

                        {/* Divider */}
                        <div className="flex-shrink-0" style={{ width: 1, height: 20, background: 'rgba(240,237,230,0.08)' }} />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-serif" style={{ fontSize: '0.98rem', fontWeight: 400, color: 'var(--cream, #F2EDE4)', lineHeight: 1.35 }}>
                            {title}
                          </div>
                          <div className="sa-card-principle truncate" style={{ fontSize: '0.72rem', fontWeight: 300, color: 'var(--cream-faint, #6B665D)', marginTop: 3 }}>
                            {principle}
                          </div>
                        </div>

                        {/* Arrow or lock */}
                        {isLocked ? (
                          <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--cream-faint, #6B665D)' }} />
                        ) : (
                          <span className="sa-card-arrow" style={{ fontSize: '1rem', color: 'var(--cream-faint, #6B665D)' }}>→</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Bottom section */}
          <div className="text-center animate-rise" style={{ paddingTop: 80, paddingBottom: 40 }}>
            {/* Diamond divider */}
            <div className="sa-diamond-divider flex items-center justify-center gap-5 mb-12">
              <div style={{ width: 6, height: 6, border: '1px solid var(--cream-faint, #6B665D)', transform: 'rotate(45deg)' }} />
            </div>

            <p className="font-serif italic mx-auto mb-4" style={{ fontSize: '1.25rem', fontWeight: 400, color: 'var(--cream-soft, #D8D2C7)', lineHeight: 1.6, maxWidth: 520 }}>
              Every result has a cause. The system you build here becomes the cause of <strong className="not-italic font-medium text-sa-cream">everything that follows</strong>.
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--cream-faint, #6B665D)', letterSpacing: '0.04em' }}>
              — The Law of Cause and Effect
            </p>

            {/* Phase dots footer */}
            <div className="flex justify-center gap-7" style={{ marginTop: 56, paddingTop: 28, borderTop: '1px solid rgba(240,237,230,0.05)' }}>
              <span className="flex items-center gap-2" style={{ fontSize: '0.68rem', color: 'var(--cream-faint, #6B665D)' }}>
                <span className="rounded-full" style={{ width: 5, height: 5, background: 'var(--gold, #C5A55A)', display: 'inline-block' }} />
                Stabilize
              </span>
              <span className="flex items-center gap-2" style={{ fontSize: '0.68rem', color: 'var(--cream-faint, #6B665D)' }}>
                <span className="rounded-full" style={{ width: 5, height: 5, background: 'var(--blue, #6DB5F5)', display: 'inline-block' }} />
                Reconstruct
              </span>
              <span className="flex items-center gap-2" style={{ fontSize: '0.68rem', color: 'var(--cream-faint, #6B665D)' }}>
                <span className="rounded-full" style={{ width: 5, height: 5, background: 'var(--green, #6ECB8B)', display: 'inline-block' }} />
                Install
              </span>
            </div>
          </div>

          {/* Completion state */}
          {completedDays === 21 && (
            <div className="mt-4 py-6 px-8 bg-sa-green-soft border border-sa-green-border rounded-sa text-center animate-rise">
              <p className="text-sa-green font-serif text-lg">System installed.</p>
              <p className="text-sa-cream-muted text-sm mt-1">All 21 days completed. Operational mode is active.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
