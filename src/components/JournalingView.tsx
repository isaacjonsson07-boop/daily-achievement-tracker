import React, { useState, useEffect } from 'react';
import { BookOpen, BookOpen as Edit, Check, X, ArrowLeft, Lock, Crown } from 'lucide-react';
import { JournalEntry } from '../types';
import { uid } from '../utils/dateUtils';
import { getJournalAccessDays, getTrialDaysRemaining } from '../utils/trialUtils';
import { UpgradePrompt } from './UpgradePrompt';
import { openWhopPaid, openWhopTrial } from '../constants';

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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const journalAccessDays = getJournalAccessDays(plan, trialEndsAt);
  const trialDaysRemaining = getTrialDaysRemaining(trialEndsAt);

  // Initialize journal entries for days 1-21 if they don't exist
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
          answers: {},
          lastModified: new Date().toISOString(),
          userId: user?.id
        });
      }
    }
    
    newEntries.forEach(entry => onUpdateJournalEntry(entry));
  };

  useEffect(() => {
    initializeJournalEntries();
  }, [user]);

  // Auto-save functionality
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
  }, [answers, selectedDay, journalEntries, onUpdateJournalEntry]);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [`question_${questionIndex}`]: value
    }));
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
    }
  };

  const handleStartTrial = async () => {
    if (onStartTrial) {
      await onStartTrial();
    }
  };

  const handleClose = () => {
    setSelectedDay(null);
    setAnswers({});
  };

  const hasContent = (entry: JournalEntry) => {
    return entry.content.trim() !== '' || 
           (entry.answers && Object.values(entry.answers).some(answer => answer.trim() !== ''));
  };

  // If a day is selected, show the journal entry view
  if (selectedDay) {
    const selectedEntry = journalEntries.find(e => e.dayNumber === selectedDay);
    const template = JOURNAL_TEMPLATES[selectedDay as keyof typeof JOURNAL_TEMPLATES];
    
    if (!selectedEntry) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 p-2 rounded-md transition-colors flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {selectedEntry.title}
            </h3>
            <button
              onClick={handleClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Done
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {template && template.questions ? (
              // Structured questions for Day 1 (and future days)
              <div className="space-y-6">
                {template.questions.map((question, index) => (
                  <div
                    key={index}
                    className={`space-y-3 ${
                      index === template.questions.length - 1 && template.separateLastQuestion
                        ? 'pt-8 mt-8 border-t-2 border-blue-200 dark:border-blue-700'
                        : ''
                    }`}
                  >
                    <label className="block text-lg font-semibold text-gray-800 dark:text-white">
                      {index + 1}. {question}
                    </label>
                    <textarea
                      value={answers[`question_${index}`] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      onInput={handleTextareaInput}
                      placeholder="Write your answer here..."
                      className="w-full min-h-[6rem] p-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base leading-relaxed overflow-hidden"
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
              // Free-form journaling for other days
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-800 dark:text-white">
                  Write your journal entry:
                </label>
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
                  placeholder="Start writing your journal entry..."
                  className="w-full min-h-[20rem] p-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base leading-relaxed overflow-hidden"
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
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 italic text-center w-full">
              "{template?.quote || "When you change the causes you live by, the results have no choice but to change with them."}"
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Journal grid view
  return (
    <div className="space-y-6">
      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <button
              onClick={() => setShowUpgradePrompt(false)}
              className="float-right text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
            <UpgradePrompt
              feature="Unlock Days 8-21"
              description="Upgrade to the paid plan to access the full 21-day journaling challenge and unlock all premium features."
            />
          </div>
        </div>
      )}


      {/* Locked State for Free Users */}
      {plan === 'free' && journalAccessDays === 0 && (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl shadow-lg p-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-4">
              <Lock className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              21-Day Journaling Challenge
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Transform your life with daily guided journaling. Build self-awareness, clarify your goals, and create lasting change through structured reflection.
            </p>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What's Included:</h4>
              <ul className="text-left space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>21 days of guided journaling prompts</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Structured questions to deepen self-awareness</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Goal-setting and habit-building frameworks</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Weekly review and reflection sessions</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {onStartTrial && (
                <button
                  onClick={openWhopTrial}
                  className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-lg rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center"
                >
                  <Crown className="w-6 h-6 mr-2" />
                  Start Free Access
                </button>
              )}
              <button
                onClick={openWhopPaid}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center"
              >
                <Crown className="w-6 h-6 mr-2" />
                Upgrade to Full Access
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
              {onStartTrial && "Start with free access to Days 1-7, or "}upgrade for full access to all 21 days
            </p>
          </div>
        </div>
      )}

      {/* Header - only show if user has access */}
      {journalAccessDays > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center mb-4">
            <BookOpen className="w-6 h-6 mr-3" />
            21-Day Journaling Challenge
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your daily journaling practice. Click on any day to start writing your thoughts and reflections.
          </p>
          {plan === 'paid' && (
            <p className="text-green-600 dark:text-green-400 mt-2 font-medium">
              You have full access to all 21 days
            </p>
          )}
          {journalAccessDays > 0 && journalAccessDays < 21 && (
            <p className="text-amber-600 dark:text-amber-400 mt-2 font-medium">
              You have access to Days 1-{journalAccessDays}
            </p>
          )}
        </div>
      )}

      {/* Journal Grid - only show if user has access */}
      {journalAccessDays > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 21 }, (_, index) => {
              const dayNumber = index + 1;
              const entry = journalEntries.find(e => e.dayNumber === dayNumber);
              const entryHasContent = entry && hasContent(entry);
              const isLocked = dayNumber > journalAccessDays;

            return (
              <button
                key={dayNumber}
                onClick={() => handleDayClick(dayNumber)}
                disabled={isLocked}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isLocked
                    ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed'
                    : entryHasContent
                    ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                }`}
              >
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-2 ${
                    isLocked
                      ? 'text-gray-400 dark:text-gray-500'
                      : entryHasContent
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {dayNumber}
                  </div>
                  <div className={`text-sm font-medium mb-1 ${
                    isLocked
                      ? 'text-gray-400 dark:text-gray-500'
                      : entryHasContent
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {entry?.title || `Day ${dayNumber}`}
                  </div>
                  <div className="flex items-center justify-center">
                    {isLocked ? (
                      <div className="flex items-center text-gray-400 dark:text-gray-500">
                        <Lock className="w-4 h-4 mr-1" />
                        <span className="text-xs">Locked</span>
                      </div>
                    ) : entryHasContent ? (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <Check className="w-4 h-4 mr-1" />
                        <span className="text-xs">Complete</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Edit className="w-4 h-4 mr-1" />
                        <span className="text-xs">Start</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
            })}
          </div>
        </div>
      )}

      {/* Day 1 Preview for Free Users (Optional) */}
      {plan === 'free' && journalAccessDays === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Preview: Day 1 — Creating Your North Star
            </h3>
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
            <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-3">
              "When you change the causes you live by, the results have no choice but to change with them."
            </p>
          </div>
          <div className="space-y-4 opacity-60">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                1. Over the next 21 days, what does life look like when you are operating at your best?
              </p>
              <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                <Lock className="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                2. What are 3–5 specific outcomes that would prove this vision is real?
              </p>
              <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                <Lock className="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
              + 3 more guided questions...
            </p>
          </div>
          <div className="mt-6 text-center">
            {onStartTrial && (
              <button
                onClick={openWhopTrial}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg inline-flex items-center"
              >
                <Crown className="w-5 h-5 mr-2" />
                Start Free Access
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}