// ============================================
// STRUCTURED ACHIEVEMENT — Lesson Content Data
// Auto-generated from lesson HTML files
// ============================================

export interface LessonContentBlock {
  type: 'prose' | 'callout' | 'example' | 'appCard';
  html?: string;
  variant?: 'weak' | 'strong';
  tag?: string;
  quote?: string;
  note?: string;
  label?: string;
  description?: string;
  url?: string;
}

export interface LessonSection {
  title: string;
  content: LessonContentBlock[];
}

export interface LessonTask {
  name: string;
  description: string;
  hint?: string;
}

export interface LessonData {
  day: number;
  title: string;
  phase: 1 | 2 | 3;
  phaseLabel: string;
  heroTitle: string;
  heroIntro: string;
  principleLabel: string;
  principleParagraphs: string[];
  sections: LessonSection[];
  appCard?: { label: string; description: string; url: string };
  tasks: LessonTask[];
  tasksSubtitle: string;
  closingParagraphs: string[];
  nextDay?: { eyebrow: string; title: string };
}

export const LESSON_DATA: LessonData[] = 
[
  {
    "day": 1,
    "title": "Define Your Operating Direction",
    "phaseLabel": "Phase I — Stabilize",
    "phase": 1,
    "heroTitle": "Define Your\nOperating Direction",
    "heroIntro": "Every system starts with a single decision: where is this going? Before you build habits, structure, or routine — you need a clear answer to that question. Today, you create the answer.",
    "principleLabel": "The Law of Cause and Effect",
    "principleParagraphs": [
      "Every result has a cause. Every outcome — good or bad — traces back to a decision, a pattern, or a default you didn't know was running."
    ],
    "sections": [
      {
        "title": "Why direction is the first cause",
        "content": [
          {
            "type": "prose",
            "html": "If every result has a cause, then the most important question becomes: what is the first cause? What's the origin point that everything else flows from?"
          },
          {
            "type": "prose",
            "html": "The answer is direction. A clear, specific, written definition of where you're going."
          }
        ]
      },
      {
        "title": "What direction is not",
        "content": [
          {
            "type": "prose",
            "html": "Direction gets confused with several things that sound similar but produce very different results. It's worth being clear about the distinction."
          },
          {
            "type": "prose",
            "html": "<strong>Direction is not a dream.</strong> A dream is vague and emotional — \"I want to be successful\" or \"I want to feel confident.\" Dreams don't give your brain anything to act on. They're pleasant to think about, but they don't change behavior."
          },
          {
            "type": "callout",
            "html": "<p><strong>The distinction that matters:</strong> A dream is something you wish for. A goal is something you plan for. Direction is something you operate from — starting now, today, in the next hour. It's not about the future. It's about the present-tense version of yourself that you've decided to be.</p>"
          }
        ]
      },
      {
        "title": "How to write a strong direction statement",
        "content": [
          {
            "type": "prose",
            "html": "Your direction statement is a short, clear description of how you are operating by the end of Day 21. Not what you hope will happen. Not what inspires you. What you're building toward, described as something real, observable, and completely within your control."
          },
          {
            "type": "prose",
            "html": "A strong direction statement has three non-negotiable qualities:"
          },
          {
            "type": "example",
            "variant": "weak",
            "tag": "Too vague",
            "quote": "\"I want to be successful and feel better about my life.\"",
            "note": "What does \"successful\" mean? What does \"better\" look like? Your brain has nothing to filter for. This is a wish, not a direction."
          },
          {
            "type": "example",
            "variant": "weak",
            "tag": "Dependent on others",
            "quote": "\"I want to get more clients and have people respect my work.\"",
            "note": "You can't control other people's decisions or perceptions. This creates anxiety, not direction."
          },
          {
            "type": "example",
            "variant": "strong",
            "tag": "Clear and operational",
            "quote": "\"By Day 21, I follow a consistent daily structure. I complete my top priorities before noon. I end each day with a clear plan for tomorrow. I don't negotiate with resistance — I execute.\"",
            "note": "Specific, time-bound, self-referenced. Every sentence describes something you can verify at the end of any day. Your brain knows exactly what to filter for."
          },
          {
            "type": "example",
            "variant": "strong",
            "tag": "Another strong example",
            "quote": "\"By Day 21, I operate with calm discipline. I wake before 7, follow my morning routine without exception, protect my deep work block from distractions, and review my progress every evening.\"",
            "note": "Notice how this describes a way of operating — not an outcome. The outcomes will follow from the operation."
          }
        ]
      }
    ],
    "tasks": [
      {
        "name": "Write your direction statement",
        "description": "One to three sentences describing how you're operating by the end of Day 21. Read it back — can you picture exactly what a day looks like when you're living it? If yes, it's ready. If not, make it more specific.",
        "hint": "Start with: \"By Day 21, I…\""
      },
      {
        "name": "Define 3 to 5 daily indicators",
        "description": "These are the observable, binary conditions that prove your direction is active on any given day. Each one should be checkable every evening — either it happened or it didn't.",
        "hint": "\"I completed my morning routine by 8 AM\" or \"No social media before my first work block.\""
      },
      {
        "name": "Stress-test your statement",
        "description": "Read your direction and indicators one more time. Ask: Is every element within my control? Is anything vague or unmeasurable? Could I verify each indicator at the end of today? Tighten anything that's soft."
      },
      {
        "name": "Record your starting point",
        "description": "Write down today's date, your direction statement, and your indicators somewhere permanent — notebook, phone notes, or a document you'll keep. This is Day 1 of your installation record. You'll look back at it on Day 21."
      }
    ],
    "tasksSubtitle": "Complete all four tasks before moving to Day 2.",
    "closingParagraphs": [
      "What you wrote today is the single most referenced piece of your entire operating system. Every lesson, every review, every decision over the next 20 days connects back to this direction statement."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 2",
      "title": "Build your daily structure"
    }
  },
  {
    "day": 2,
    "title": "Build Your Daily Structure",
    "phaseLabel": "Phase I — Stabilize",
    "phase": 1,
    "heroTitle": "Build Your\nDaily Structure",
    "heroIntro": "Direction without structure is just a statement pinned to a wall. Today you translate what you defined yesterday into something you can actually live inside — a daily rhythm that holds your time, your energy, and your attention together.",
    "principleLabel": "The Law of Control",
    "principleParagraphs": [
      "You feel positive about yourself to the degree that you feel you are in control of your own life. You feel negative about yourself to the degree that you feel out of control — that external forces are directing your behavior."
    ],
    "sections": [
      {
        "title": "Why structure matters more than motivation",
        "content": [
          {
            "type": "prose",
            "html": "Motivation is the most overrated force in personal development. It's unreliable, temporary, and entirely dependent on how you feel in the moment. Some days you'll wake up feeling driven. Most days you won't. If your system requires motivation to function, it has an expiration date."
          },
          {
            "type": "prose",
            "html": "Structure doesn't care how you feel. It works on Tuesday morning when you're tired. It works on Friday afternoon when you'd rather stop. It works on the days when nothing goes right — because the structure is already decided. You don't have to think about what comes next. <strong>You just move into the next block.</strong>"
          }
        ]
      },
      {
        "title": "The three anchors",
        "content": [
          {
            "type": "prose",
            "html": "Your daily structure doesn't need to account for every minute. Over-scheduling is a trap — it creates rigidity that breaks at the first disruption. Instead, you need three fixed points that everything else organizes around. These are your anchors."
          },
          {
            "type": "prose",
            "html": "<strong>Anchor 1: The Morning Sequence.</strong> This is the first 30–60 minutes of your day. Its purpose is to set the tone — to transition you from sleep into operating mode deliberately rather than reactively. The biggest mistake most people make is reaching for their phone within minutes of waking up. In doing so, they hand the opening of their day to other people's agendas: emails, notifications, news, social media. Your morning sequence ensures that the first hour belongs to you."
          },
          {
            "type": "callout",
            "html": "<p><strong>The key principle:</strong> Your morning sequence should be simple enough to do on your worst day. If it requires perfect conditions — a quiet house, plenty of time, a good mood — it will fail within a week. Design for your worst morning, and it will feel effortless on your best ones.</p>"
          },
          {
            "type": "callout",
            "html": "<p><strong>Why the close-out changes everything:</strong> Most people start each day figuring out what to do. This means the first 30–60 minutes are wasted on planning that could have been done the night before. The evening close-out eliminates this. You wake up and your priorities are already defined. That single change can add 5+ hours of productive time per week.</p>"
          }
        ]
      },
      {
        "title": "What this looks like in practice",
        "content": [
          {
            "type": "example",
            "variant": "weak",
            "tag": "Unstructured day",
            "quote": "\"I wake up whenever, check my phone for 20 minutes, eventually start working on whatever feels most urgent, get pulled into messages and emails throughout the day, and go to bed when I'm tired without reviewing anything.\"",
            "note": "No anchors. Every hour is negotiable. Energy leaks everywhere. Tomorrow will look exactly the same."
          },
          {
            "type": "example",
            "variant": "strong",
            "tag": "Structured day",
            "quote": "\"Up at 7. Morning sequence by 7:30 — water, review direction, set intention. Core execution from 8 to 11 — phone off, door closed. Flexible afternoon for meetings, admin, and lower-priority work. Evening close-out at 9 PM — review, capture, set tomorrow. Lights out by 10:30.\"",
            "note": "Three anchors in place. The rest of the day flexes around them. Simple enough to follow every day. Robust enough to hold up under pressure."
          },
          {
            "type": "prose",
            "html": "Notice what the structured version doesn't do: it doesn't schedule every hour. It doesn't require perfection. It creates three fixed points and lets everything else organize naturally between them. This is sustainable. A minute-by-minute schedule is not."
          }
        ]
      }
    ],
    "tasks": [
      {
        "name": "Define your morning sequence",
        "description": "Write down the first 3–5 things you do every morning, in order. Keep it under 45 minutes. It needs to work on your worst day — tired, rushed, low motivation. If it wouldn't survive a bad morning, simplify it.",
        "hint": "Example: Wake at 7. Water. Read direction statement. Set today's top 3. Begin first task."
      },
      {
        "name": "Set your core execution block",
        "description": "Choose a 2–4 hour window for your most important daily work. When does it start? When does it end? What type of work belongs here? Write it down and commit to protecting this block from interruptions starting tomorrow."
      },
      {
        "name": "Design your evening close-out",
        "description": "A 10-minute end-of-day routine with three steps: Review what happened today. Capture anything still on your mind. Set your top 3 priorities for tomorrow. Choose a time and write out the format.",
        "hint": "This single habit will transform how you start every morning."
      },
      {
        "name": "Write your complete daily structure",
        "description": "Combine all three anchors into one overview — your operating rhythm for the next 19 days. Post it where you'll see it. This isn't a wish list — it's the shape of your day starting tomorrow."
      },
      {
        "name": "Run your first close-out tonight",
        "description": "Don't wait until tomorrow to start. Tonight, spend 10 minutes running through the close-out process. Review today. Set tomorrow's priorities. Start the system now."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 3.",
    "closingParagraphs": [
      "You now have two foundational components installed: a direction and a structure to move toward it."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 3",
      "title": "Identify your defaults"
    }
  },
  {
    "day": 3,
    "title": "Identify Your Defaults",
    "phaseLabel": "Phase I — Stabilize",
    "phase": 1,
    "heroTitle": "Identify\nYour Defaults",
    "heroIntro": "You've set a direction and built a structure. But there's something else running in the background — an older system, assembled over years, made up of habits, reactions, and patterns you've repeated so often you don't even notice them anymore. Today, you see them.",
    "principleLabel": "The Law of Habit",
    "principleParagraphs": [
      "Almost everything you do is the result of habit. From the moment you wake up to the moment you fall asleep, the vast majority of your actions are not conscious choices — they are automated patterns that run without your awareness."
    ],
    "sections": [
      {
        "title": "You were already running a system",
        "content": [
          {
            "type": "prose",
            "html": "Before Day 1 of this program, you weren't operating without a system. You were operating on an <em>unexamined</em> system — one that was assembled over years from upbringing, environment, repeated choices, social influence, and things you drifted into without ever consciously deciding."
          },
          {
            "type": "prose",
            "html": "This invisible system includes everything: what time you wake up, how you start your day, how you respond to stress, what you eat, how you spend your evenings, what you do when you're bored, what you avoid, what you say yes to automatically, how you talk to yourself when things go wrong."
          }
        ]
      },
      {
        "title": "Why this is a diagnostic, not therapy",
        "content": [
          {
            "type": "prose",
            "html": "Let's be clear about what this is. You're not analyzing your childhood or exploring the emotional roots of your behavior. You're running a diagnostic — a cold, honest assessment of what you actually do on a typical day versus what you think you do."
          },
          {
            "type": "prose",
            "html": "These two things are almost never the same. Most people dramatically overestimate how much time they spend on productive activities and dramatically underestimate how much time leaks into distraction, avoidance, and low-value behavior. Studies on time perception consistently show that people's estimates of how they spend their day are off by 2–3 hours in either direction."
          }
        ]
      },
      {
        "title": "Three categories of defaults",
        "content": [
          {
            "type": "prose",
            "html": "Your defaults fall into three categories. Map each one honestly."
          },
          {
            "type": "prose",
            "html": "<strong>Time defaults — where your time actually goes.</strong> Not where you think it goes. Not where you'd like it to go. Where it actually goes when you're not paying attention. The gaps between tasks. The transitions. The moments when you pick up your phone \"for a second\" and lose 20 minutes. The evenings that evaporate into scrolling or watching something you didn't plan to watch."
          },
          {
            "type": "callout",
            "html": "<p><strong>A critical distinction:</strong> Defaults are not character flaws. They're not evidence that something is wrong with you. They're simply patterns — automated responses that were installed through repetition. You installed most of them unconsciously, which means you can <em>uninstall</em> them deliberately. But only after you've identified them with precision.</p>"
          }
        ]
      }
    ],
    "tasks": [
      {
        "name": "List your top 5 time defaults",
        "description": "Where does your time actually go during a typical day? Include the unconscious patterns — scrolling, snacking, overplanning, unnecessary browsing. Check your phone's screen time data for real numbers. Be brutally honest.",
        "hint": "Focus on the gaps: what do you do in the spaces between planned activities?"
      },
      {
        "name": "List your top 3 energy drains",
        "description": "What regularly drains your energy that you keep doing anyway? These could be people, activities, environments, habits, or commitments. For each one, note whether you actively chose it or drifted into it."
      },
      {
        "name": "List your top 3 decision defaults",
        "description": "What do you consistently say yes to that you shouldn't? What do you avoid or postpone? What does your resistance pattern look like when it shows up — do you distract, rationalize, or numb?"
      },
      {
        "name": "Mark which defaults conflict with your direction",
        "description": "Open your Day 1 direction statement. Read each default you've identified. For each one, honestly ask: does this help my direction, harm it, or have no effect? Circle every one that actively works against your direction. These are your targets."
      },
      {
        "name": "Choose the one default that costs you the most",
        "description": "Of all the defaults you've identified, which single one creates the most damage to your direction and structure? Name it. You're not fixing it today — but you need to know what it is. Tomorrow's lesson is the antidote."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 4.",
    "closingParagraphs": [
      "Today wasn't about fixing anything. It was about seeing clearly. You can't redesign a system you haven't mapped, and now you have a clear inventory of the automated patterns running your daily behavior."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 4",
      "title": "Set your non-negotiables"
    }
  },
  {
    "day": 4,
    "title": "Set Your Non-Negotiables",
    "phaseLabel": "Phase I — Stabilize",
    "phase": 1,
    "heroTitle": "Set Your\nNon-Negotiables",
    "heroIntro": "You've defined your direction, built a structure, and mapped the patterns working against you. Now you install the behaviors that hold everything together — the actions that happen regardless of mood, energy, or circumstance.",
    "principleLabel": "The Law of Discipline",
    "principleParagraphs": [
      "Discipline is the ability to do what you should do, when you should do it, whether you feel like it or not. It is the single most important quality for ensuring long-term success in any area of life."
    ],
    "sections": [
      {
        "title": "The problem with flexibility",
        "content": [
          {
            "type": "prose",
            "html": "Yesterday you identified defaults — the unconscious patterns that run your behavior. Today you build the antidote. But before we do, you need to understand why most people fail at this step."
          },
          {
            "type": "prose",
            "html": "They make their commitments flexible. \"I'll try to work out most days.\" \"I'll aim to wake up early.\" \"I'll do my best to follow the structure.\" Each of these sounds reasonable. Each one will fail — because flexibility in a commitment is just permission to skip it."
          }
        ]
      },
      {
        "title": "What makes a real non-negotiable",
        "content": [
          {
            "type": "prose",
            "html": "A non-negotiable is not an aspiration. It's not your ideal day. It's the minimum viable set of actions that keeps your system running even on your worst day. This distinction is critical."
          },
          {
            "type": "prose",
            "html": "<strong>Simple enough for your worst day.</strong> If a non-negotiable requires 90 minutes, good conditions, and a clear schedule, it will break within a week. Your worst days are the test. Sick days. Travel days. Days when everything goes wrong. If you can still do it on those days, it qualifies. If you can't, simplify until you can."
          },
          {
            "type": "callout",
            "html": "<p><strong>The paradox of simplicity:</strong> People resist making their non-negotiables simple. It feels like you're not doing enough. But simplicity is the strategy. A commitment you keep every single day for 21 days straight changes you. A ambitious commitment you keep for 4 days and then abandon changes nothing. The power is in the streak, not the intensity.</p>"
          }
        ]
      },
      {
        "title": "How many non-negotiables",
        "content": [
          {
            "type": "prose",
            "html": "Three to five. No more. Every additional non-negotiable increases the probability that you'll miss one, and a missed non-negotiable erodes the entire system. You're building a floor, not a ceiling. On good days, you'll do far more than your non-negotiables. On bad days, you'll do exactly your non-negotiables — and that's enough."
          },
          {
            "type": "prose",
            "html": "Think of it this way: if you do nothing else on a given day except your 3–5 non-negotiables, can you still say the day served your direction? If yes, the list is right. If no, something important is missing."
          },
          {
            "type": "example",
            "variant": "weak",
            "tag": "Too ambitious",
            "quote": "\"Work out for 60 minutes, read for an hour, meditate for 20 minutes, journal for 30 minutes, meal prep, practice a skill for an hour, and review my goals.\"",
            "note": "This is a beautiful day. It's also 3+ hours of commitments that will collapse by Day 3. This is a wish list disguised as discipline."
          },
          {
            "type": "example",
            "variant": "strong",
            "tag": "Realistic and firm",
            "quote": "\"Morning sequence by 8 AM. Complete my #1 priority before noon. Evening close-out before bed. No exceptions.\"",
            "note": "Three items. Maybe 45 minutes total. Doable when you're sick. Doable when traveling. Doable when your day falls apart. That's the point."
          }
        ]
      }
    ],
    "tasks": [
      {
        "name": "Choose 3 to 5 non-negotiable daily actions",
        "description": "These are the behaviors you commit to doing every single day for the remaining 17 days. Each one must be simple, binary, within your control, and connected to your direction. Write them down.",
        "hint": "Test: Would you still do all of these on your worst day? If not, simplify."
      },
      {
        "name": "Stress-test against your worst day",
        "description": "Imagine your busiest, most exhausting, most disrupted day. Walk through your non-negotiables mentally. Could you still complete every one? If any would fail under pressure, simplify it further. The floor must hold on the worst day."
      },
      {
        "name": "Connect each non-negotiable to a Day 3 default",
        "description": "For each non-negotiable, identify which destructive default it directly counters. If a non-negotiable doesn't counter any of your identified defaults, question whether it belongs on the list."
      },
      {
        "name": "Place your non-negotiable list where you'll see it daily",
        "description": "Phone lock screen, sticky note on your mirror, first page of your notebook, taped to your desk. This list should be impossible to forget. Visibility creates accountability."
      },
      {
        "name": "Commit out loud",
        "description": "Say your non-negotiables out loud — to yourself, to someone you trust, or record a voice memo. Verbalizing a commitment activates a different level of psychological buy-in than just writing it down. This sounds simple. It matters more than you'd expect."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 5.",
    "closingParagraphs": [
      "You now have four components installed: direction, structure, pattern awareness, and behavioral anchors. These four form the foundation of your operating system. They answer the fundamental questions: where am I going, how is my day organized, what's working against me, and what do I do no matter what."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 5",
      "title": "Introduce the tracker"
    }
  },
  {
    "day": 5,
    "title": "Introduce the Tracker",
    "phaseLabel": "Phase I — Stabilize",
    "phase": 1,
    "heroTitle": "Introduce\nthe Tracker",
    "heroIntro": "You have a direction, a structure, awareness of your defaults, and a set of non-negotiable behaviors. Today, you connect all of it to a tool that makes your daily execution visible and measurable — the Structured Achievement tracker.",
    "principleLabel": "The Law of Accumulation",
    "principleParagraphs": [
      "Every great achievement is an accumulation of hundreds — sometimes thousands — of small efforts that no one sees or appreciates. Each individual effort may seem insignificant on its own. But compounded over time, they produce extraordinary results."
    ],
    "sections": [
      {
        "title": "Why you need a record",
        "content": [
          {
            "type": "prose",
            "html": "For the past four days, you've been building and executing a system — but the only record of your progress lives in your memory. And memory is unreliable."
          },
          {
            "type": "prose",
            "html": "Without tracking, you'll overestimate bad weeks and underestimate good ones. You'll forget a five-day streak because of one bad day. You'll feel like nothing is changing when the data would show otherwise. Human perception of personal progress is consistently biased toward the negative — we remember failures more vividly than successes and weigh recent setbacks more heavily than accumulated wins."
          }
        ]
      },
      {
        "title": "What to track and what not to track",
        "content": [
          {
            "type": "prose",
            "html": "The tracker is an execution interface — a place to confirm that you did what you said you'd do. It is not a journal. It is not a project manager. It is not a place for long reflections or elaborate notes. Simplicity is essential because complexity kills consistency."
          },
          {
            "type": "prose",
            "html": "Here's what goes in:"
          },
          {
            "type": "callout",
            "html": "<p><strong>The 2-minute rule:</strong> Your daily logging should take no more than 2 minutes. If it takes longer, you're tracking too much. The tracker serves you — you don't serve the tracker. If logging feels like a burden, simplify what you're tracking until it's fast enough to do every single day without resistance.</p>"
          }
        ]
      },
      {
        "title": "When and how to log",
        "content": [
          {
            "type": "prose",
            "html": "Log during your evening close-out. This is the natural moment — you're already reviewing your day and setting up tomorrow. Add 2 minutes at the end for tracking. Open the app, check off your non-negotiables, note your indicators, write your brief daily note. Done."
          },
          {
            "type": "prose",
            "html": "Don't log in the morning for the previous day. Memory degrades overnight, and you'll either forget things or unconsciously round up your performance. Log while the day is still fresh."
          }
        ]
      }
    ],
    "appCard": {
      "label": "Open the Tracker",
      "description": "Set up your <strong>Goals</strong>, add your non-negotiables as <strong>Tasks</strong>, and log your first day.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Set up your tracker",
        "description": "Open the Structured Achievement app. Go to <strong>Goals</strong> and enter your direction statement as your primary goal. Then go to <strong>Tasks</strong> and add each of your non-negotiables as a daily task. Take 5 minutes to explore the Dashboard — this is where your data will live."
      },
      {
        "name": "Log today as your first tracked day",
        "description": "Complete your non-negotiables today. During your evening close-out, open the app and check off your completed <strong>Tasks</strong>. Then go to the <strong>Dashboard</strong> — you'll see your first data point. This is Day 1 of your tracked record."
      },
      {
        "name": "Set a daily reminder for logging",
        "description": "Put a recurring alarm or calendar event 5 minutes before your evening close-out time. The reminder ensures logging doesn't get skipped. Don't rely on memory — automate the trigger."
      },
      {
        "name": "Commit to logging every day through Day 21",
        "description": "The tracker only produces value with consistent use. One logged day is a data point. Sixteen consecutive logged days is a dataset. Make the commitment explicit: every day, during close-out, 2 minutes, no exceptions."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 6.",
    "closingParagraphs": [
      "You now have a tool connected to your system. Direction, structure, non-negotiables, and a tracker to make it all visible and accountable. The invisible effort you've been putting in since Day 1 is now captured in data."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 6",
      "title": "Design your environment"
    }
  },
  {
    "day": 6,
    "title": "Design Your Environment",
    "phaseLabel": "Phase I — Stabilize",
    "phase": 1,
    "heroTitle": "Design Your\nEnvironment",
    "heroIntro": "Your system is installed and you're tracking daily. But there's a force constantly shaping your behavior that most people never consciously address — the environment you operate in. Today, you reshape it to work for your system instead of against it.",
    "principleLabel": "The Law of Correspondence",
    "principleParagraphs": [
      "Your outer world is a mirror of your inner world. The conditions surrounding you — your workspace, your phone, your relationships — reflect and reinforce the patterns inside you."
    ],
    "sections": [
      {
        "title": "The invisible force",
        "content": [
          {
            "type": "prose",
            "html": "You can have perfect direction, structure, and discipline — and still lose to a bad environment. Not because you're weak, but because environment is the single most powerful influence on daily behavior. Research in behavioral psychology consistently shows that environmental cues drive behavior more reliably than intention, motivation, or even habit."
          },
          {
            "type": "prose",
            "html": "Here's a simple example: if a bowl of candy sits on your desk, you'll eat from it repeatedly throughout the day — not because you're hungry, not because you decided to, but because it's there. Remove the bowl and the behavior disappears. You didn't change your willpower. You changed the environment. The behavior followed automatically."
          }
        ]
      },
      {
        "title": "Three environments to audit",
        "content": [
          {
            "type": "prose",
            "html": "<strong>Your physical environment.</strong> This is the space where you work, rest, and live. The layout, the cleanliness, the tools available, the distractions present. A workspace optimized for your system has your essential tools within reach, your non-essential items out of sight, and a clear visual field that signals \"this is where focused work happens.\""
          },
          {
            "type": "prose",
            "html": "Walk through your workspace right now (or visualize it). What's on your desk? Is every item there because it serves your work, or because it landed there and never got moved? Is the space organized in a way that supports your core execution block, or does it create friction? What's the first thing you see when you sit down — something that pulls you toward your direction, or something that distracts from it?"
          },
          {
            "type": "callout",
            "html": "<p><strong>The highest-ROI digital change:</strong> Turn off all non-essential notifications. Every single one. Leave only phone calls and messages from people who genuinely need to reach you in real-time. This single change eliminates dozens of daily interruptions and reclaims hours of focus. Most people resist this change because they fear missing something. After a week, they realize they miss nothing — and gain everything.</p>"
          }
        ]
      },
      {
        "title": "The friction principle",
        "content": [
          {
            "type": "prose",
            "html": "Environment design follows one simple principle: <strong>reduce friction for behaviors you want and increase friction for behaviors you don't.</strong>"
          },
          {
            "type": "prose",
            "html": "Want to work out in the morning? Sleep in your workout clothes and put your shoes by the bed. Want to stop checking social media? Delete the apps from your phone and only access them from a browser. Want to eat better? Don't keep junk food in the house. Want to read more? Put a book on your pillow."
          }
        ]
      }
    ],
    "appCard": {
      "label": "Log in the Tracker",
      "description": "Complete your <strong>Tasks</strong> and write a <strong>Journal</strong> entry about your environment audit.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Audit your physical workspace",
        "description": "Sit at your desk or primary workspace. Look at everything visible. For each item, ask: does this serve my core execution block? Remove or relocate anything that doesn't. Add anything that's missing. Create a clear, focused visual environment.",
        "hint": "The goal: when you sit down to work, everything you see should pull you toward execution, not away from it."
      },
      {
        "name": "Audit and reconfigure your phone",
        "description": "Check your screen time data from the past week. Turn off all non-essential notifications. Move distracting apps off your home screen (or delete them). Set your phone to Do Not Disturb during your core execution block. Make the phone a tool that serves your system, not a trap that undermines it."
      },
      {
        "name": "Audit your social environment",
        "description": "List the 5 people you spend the most time with. For each one, honestly assess: does this relationship support your direction, distract from it, or actively work against it? You don't need to act on this today — but you need to see the pattern clearly."
      },
      {
        "name": "Make one friction change in each environment",
        "description": "Physical: one change that removes friction from productive behavior. Digital: one change that adds friction to distraction. Social: one boundary or adjustment that protects your system. Three small changes, implemented today."
      },
      {
        "name": "Design your core execution block environment",
        "description": "Write down exactly what your environment looks like during your 2–4 hour core block. Phone location, door open or closed, browser tabs allowed, background noise. Create a specific environmental protocol for your most important work window."
      },
      {
        "name": "Write your first Journal entry",
        "description": "Open the app and go to <strong>Journal</strong>. Write 2-3 sentences about today's environment audit — what you changed in your physical, digital, and social spaces. This is the beginning of your installation record."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 7.",
    "closingParagraphs": [
      "You've spent six days building from the inside out — direction, structure, awareness, discipline, tracking. Today you shaped the outside to match. The environment now supports the system instead of fighting it."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 7",
      "title": "Week one review"
    }
  },
  {
    "day": 7,
    "title": "Week One Review",
    "phaseLabel": "Phase I — Stabilize",
    "phase": 1,
    "heroTitle": "Week One\nReview",
    "heroIntro": "Six components installed in six days. Direction, structure, defaults mapped, non-negotiables set, tracker live, environment redesigned. Today you step back, look at the actual data, and assess what's holding, what's slipping, and what needs to change.",
    "principleLabel": "The Law of Feedback",
    "principleParagraphs": [
      "Success is not a straight line. It's a continuous process of action, feedback, and correction. The people who achieve the most are not the ones who execute perfectly — they're the ones who review honestly, adjust quickly, and keep moving."
    ],
    "sections": [
      {
        "title": "Why this review matters more than any lesson",
        "content": [
          {
            "type": "prose",
            "html": "Information without reflection is entertainment. Over the past six days, you've absorbed principles, built structures, and started tracking. But none of that matters if you don't stop and honestly assess what actually happened versus what you planned."
          },
          {
            "type": "prose",
            "html": "Most people skip reviews. They feel like they already know how the week went based on how they feel about it. But feelings are unreliable data. You might feel like the week was a failure because you missed two non-negotiables — while the data shows you completed 85% of them, followed your structure on five out of six days, and logged every single day in the tracker."
          }
        ]
      },
      {
        "title": "How to run the review",
        "content": [
          {
            "type": "prose",
            "html": "Open your tracker. Look at the data from Days 1–6. Then work through each component systematically."
          },
          {
            "type": "prose",
            "html": "<strong>Direction check.</strong> Read your Day 1 direction statement out loud. Does it still feel right? Does it still create clarity when you read it? Is it specific enough to guide daily decisions? After six days of experience, you may see ways to sharpen it. Not change it fundamentally — sharpen it. The direction should get clearer over time, not vaguer."
          },
          {
            "type": "callout",
            "html": "<p><strong>The most important question in any review:</strong> What would I do differently if I were starting this week over? Don't just assess what happened — extract the lesson. The review is useful not because it tells you what went wrong, but because it tells you <strong>what to adjust going forward</strong>.</p>"
          }
        ]
      },
      {
        "title": "How to recalibrate",
        "content": [
          {
            "type": "prose",
            "html": "Based on your review, you're going to make one — and only one — adjustment. Not five. Not a complete overhaul. One specific change that addresses the most important finding from your review."
          },
          {
            "type": "prose",
            "html": "If your biggest issue was missing your morning sequence, the adjustment might be: \"set my alarm 15 minutes earlier\" or \"prepare my morning the night before.\" If your biggest issue was breaking your core execution block for phone checks, the adjustment might be: \"phone stays in another room during core block, starting tomorrow.\""
          }
        ]
      }
    ],
    "appCard": {
      "label": "Review Your Dashboard",
      "description": "Open the <strong>Dashboard</strong> to see your first week of data. Check your Task completion rates and streaks.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Run a full 6-day review",
        "description": "Open the app <strong>Dashboard</strong> and review your data from the past week. Look at your Task completion rates and streaks. For each component — direction, structure, non-negotiables, defaults, environment — rate your consistency: strong, partial, or missed. The Dashboard shows you facts, not feelings."
      },
      {
        "name": "Identify your #1 strength and #1 weakness",
        "description": "What component held up best this week? What fell apart most? Be specific — not 'discipline' but 'I followed my morning sequence 5 out of 6 days' or 'I skipped my evening close-out 4 times because I stayed up too late.'",
        "hint": "Let the tracker data answer this, not your feelings about the week."
      },
      {
        "name": "Make one specific adjustment",
        "description": "Based on your review, identify one change that would have the biggest positive impact on next week. Write it down clearly: what you're changing, why, and how it works starting tomorrow."
      },
      {
        "name": "Write your Week 1 status report",
        "description": "Go to <strong>Journal</strong> in the app. Write 3-5 sentences summarizing your first week. Reference your Dashboard data — what's your actual Task completion rate? What's your streak count? What's your one adjustment for Week 2? This becomes part of your permanent installation record."
      },
      {
        "name": "Acknowledge the foundation you've built",
        "description": "In six days, you've installed a direction, daily structure, pattern awareness, behavioral anchors, a tracking system, and an optimized environment. That's a complete operating foundation. Review your tracker — the data is proof of what you've built."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 8.",
    "closingParagraphs": [
      "Phase I is complete. In seven days, you've gone from zero structure to a functioning daily operating system with direction, rhythm, discipline, tracking, and environmental support. That's not nothing. That's the foundation everything else builds on."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 8",
      "title": "Define your operating identity"
    }
  },
  {
    "day": 8,
    "title": "Define Your Operating Identity",
    "phaseLabel": "Phase II — Reconstruct",
    "phase": 2,
    "heroTitle": "Define Your\nOperating Identity",
    "heroIntro": "Phase II begins. Your system is stable — you have structure, discipline, and tracking in place. But structure alone won't hold long-term. What holds is identity. Today you define who you are becoming, and let your behavior follow from that decision.",
    "principleLabel": "The Law of Belief",
    "principleParagraphs": [
      "Whatever you believe with conviction becomes your reality. You do not believe what you see — you see what you already believe. Your beliefs act as filters, shaping what you notice, what you attempt, and what you achieve."
    ],
    "sections": [
      {
        "title": "Why identity comes before everything else in Phase II",
        "content": [
          {
            "type": "prose",
            "html": "In Phase I, you built structure and discipline through external mechanisms — a defined schedule, non-negotiable commitments, a tracker, environmental design. These work. But they work through effort. Every day, there's a gap between who you are and what the system asks you to do, and you bridge that gap through willpower and structure."
          },
          {
            "type": "prose",
            "html": "Identity closes that gap. When you internalize a clear picture of who you are — not who you hope to become someday, but who you're choosing to be starting now — the behavior stops requiring effort. It becomes consistent with your self-concept. You don't have to force yourself to follow the morning sequence. You follow it because that's what someone like you does."
          }
        ]
      },
      {
        "title": "What an identity statement is (and isn't)",
        "content": [
          {
            "type": "prose",
            "html": "Your identity statement is a present-tense description of who you are when you're operating at your best. Not who you want to be in five years. Not a motivational quote. Not a fantasy version of yourself. A grounded, honest description of the person who runs the system you've spent seven days building."
          },
          {
            "type": "prose",
            "html": "The key word is <em>present tense</em>. \"I am...\" not \"I will be...\" This isn't dishonesty — it's a decision. You're choosing to operate as this person starting now, even if the fit isn't perfect yet. The gap between the statement and your current reality is your growth edge. Every day you act consistently with the statement, the gap narrows."
          },
          {
            "type": "example",
            "variant": "weak",
            "tag": "Vague and aspirational",
            "quote": "\"I am a successful, confident person who lives their best life and inspires everyone around them.\"",
            "note": "This sounds good on a poster. But it gives your brain nothing actionable. What does \"best life\" mean? What does \"inspiring\" look like at 7 AM on a Tuesday? You can't verify any of this at the end of a day."
          },
          {
            "type": "example",
            "variant": "strong",
            "tag": "Grounded and operational",
            "quote": "\"I am disciplined and deliberate. I follow my daily structure, complete my top priorities before noon, and end each day with clarity about tomorrow. I don't negotiate with resistance — when it's time to execute, I execute. I hold myself accountable through data, not feelings.\"",
            "note": "Every sentence describes something you can do today. Every sentence is verifiable. Your brain knows exactly what \"being this person\" looks like in practice."
          },
          {
            "type": "example",
            "variant": "strong",
            "tag": "Another strong example",
            "quote": "\"I am someone who operates with intention. I don't drift through days — I design them. I take full responsibility for my results and I understand that every outcome in my life traces back to my decisions and patterns. I am building something, and I show up for it daily.\"",
            "note": "This connects identity directly to the psychology of achievement — cause and effect, responsibility, intentionality. It's personal, grounded, and actionable."
          }
        ]
      },
      {
        "title": "The identity-behavior loop",
        "content": [
          {
            "type": "prose",
            "html": "Identity and behavior form a reinforcing loop. Your identity shapes your behavior: you act in ways that are consistent with who you believe you are. And your behavior shapes your identity: every action you take is a vote for the type of person you're becoming."
          },
          {
            "type": "prose",
            "html": "When you follow your morning sequence, you're casting a vote for \"I am someone who starts deliberately.\" When you complete your non-negotiables, you're casting a vote for \"I am disciplined.\" When you do your evening close-out, you're casting a vote for \"I take my system seriously.\" Each vote is small on its own. But they accumulate. And eventually, the accumulated votes create a new self-concept that's so strong, the behavior becomes effortless."
          },
          {
            "type": "callout",
            "html": "<p><strong>The gap is the growth edge:</strong> There will be a gap between your identity statement and your current behavior. That's not a problem — it's the entire point. The gap is where growth happens. Your job is not to eliminate the gap immediately. It's to close it a little more every day by acting consistently with the identity you've chosen. The tracker data from Phase I is evidence that you've already started.</p>"
          }
        ]
      }
    ],
    "appCard": {
      "label": "Update Your Goals",
      "description": "Add your <strong>identity statement</strong> as a new Goal alongside your direction statement.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Write your identity statement",
        "description": "3–5 sentences in present tense. Describe the person who runs your system — grounded, behavioral, honest. Read it aloud. If it sounds like a social media bio or a motivational poster, rewrite it. It should sound like a description your closest friend would recognize as the best version of you."
      },
      {
        "name": "Test it against your direction statement",
        "description": "Read your Day 1 direction statement, then your identity statement. Does the person described in the identity statement naturally produce the direction? If not, adjust one or both until they align."
      },
      {
        "name": "Identify the biggest gap",
        "description": "Honestly assess: where is the largest gap between your identity statement and your actual behavior over the past 7 days? Name it specifically. This is your primary growth edge for Phase II — the area where identity and behavior are most misaligned."
      },
      {
        "name": "Create a daily identity practice",
        "description": "Place your identity statement next to your non-negotiable list. Read both every morning during your morning sequence. This takes 30 seconds and anchors your self-concept before the day begins. Over time, the words become automatic — and so does the behavior they describe."
      },
      {
        "name": "Review your tracker data through the identity lens",
        "description": "Look at your logged days from Phase I. Every completed non-negotiable was a vote for your new identity. Count the votes. You've already started becoming this person — the data proves it."
      },
      {
        "name": "Add your identity statement to the app",
        "description": "Open <strong>Goals</strong> in the tracker and add your identity statement as a new goal. Now both your direction and your identity are visible every time you open the app — a daily reminder of where you're going and who you're being."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 9.",
    "closingParagraphs": [
      "You now have direction, structure, and an identity to operate from. This changes the nature of discipline entirely. It's no longer about forcing yourself to do things you don't want to do. It's about being consistent with who you've decided to be."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 9",
      "title": "Architect your priorities"
    }
  },
  {
    "day": 9,
    "title": "Architect Your Priorities",
    "phaseLabel": "Phase II — Reconstruct",
    "phase": 2,
    "heroTitle": "Architect\nYour Priorities",
    "heroIntro": "You've defined who you are. Now you define what matters most. Because the person you described yesterday can't give equal energy to everything — and treating everything as equally important is the fastest way to make progress on nothing.",
    "principleLabel": "The Law of Concentration",
    "principleParagraphs": [
      "The ability to concentrate single-mindedly on the most important thing and stay with it until it is complete is the essential quality of high achievement. Scattered effort produces scattered results."
    ],
    "sections": [
      {
        "title": "The priority trap",
        "content": [
          {
            "type": "prose",
            "html": "The word \"priority\" entered the English language in the 1400s. It was singular — it meant the one thing that mattered most. It stayed singular for the next 500 years. Only in the 1900s did people start talking about \"priorities\" — plural. And with that linguistic shift came a conceptual one: the idea that you could have multiple most-important things simultaneously."
          },
          {
            "type": "prose",
            "html": "You can't. This isn't a motivational claim — it's a cognitive reality. Your brain is designed for sequential focus, not parallel processing. When you try to focus on five priorities at once, you're not focusing on five things — you're rapidly switching between them, losing efficiency with every switch, and making meaningful progress on none."
          }
        ]
      },
      {
        "title": "How to build your priority stack",
        "content": [
          {
            "type": "prose",
            "html": "A priority stack is a ranked list of the areas that get your concentrated energy during this installation period. Not all the areas of your life. Not everything that matters. Just the 3 areas where focused effort right now would create the biggest positive impact on your direction."
          },
          {
            "type": "prose",
            "html": "<strong>Step 1: List your life domains.</strong> Write down every area of your life that competes for your attention. Be comprehensive. Most people have 6–10: career/work, health/fitness, relationships, finances, personal development, creative projects, education, social life, family, spirituality, hobbies. Get them all on paper."
          },
          {
            "type": "callout",
            "html": "<p><strong>The maintenance list is not a failure.</strong> Putting an area on maintenance doesn't mean you're abandoning it. It means you're handling it — keeping it functional — without investing concentrated creative energy in it during this period. Your health doesn't need to be a top-3 priority if your basic habits are already working. Your finances don't need concentrated attention if they're stable. The maintenance list is permission to stop trying to advance everything simultaneously.</p>"
          }
        ]
      },
      {
        "title": "The 3-priority filter",
        "content": [
          {
            "type": "prose",
            "html": "Once your priorities are defined, they become a decision-making tool. Every request, opportunity, and decision that comes your way gets filtered through a simple question: <strong>does this serve my top 3 priorities?</strong>"
          },
          {
            "type": "prose",
            "html": "If yes, consider it. If no, decline it or defer it. This sounds simple, and it is — but it requires practice, because most people are conditioned to say yes by default. They accept meetings, take on projects, agree to social commitments, and volunteer for things that have nothing to do with their actual priorities — because saying no feels uncomfortable."
          },
          {
            "type": "example",
            "variant": "weak",
            "tag": "No filter",
            "quote": "\"I'm trying to get in shape, grow my career, learn a new language, fix my sleep schedule, start a side project, read more books, and spend more time with family — all at once.\"",
            "note": "Seven active priorities means zero concentrated energy on any of them. This person will be in the same position in 6 months, frustrated by lack of progress on everything."
          },
          {
            "type": "example",
            "variant": "strong",
            "tag": "Focused stack",
            "quote": "\"My top 3 for the next 14 days: (1) Career — complete the project milestone by Day 18. (2) Health — train 4x/week and meal prep Sundays. (3) Personal development — follow the Structured Achievement system with 100% consistency. Everything else is on maintenance.\"",
            "note": "Three priorities, each with a clear outcome. This person will make visible, measurable progress on all three because their energy is concentrated."
          }
        ]
      }
    ],
    "appCard": {
      "label": "Update Your Goals",
      "description": "Add your <strong>top 3 priority outcomes</strong> to the Goals section of the tracker.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "List all your life domains",
        "description": "Write down every area of your life that competes for attention and energy. Be comprehensive — most people have 6–10 domains. Include everything from career to relationships to personal projects to health."
      },
      {
        "name": "Choose your top 3 active priorities",
        "description": "Which 3 areas would create the most meaningful impact on your direction if you focused on them for the next 14 days? Rank them 1–2–3. This is not about what's most important in general — it's about where concentrated effort right now would produce the biggest result."
      },
      {
        "name": "Define one clear outcome for each priority",
        "description": "For each of your top 3, write one specific, observable outcome you're working toward by Day 21. Not a feeling — a result. Not a direction — a destination. Something you can look at on Day 21 and clearly say: I did this, or I didn't.",
        "hint": "\"Exercise 4x/week for the next 14 days\" not \"get healthier.\""
      },
      {
        "name": "Write your \"not now\" list",
        "description": "Everything that didn't make the top 3 goes here. Write each one down explicitly. This isn't abandonment — it's intentional deferral. Give your brain permission to stop worrying about these areas during the installation period."
      },
      {
        "name": "Test your priorities against your identity",
        "description": "Read your identity statement, then your top 3 priorities. Does the person described in your identity naturally focus on these areas? If there's a disconnect, adjust until they align."
      },
      {
        "name": "Add your priority outcomes to the app",
        "description": "Open <strong>Goals</strong> and add your three specific priority outcomes. Your Goals section now holds your complete strategic layer: direction, identity, and priority targets. This is the reference point for every weekly review."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 10.",
    "closingParagraphs": [
      "You now have direction, identity, and a focused priority stack. These three together form the strategic core of your operating system. They answer the three most important questions: where am I going, who am I being, and what deserves my concentrated energy?"
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 10",
      "title": "Install your core habits"
    }
  },
  {
    "day": 10,
    "title": "Install Your Core Habits",
    "phaseLabel": "Phase II — Reconstruct",
    "phase": 2,
    "heroTitle": "Install Your\nCore Habits",
    "heroIntro": "You know who you are, what you're focused on, and what your priorities demand. Now you build the specific habits that turn all of it into daily action — the behavioral machinery that executes your strategy automatically.",
    "principleLabel": "The Law of Practice",
    "principleParagraphs": [
      "Any thought, feeling, or behavior that you repeat often enough eventually becomes automatic. It requires no further effort, no conscious decision, and no willpower. It simply runs."
    ],
    "sections": [
      {
        "title": "From non-negotiables to keystone habits",
        "content": [
          {
            "type": "prose",
            "html": "On Day 4, you set non-negotiables — the minimum behaviors that keep your system alive on bad days. Those are your floor. Today, you go higher. You're designing 2–3 keystone habits that actively <em>drive progress</em> on your top priorities."
          },
          {
            "type": "prose",
            "html": "A keystone habit is one that creates a chain reaction. When you do it, other positive behaviors follow naturally — not because you planned them, but because the keystone habit shifts your state, your momentum, or your environment in a way that makes the next good choice easier."
          }
        ]
      },
      {
        "title": "The habit installation formula",
        "content": [
          {
            "type": "prose",
            "html": "Understanding habit mechanics is the difference between habits that stick and habits that fade within a week. Every habit — whether you designed it or not — operates on the same three-part loop."
          },
          {
            "type": "prose",
            "html": "<strong>Cue</strong> — the trigger that initiates the behavior. This can be a time (\"after I wake up\"), a location (\"when I sit at my desk\"), a preceding action (\"after I finish my morning coffee\"), or an emotional state (\"when I feel the urge to procrastinate\"). The more specific the cue, the more automatic the habit becomes. Vague cues produce vague habits."
          },
          {
            "type": "callout",
            "html": "<p><strong>The installation principle:</strong> A habit isn't installed until you've done it consistently for at least 14–21 days. Before that, it's just an intention. The first 7 days require conscious effort. Days 8–14 require less effort but still need attention. By Day 15–21, the habit begins to feel automatic. Don't judge a new habit until you've given it at least two weeks. Most people abandon habits during the \"effort\" phase — before they've had a chance to become automatic.</p>"
          },
          {
            "type": "example",
            "variant": "weak",
            "tag": "Vague intention",
            "quote": "\"I'm going to start exercising more and reading every day.\"",
            "note": "No cue. No specific routine. No reward structure. \"More\" and \"every day\" give the brain nothing to automate. This will last 3–4 days before being forgotten."
          },
          {
            "type": "example",
            "variant": "strong",
            "tag": "Installed habit",
            "quote": "\"After my morning sequence (cue), I do a 20-minute workout (routine), then log it in my tracker (reward). After my evening close-out (cue), I read for 15 minutes (routine), then mark the day complete in my tracker (reward).\"",
            "note": "Specific cues linked to existing behaviors. Small, achievable routines. Built-in rewards through tracking. This is a system, not a wish."
          }
        ]
      },
      {
        "title": "Choosing the right keystone habits",
        "content": [
          {
            "type": "prose",
            "html": "Not all habits are equally valuable. You're looking for the ones that connect directly to your top 3 priorities and create the strongest cascade of positive behavior."
          },
          {
            "type": "prose",
            "html": "For each of your priorities, ask: <strong>what is the one daily behavior that, if done consistently, would make the biggest difference?</strong> That's your candidate keystone habit. For a career priority, it might be \"60 minutes of deep work on my most important project before checking email.\" For a health priority, it might be \"20-minute workout before 8 AM.\" For a personal development priority, it might be \"15 minutes of focused learning during lunch.\""
          }
        ]
      }
    ],
    "appCard": {
      "label": "Set Up Your Habits",
      "description": "Open the <strong>Habits</strong> feature and add your keystone habits with their cue-routine-reward formulas.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Identify 2–3 keystone habits tied to your priorities",
        "description": "For each of your top 3 priorities, identify the single daily behavior that would drive the most progress. Select the 2–3 that feel most impactful. These become your keystone habits."
      },
      {
        "name": "Design each habit using cue-routine-reward",
        "description": "For each keystone habit, write the complete formula: \"After [specific cue], I [specific routine], then [specific reward].\" Be precise. The more specific the cue, the more automatic the habit becomes.",
        "hint": "Stack onto existing anchors: morning sequence, core block, or evening close-out."
      },
      {
        "name": "Keep every routine under 30 minutes",
        "description": "If any routine feels long or ambitious, shrink it. A 15-minute routine you do every day for 14 days produces more results than a 60-minute routine you do 3 times and abandon. Consistency first. Scale later."
      },
      {
        "name": "Add your keystone habits to the tracker",
        "description": "Open the <strong>Habits</strong> section in the app and add each keystone habit. Include the cue-routine-reward formula in the description so you see it every time. From today, you're tracking both Tasks (non-negotiables) and Habits (growth engine). The Dashboard will show both."
      },
      {
        "name": "Run your first keystone habit today",
        "description": "Don't wait until tomorrow. Pick one of your new habits and do it today, using the exact cue-routine-reward formula you designed. The first repetition is the most important one — it transforms the habit from an idea into an action."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 11.",
    "closingParagraphs": [
      "You've now bridged the gap between strategy and execution. Your system has a strategic layer — direction, identity, priorities — and an operational layer — structure, non-negotiables, keystone habits, tracking. The two layers are connected: the strategy determines what the operations focus on, and the operations produce the results that validate the strategy."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 11",
      "title": "Manage your energy"
    }
  },
  {
    "day": 11,
    "title": "Manage Your Energy",
    "phaseLabel": "Phase II — Reconstruct",
    "phase": 2,
    "heroTitle": "Manage\nYour Energy",
    "heroIntro": "You have a system, habits, and priorities. But none of it runs without fuel. Today you learn to work with your natural energy cycles instead of fighting against them — because effort without energy management is just burnout with better intentions.",
    "principleLabel": "The Law of Applied Effort",
    "principleParagraphs": [
      "All meaningful achievement requires the sustained application of effort in a concentrated direction. But the law has a qualifier most people miss: <em>sustained</em>. Not explosive. Not heroic. Sustained."
    ],
    "sections": [
      {
        "title": "The energy multiplier",
        "content": [
          {
            "type": "prose",
            "html": "Most productivity systems focus exclusively on time management — scheduling tasks, blocking calendars, optimizing workflows. But time is only half the equation. The same task takes dramatically different amounts of time and produces dramatically different quality depending on your energy level when you do it."
          },
          {
            "type": "prose",
            "html": "Consider a task like writing a report or solving a complex problem. At peak energy — when your mind is sharp, your focus is clear, and your cognitive reserves are full — you might complete it in 90 minutes with excellent quality. At low energy — after a heavy lunch, during an afternoon slump, or at the end of an exhausting day — the same task might take 3 hours and produce mediocre output."
          }
        ]
      },
      {
        "title": "Understanding your energy cycle",
        "content": [
          {
            "type": "prose",
            "html": "Most people have 2–3 peak energy windows during the day and 1–2 low-energy valleys. The specific pattern varies by person — it depends on your sleep quality, chronotype (whether you're naturally a morning person or night person), diet, exercise habits, and stress levels."
          },
          {
            "type": "prose",
            "html": "<strong>Peak windows</strong> are your golden hours. This is when your prefrontal cortex — the part of your brain responsible for complex thinking, decision-making, and creative work — is functioning at its highest level. Your most demanding work belongs here: deep thinking, strategic planning, creative projects, critical decisions, anything requiring sustained concentration."
          },
          {
            "type": "callout",
            "html": "<p><strong>The caffeine trap:</strong> Many people use caffeine to override their energy valleys. This works short-term but creates a cycle of artificial peaks followed by deeper crashes. If you're relying on caffeine to get through your afternoon, the real issue isn't lack of energy — it's misalignment between your tasks and your natural cycle. The solution isn't more stimulants. It's better scheduling.</p>"
          }
        ]
      },
      {
        "title": "Mapping your personal pattern",
        "content": [
          {
            "type": "prose",
            "html": "Your energy pattern is unique. Morning larks hit peak cognitive performance within an hour of waking and crash after lunch. Night owls don't reach peak until late morning or afternoon and hit their creative stride in the evening. Most people fall somewhere in between."
          },
          {
            "type": "prose",
            "html": "To map your pattern, you don't need a scientific study. You need honest observation. Think about the past week: When did you feel most alert and capable? When did you feel foggy or distracted? When did ideas flow? When did everything feel like effort?"
          }
        ]
      }
    ],
    "appCard": {
      "label": "Check Your Dashboard",
      "description": "Review your <strong>streaks</strong> and completion patterns to identify energy-related trends.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Map your energy pattern",
        "description": "Sketch a rough energy curve for a typical day. Mark your peak windows (sharpest focus), mid-energy windows (capable but not peak), and valleys (foggy, low willpower). Use your tracker notes from past days for real data rather than guessing.",
        "hint": "Simple format: Morning 6-9: __, 9-12: __, Afternoon 12-3: __, 3-6: __, Evening 6-9: __, 9+: __"
      },
      {
        "name": "Align your structure to your energy",
        "description": "Compare your Day 2 daily structure to your energy map. Is your core execution block during a peak window? If not, adjust it. Move your most cognitively demanding work to your highest-energy hours and routine tasks to mid-energy windows."
      },
      {
        "name": "Build one recovery point into your day",
        "description": "Add a specific time for genuine recovery — not phone scrolling or passive entertainment. A walk, quiet time, a nap, or a screen-free meal. Make it a fixed element in your structure, not an optional luxury."
      },
      {
        "name": "Identify your #1 energy leak",
        "description": "What single habit, pattern, or commitment costs you the most energy relative to what it returns? Name it specifically. This could be poor sleep, a draining commitment, a digital habit, or a relationship. You identified drains on Day 3 — revisit with 11 days of new data."
      },
      {
        "name": "Assess your sleep",
        "description": "How many hours of sleep did you average this past week? If it's consistently under 7, this is your highest-priority adjustment. Write down a specific lights-out time that gives you 7–8 hours and commit to it for the next 10 days."
      },
      {
        "name": "Journal your energy map",
        "description": "Open <strong>Journal</strong> and write your energy map — peak windows, mid-energy windows, and valleys. Include how you plan to realign your daily structure. Having this in the app means you can reference it during every weekly review."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 12.",
    "closingParagraphs": [
      "Energy is the multiplier that makes everything else in your system more effective. The same structure, habits, and priorities — performed at the right energy levels — produce dramatically better results with less strain."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 12",
      "title": "Eliminate and simplify"
    }
  },
  {
    "day": 12,
    "title": "Eliminate and Simplify",
    "phaseLabel": "Phase II — Reconstruct",
    "phase": 2,
    "heroTitle": "Eliminate\nand Simplify",
    "heroIntro": "You've been building for 11 days — adding components, installing habits, expanding your system. Today you do the opposite. You strip everything back to what actually works and remove everything that doesn't earn its place.",
    "principleLabel": "The Law of Forced Efficiency",
    "principleParagraphs": [
      "There is never enough time to do everything, but there is always enough time to do the most important thing. When you accept this fully, you stop trying to fit everything in and start making hard choices about what truly deserves your energy."
    ],
    "sections": [
      {
        "title": "The complexity trap",
        "content": [
          {
            "type": "prose",
            "html": "There's a natural tendency in any building process to keep adding. More habits. More commitments. More structure. More tracking. Each addition seems reasonable in isolation. But collectively, they create a system that's heavy, fragile, and exhausting to maintain."
          },
          {
            "type": "prose",
            "html": "Think about where you are right now. Over 11 days, you've installed: a direction statement, daily indicators, a three-anchor structure, pattern awareness, non-negotiables, a tracker, environmental changes, an identity statement, a priority stack, keystone habits, and energy management. That's substantial infrastructure."
          }
        ]
      },
      {
        "title": "The friction audit",
        "content": [
          {
            "type": "prose",
            "html": "Go through every component you've built and ask three questions:"
          },
          {
            "type": "prose",
            "html": "<strong>Is it active?</strong> Am I actually doing this daily, or has it become something I think about but don't execute? A component that exists in theory but not in practice is dead weight. Either recommit or remove it. Carrying dead commitments is worse than having fewer commitments — the dead ones create guilt without producing results."
          },
          {
            "type": "callout",
            "html": "<p><strong>The 80/20 of your system:</strong> Roughly 20% of the components you've built are producing 80% of the results. Your job today is to identify which 20% is doing the heavy lifting — and seriously question whether the other 80% is earning its place or just adding noise.</p>"
          }
        ]
      },
      {
        "title": "The one-page test",
        "content": [
          {
            "type": "prose",
            "html": "After today's audit, your entire active system should fit on one page. Not a dense, tiny-font page — a readable, clear page. Direction statement. Identity statement. Top 3 priorities. Daily structure. Non-negotiables. Keystone habits. Energy alignment."
          },
          {
            "type": "prose",
            "html": "If you look at that page and feel calm clarity, the system is right. If you look at it and feel overwhelmed, keep simplifying. The system should feel like a tool that serves you — not a second job that demands your attention."
          },
          {
            "type": "example",
            "variant": "weak",
            "tag": "Over-engineered",
            "quote": "\"I have 7 non-negotiables, 4 keystone habits, a 90-minute morning routine, 5 active priorities, and I'm tracking 12 different metrics daily. I spend 20 minutes each evening just logging everything.\"",
            "note": "This system is working against itself. The maintenance cost is too high. Tracking has become a task rather than a tool. Simplify aggressively."
          },
          {
            "type": "example",
            "variant": "strong",
            "tag": "Lean and effective",
            "quote": "\"3 non-negotiables, 2 keystone habits, a 20-minute morning sequence, 3 priorities, 2-minute evening log. Everything fits on one page. I never feel overwhelmed by the system itself.\"",
            "note": "Lean enough to maintain indefinitely. Simple enough that the system disappears into the background and the work takes center stage."
          }
        ]
      }
    ],
    "appCard": {
      "label": "Clean Up the Tracker",
      "description": "Remove or simplify <strong>Tasks</strong> and <strong>Habits</strong> that didn't earn their place.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Audit your non-negotiables",
        "description": "Look at your Day 4 list and your tracker data. Which ones are you hitting consistently? Which are you missing? Drop or simplify any that aren't sticking. Better to have 3 you complete daily than 5 you complete sometimes."
      },
      {
        "name": "Audit your keystone habits",
        "description": "Review the habits from Day 10. Keep the ones driving real results. Pause any that feel forced or aren't connecting to your priorities. You can always reinstall them later — but right now, only what works stays."
      },
      {
        "name": "Audit your daily structure",
        "description": "Is your Day 2 framework still realistic given what you now know about your energy (Day 11) and your actual patterns? Adjust timing, simplify routines, remove any structural elements that consistently fail."
      },
      {
        "name": "Create your one-page system overview",
        "description": "Write a clean, updated summary of everything currently active: direction, identity, top 3 priorities, daily structure, non-negotiables, keystone habits, energy notes. If it doesn't fit on one page, simplify further."
      },
      {
        "name": "Identify what you're eliminating and why",
        "description": "For everything you're cutting, write one sentence about why. This prevents you from second-guessing the decision later and creates a record of your engineering process."
      },
      {
        "name": "Audit and clean up the app",
        "description": "Open the tracker and go through your <strong>Tasks</strong>, <strong>Habits</strong>, and <strong>Goals</strong>. Remove anything you're eliminating today. Simplify anything that's staying. When you're done, every item in the app should be something you're actively doing — no dead weight."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 13.",
    "closingParagraphs": [
      "Your system should feel lighter now. Not weaker — leaner. Every component that remains has earned its place through 12 days of real use and honest evaluation."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 13",
      "title": "Build your decision framework"
    }
  },
  {
    "day": 13,
    "title": "Build Your Decision Framework",
    "phaseLabel": "Phase II — Reconstruct",
    "phase": 2,
    "heroTitle": "Build Your\nDecision Framework",
    "heroIntro": "One of the biggest drains on your energy and focus isn't bad decisions — it's unmade ones. The same choices recycling through your mind every day, never fully resolved. Today you create rules that decide for you, freeing your brain for the decisions that actually matter.",
    "principleLabel": "The Law of Determination",
    "principleParagraphs": [
      "Decisiveness is a characteristic of all high-performing men and women. Almost any decision is better than no decision at all. The habit of making decisions quickly and changing them slowly is a hallmark of people who achieve extraordinary things."
    ],
    "sections": [
      {
        "title": "The hidden cost of decisions",
        "content": [
          {
            "type": "prose",
            "html": "Every decision you make — no matter how small — costs cognitive energy. What to eat for breakfast. When to check email. Whether to accept a meeting request. How to respond to a message. Whether to work out now or later. What to work on first."
          },
          {
            "type": "prose",
            "html": "Each of these seems trivial. But research on decision fatigue shows that the cumulative cost is enormous. By mid-afternoon, most people have made hundreds of micro-decisions and have significantly depleted their cognitive resources. The quality of their decisions drops. Their willpower weakens. They default to whatever is easiest rather than whatever is best."
          }
        ]
      },
      {
        "title": "Types of decision rules",
        "content": [
          {
            "type": "prose",
            "html": "A decision rule is a pre-made choice for a situation that comes up regularly. It removes deliberation and replaces it with a clear, automatic response. There are three categories:"
          },
          {
            "type": "prose",
            "html": "<strong>Time rules</strong> govern when things happen. \"I never schedule meetings before 11 AM.\" \"I check email twice a day — noon and 5 PM.\" \"I stop working by 9 PM, no exceptions.\" These rules protect your time by eliminating the daily negotiation about how to spend it."
          },
          {
            "type": "callout",
            "html": "<p><strong>Why the best rules feel boring:</strong> Effective decision rules are not exciting. \"I eat the same lunch every workday\" sounds monotonous. But that monotony is the point — every decision you automate is one less decision competing for your limited cognitive resources. Steve Jobs wore the same outfit every day not because he lacked style, but because he understood that decision energy spent on clothing was decision energy unavailable for Apple. The principle scales to everything.</p>"
          }
        ]
      },
      {
        "title": "If-then rules for your weak points",
        "content": [
          {
            "type": "prose",
            "html": "The most powerful decision rules are \"if-then\" statements that specifically address your known vulnerabilities. You mapped these on Day 3 — your default patterns. Now you can create automatic responses that override them."
          },
          {
            "type": "prose",
            "html": "The format is simple: <strong>\"If [trigger situation], then [predetermined response].\"</strong>"
          }
        ]
      }
    ],
    "appCard": {
      "label": "Log Your Decision Rules",
      "description": "Write your decision rules and if-then protocols in the <strong>Journal</strong> for easy reference.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Identify your top 5 recurring decisions",
        "description": "What choices do you face repeatedly — daily or weekly — that consume energy through deliberation? List them. These might include: what to eat, when to exercise, whether to check your phone, how to respond to requests, what to work on first."
      },
      {
        "name": "Create a rule for each one",
        "description": "For each recurring decision, write a clear rule that eliminates the deliberation. Keep it simple and absolute. The less ambiguity, the more automatic it becomes."
      },
      {
        "name": "Write 3-5 if-then rules for your weak points",
        "description": "Revisit your Day 3 defaults. For each pattern that still shows up, create an if-then rule: 'If [trigger], then [response].' Focus on the situations where you're most likely to fall back into old patterns.",
        "hint": "\"If I feel like checking social media during core block, then I note the urge and return to my task.\""
      },
      {
        "name": "Test one rule today",
        "description": "Choose the rule that addresses your most frequent recurring decision. Apply it today. Notice how it feels to not deliberate — to simply execute the rule. The initial discomfort is normal. The energy savings are immediate."
      },
      {
        "name": "Add your rules to your system overview",
        "description": "Decision rules are now part of your operating manual. Add them to the one-page overview from Day 12. They sit alongside your structure, non-negotiables, and habits as part of your daily operating infrastructure."
      },
      {
        "name": "Record your rules in the app",
        "description": "Open <strong>Journal</strong> and write a dedicated entry with your decision rules and if-then statements. Title it \"Decision Rules\" so you can find it quickly. When you're in a situation covered by a rule, you want to reference it in seconds, not search through notes."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 14.",
    "closingParagraphs": [
      "You've just eliminated dozens of future energy drains. Every decision rule you created today is one less negotiation with yourself tomorrow, next week, and next month."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 14",
      "title": "Midpoint recalibration"
    }
  },
  {
    "day": 14,
    "title": "Midpoint Recalibration",
    "phaseLabel": "Phase II — Reconstruct",
    "phase": 2,
    "heroTitle": "Midpoint\nRecalibration",
    "heroIntro": "Fourteen days in. Halfway through the installation. Today you take the most honest look yet at where you are — what's holding, what's drifting, and what needs to change before the final phase locks everything in for the long term.",
    "principleLabel": "The Law of Flexibility",
    "principleParagraphs": [
      "Success requires the flexibility to adapt your approach while keeping your goal constant. The direction stays fixed. The methods evolve based on feedback, experience, and changing conditions."
    ],
    "sections": [
      {
        "title": "Why this review is deeper than Day 7",
        "content": [
          {
            "type": "prose",
            "html": "Your Day 7 review was a quick pulse check on Phase I — a first look at basic consistency. This one goes deeper because you have more to assess and more experience to draw from."
          },
          {
            "type": "prose",
            "html": "Over the past two weeks, you've built and tested: direction, structure, defaults awareness, non-negotiables, tracking, environment, identity, priorities, habits, energy management, simplification, and decision rules. That's twelve distinct components. Some are working well. Some may need significant adjustment. And some may need to be redesigned entirely."
          }
        ]
      },
      {
        "title": "The data tells the truth",
        "content": [
          {
            "type": "prose",
            "html": "Open your tracker. Look at the full record from Day 5 through today — nine or ten logged days. This data is more valuable than any self-assessment because it shows patterns you might not feel. Patterns like:"
          },
          {
            "type": "prose",
            "html": "Are there specific days of the week where your non-negotiable completion drops? That reveals structural vulnerabilities tied to your schedule."
          }
        ]
      },
      {
        "title": "Component-by-component assessment",
        "content": [
          {
            "type": "prose",
            "html": "Work through each major component and evaluate honestly:"
          },
          {
            "type": "prose",
            "html": "<strong>Direction statement.</strong> Read it out loud. Is it still the right target? Has your understanding of what you want deepened or shifted? After 14 days of real experience, you know more about what actually drives you than you did on Day 1. Update if needed — this is healthy evolution, not failure."
          },
          {
            "type": "callout",
            "html": "<p><strong>The recalibration rule:</strong> Change no more than 2–3 things. The goal is targeted adjustment, not a system overhaul. If you change everything, you lose the data comparison. If you change nothing despite clear problems, you're being rigid instead of disciplined. Find the 2–3 adjustments that would produce the biggest improvement and make those only.</p>"
          }
        ]
      }
    ],
    "appCard": {
      "label": "Full Dashboard Review",
      "description": "Open the <strong>Dashboard</strong> for your midpoint assessment. 10 days of tracked data tells the real story.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Review your full tracker data",
        "description": "Open the <strong>Dashboard</strong> and study your full data set from Day 5 through today. Look at Task completion rates, Habit consistency, and your streak history. Calculate your overall percentages. The Dashboard shows the real story of your past 10 days — not the story your feelings tell."
      },
      {
        "name": "Reassess your direction and identity statements",
        "description": "Read both out loud. Update either one based on what you've learned over 14 days. The direction can sharpen. The identity can become more grounded. Both should feel truer now than they did when you wrote them."
      },
      {
        "name": "Do a full system audit",
        "description": "List every active component: structure, non-negotiables, habits, decision rules, priorities. For each one, mark: keep as-is, adjust (and how), or remove. Then make the changes."
      },
      {
        "name": "Identify your 2-3 targeted adjustments",
        "description": "Based on the audit, what are the 2-3 changes that would produce the biggest improvement going into Phase III? Write them down clearly with specific implementation plans."
      },
      {
        "name": "Write your midpoint status report",
        "description": "Open <strong>Journal</strong> and write your midpoint status report. Reference specific numbers from the Dashboard: Task completion rate, longest streak, Habit consistency. Compare to your Day 7 journal entry. This is your most data-rich assessment yet."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 15.",
    "closingParagraphs": [
      "Phase II is complete. Over the past week, you rebuilt your operating system from the inside out — identity, priorities, habits, energy, simplification, decision-making, and now a thorough recalibration. The system is no longer being held together by effort alone. It has real architecture."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 15",
      "title": "Build your accountability layer"
    }
  },
  {
    "day": 15,
    "title": "Build Your Accountability Layer",
    "phaseLabel": "Phase III — Install",
    "phase": 3,
    "heroTitle": "Build Your\nAccountability Layer",
    "heroIntro": "Your system works when conditions are good and motivation is high. The real question is: what keeps it running when they're not? Today you build the accountability structure that makes quitting harder than continuing.",
    "principleLabel": "The Law of Responsibility",
    "principleParagraphs": [
      "You are fully responsible for everything you are, everything you have, and everything you become. No one is coming to rescue you. No external force will make your system work for you. This is the most confronting — and most empowering — truth in the psychology of achievement."
    ],
    "sections": [
      {
        "title": "Why willpower always has an expiration date",
        "content": [
          {
            "type": "prose",
            "html": "If your system relies on willpower to run, it will eventually fail. This isn't pessimism — it's physiology. Willpower is a depletable resource. It's highest in the morning and lowest in the evening. It weakens under stress, fatigue, illness, and emotional turbulence. It erodes gradually over days and weeks of sustained demand."
          },
          {
            "type": "prose",
            "html": "The people who look disciplined from the outside aren't running on willpower. They've built structures — environments, commitments, and social contracts — that make the right behavior the default behavior. They don't resist temptation better than you. <strong>They've engineered their lives so they face less temptation.</strong>"
          }
        ]
      },
      {
        "title": "Four levels of accountability",
        "content": [
          {
            "type": "prose",
            "html": "Accountability exists on a spectrum from private to public, from gentle to consequential. You should use at least two levels simultaneously for maximum effect."
          },
          {
            "type": "prose",
            "html": "<strong>Level 1: Self-accountability.</strong> Your tracker, your reviews, your system overview. This is your baseline — you've been building it since Day 1. Self-accountability works well for people with strong internal motivation, but it has a weakness: you can negotiate with yourself. You can rationalize a missed day. You can lower the bar without anyone noticing. That's why it works best when paired with at least one external layer."
          },
          {
            "type": "callout",
            "html": "<p><strong>The optimal combination:</strong> Self-accountability (always on) + one social or public layer + optional consequence layer for your most critical commitments. This creates redundancy — if one layer weakens, the others hold. Most people find that self-tracking plus one accountability partner is enough to maintain 90%+ consistency.</p>"
          }
        ]
      },
      {
        "title": "Designing your failure protocol",
        "content": [
          {
            "type": "prose",
            "html": "Accountability isn't just about preventing failure — it's about managing it. You will miss a day. Everyone does. The question isn't whether you'll break the streak — it's whether a single break becomes a collapse."
          },
          {
            "type": "prose",
            "html": "Most people, when they miss a day, enter a shame spiral. \"I missed yesterday, so what's the point? I'll start again Monday. Actually, next month.\" One missed day becomes a week. A week becomes a month. The system is abandoned not because of the miss, but because of the story about the miss."
          }
        ]
      }
    ],
    "appCard": {
      "label": "Track Your Streaks",
      "description": "Your <strong>streaks</strong> are your accountability made visible. Check them daily — they're harder to break than to maintain.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Choose at least 2 accountability layers",
        "description": "Self-accountability through the tracker is already in place. Add at least one external layer. Social (tell someone and set up weekly check-ins), public (make a visible commitment), or consequence-based (define real stakes). Choose what fits your personality and situation."
      },
      {
        "name": "Set up your external accountability today",
        "description": "If social: message or call that person today. Tell them what you're doing and ask if they'll check in with you weekly. If public: write and post your commitment. If consequence-based: define the specific consequence and write it down. Don't delay — the setup itself is the first act of accountability."
      },
      {
        "name": "Design your failure protocol",
        "description": "Write a specific rule: 'If I miss a day, I [exact recovery action] the next morning.' Make it concrete, immediate, and non-negotiable. The key rule: never miss twice in a row."
      },
      {
        "name": "Review your tracker streak",
        "description": "Open the Dashboard and look at your <strong>streaks</strong>. How many consecutive days of completed Tasks? How about Habits? Streaks are accountability made visible — each day you maintain one, the cost of breaking it grows. Use this data to inform which additional accountability layers you need."
      },
      {
        "name": "Activate today",
        "description": "Whatever accountability layers you chose, activate them now. Not tomorrow. Not after you've 'prepared.' The activation itself is the commitment. Telling your accountability partner today is more powerful than planning to tell them next week."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 16.",
    "closingParagraphs": [
      "Your system now has structural support beyond your own willpower. On strong days, you won't need it. On weak days — the days that determine whether a system survives or dies — the accountability layer holds you in place when motivation can't."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 16",
      "title": "Stress-proof your system"
    }
  },
  {
    "day": 16,
    "title": "Stress-Proof Your System",
    "phaseLabel": "Phase III — Install",
    "phase": 3,
    "heroTitle": "Stress-Proof\nYour System",
    "heroIntro": "Everything works when conditions are favorable. The true test of a system is whether it survives when conditions are terrible. Today you design for the worst — not out of pessimism, but because every system that lasts has a contingency plan.",
    "principleLabel": "The Law of Persistence",
    "principleParagraphs": [
      "The willingness to persist in the face of adversity is the one quality that, more than anything else, guarantees eventual success. Not talent. Not intelligence. Not resources. Persistence."
    ],
    "sections": [
      {
        "title": "Where systems actually break",
        "content": [
          {
            "type": "prose",
            "html": "Systems don't fail during good days. They fail at predictable stress points — moments you can identify and plan for in advance. These typically include:"
          },
          {
            "type": "prose",
            "html": "<strong>Travel days.</strong> Your structure, environment, and routine are all disrupted simultaneously. The morning sequence happens in a hotel. The core execution block competes with airports, meetings, and unfamiliar environments. The evening close-out gets lost in exhaustion."
          }
        ]
      },
      {
        "title": "The minimum viable day",
        "content": [
          {
            "type": "prose",
            "html": "Your minimum viable day is the absolute simplest version of your system — the stripped-down protocol that keeps the streak alive and maintains your identity as someone who follows through. It's not your ideal day. It's your floor. The version that says: <em>even today, I operated.</em>"
          },
          {
            "type": "prose",
            "html": "A good minimum viable day has 2–3 actions that take no more than 15–20 minutes total. It should be so simple that there is genuinely no valid excuse not to do it. Sick in bed? You can still do it. Stuck in an airport? You can still do it. Having the worst day of your month? You can still do it."
          },
          {
            "type": "example",
            "variant": "weak",
            "tag": "No plan for bad days",
            "quote": "\"If I'm having a bad day, I'll try to do my normal routine as best I can, and if I can't, I'll just start fresh tomorrow.\"",
            "note": "\"Try my best\" is not a plan. \"Start fresh tomorrow\" is the beginning of abandonment. This is how systems die — not from one bad day, but from the gap that opens after it."
          },
          {
            "type": "example",
            "variant": "strong",
            "tag": "Minimum viable day",
            "quote": "\"Bad day protocol: Read my direction statement (2 minutes). Complete one task from my priority list — even a small one (10 minutes). Log in the tracker with a note: 'MVD — [reason]' (2 minutes). Total: 15 minutes. The streak survives.\"",
            "note": "Simple. Fast. Doable in any condition. Maintains identity, accountability, and forward motion. The difference between this and nothing is the difference between a system that persists and one that collapses."
          }
        ]
      },
      {
        "title": "The restart protocol",
        "content": [
          {
            "type": "prose",
            "html": "Despite your best design, there will come a day — maybe not this month, but eventually — when you miss entirely. Zero execution. The minimum viable day didn't happen. The tracker shows a gap."
          },
          {
            "type": "prose",
            "html": "What happens next determines everything. Without a restart protocol, the gap triggers the shame spiral: \"I missed a day → I'm failing → What's the point → I'll restart when I feel ready.\" This spiral has killed more systems than any external disruption."
          }
        ]
      }
    ],
    "appCard": {
      "label": "Log Your Protocols",
      "description": "Add your minimum viable day and restart protocol to the <strong>Journal</strong> for emergency access.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Design your minimum viable day",
        "description": "Write down 2–3 actions that take 15–20 minutes total and are doable in any condition — sick, traveling, exhausted, emotionally drained. At minimum: read your direction in <strong>Goals</strong>, complete one small <strong>Task</strong>, and log in the <strong>Journal</strong>. The app stays open even on your worst day."
      },
      {
        "name": "Define your trigger conditions",
        "description": "When does the minimum viable day activate instead of your normal routine? Write specific scenarios: 'If I'm sick... If I'm traveling... If my schedule gets completely disrupted... If I'm emotionally overwhelmed...'",
        "hint": "Be specific. Vague triggers lead to vague execution."
      },
      {
        "name": "Write your restart protocol",
        "description": "A 3-step morning routine for the day after a total miss: Acknowledge (one sentence about what happened), Reset (full morning sequence), Log (open the app and write a <strong>Journal</strong> entry noting the miss and the reason, then complete your <strong>Tasks</strong> as normal). Write it down and add it to your system overview."
      },
      {
        "name": "Set the 'never miss twice' rule",
        "description": "This is your ultimate non-negotiable. After any miss — whether partial or complete — the next day is a full execution day. No exceptions. No 'easing back in.' Write this rule and commit to it."
      },
      {
        "name": "Mentally rehearse a bad day",
        "description": "Pick a realistic stress scenario (travel, illness, schedule explosion). Walk through exactly how you'd execute the minimum viable day in that situation. Step by step. The mental rehearsal makes the real execution faster when you need it."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 17.",
    "closingParagraphs": [
      "Your system now has a contingency layer. Good days get your full structure, habits, and energy alignment. Bad days get the minimum viable version. Total misses trigger the restart protocol. In every scenario, the system has a response."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 17",
      "title": "Master your internal dialogue"
    }
  },
  {
    "day": 17,
    "title": "Master Your Internal Dialogue",
    "phaseLabel": "Phase III — Install",
    "phase": 3,
    "heroTitle": "Master Your\nInternal Dialogue",
    "heroIntro": "Your system is built, tracked, stress-proofed, and accountable. But there's one variable that can override all of it — the voice inside your head. The stories you tell yourself about who you are, what's possible, and whether this is working. Today you learn to manage that voice.",
    "principleLabel": "The Law of Subconscious Activity",
    "principleParagraphs": [
      "Your subconscious mind makes your words and actions fit a pattern consistent with your self-concept and your deepest beliefs about yourself. It operates continuously, below the level of awareness, shaping your behavior to match the story you're telling yourself."
    ],
    "sections": [
      {
        "title": "The narrator runs the show",
        "content": [
          {
            "type": "prose",
            "html": "There's a voice in your head that narrates everything you do. It runs commentary on your performance, your potential, your past, and your future. It tells you whether you can or can't. Whether this is working or pointless. Whether you deserve what you're building or whether you'll fail like you \"always\" do."
          },
          {
            "type": "prose",
            "html": "Most people don't realize this voice is an active force in their behavior. They experience it as \"how they feel\" or \"the truth about themselves.\" But it's neither. It's a pattern — a script that was written through years of experience, feedback, and repetition, and that now plays on autopilot."
          }
        ]
      },
      {
        "title": "Common sabotage scripts",
        "content": [
          {
            "type": "prose",
            "html": "Recognize any of these?"
          },
          {
            "type": "prose",
            "html": "<strong>The perfectionist script:</strong> <em>\"If I can't do it perfectly, why bother doing it at all?\"</em> This kills more progress than laziness ever has. It creates an impossible standard that guarantees failure, then uses that failure as proof that you shouldn't have tried. The antidote: done is better than perfect. Every time."
          },
          {
            "type": "callout",
            "html": "<p><strong>Every sabotage script has the same function:</strong> it protects you from failure by preventing you from fully trying. If you never fully commit, you never fully fail. It's an emotional safety mechanism. But the cost is enormous: a life lived at half capacity, where you're always holding back, always hedging, always leaving yourself an exit. Recognizing this function — protection through prevention — makes it easier to override.</p>"
          }
        ]
      },
      {
        "title": "Operational self-talk",
        "content": [
          {
            "type": "prose",
            "html": "You don't silence the voice — you give it better material. Operational self-talk is simple, direct, and action-oriented. It doesn't argue with the sabotage script. It replaces it with a command."
          },
          {
            "type": "prose",
            "html": "<strong>Instead of</strong> \"I don't feel like it\" → <strong>\"I don't need to feel like it. I need to do it.\"</strong>"
          }
        ]
      }
    ],
    "appCard": {
      "label": "Journal Your Scripts",
      "description": "Write your sabotage scripts and replacements in the <strong>Journal</strong> — seeing them side by side is the antidote.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Identify your top 3 sabotage scripts",
        "description": "Which internal narratives most frequently pull you away from your system? Write them down word for word — exactly as the voice says them. Don't sanitize or summarize. Capture the actual script."
      },
      {
        "name": "Write a replacement for each one",
        "description": "For each sabotage script, write an operational response — short, direct, and grounded in evidence from the past 17 days. The replacement should be something you genuinely believe based on what you've done, not a platitude."
      },
      {
        "name": "Create your personal mantra",
        "description": "One sentence that captures your operating identity and cuts through resistance. Short enough to say in 3 seconds. Powerful enough to redirect your focus. Test it: does it feel true? Would the person in your identity statement say this?",
        "hint": "\"I execute, then I feel. Not the other way around.\""
      },
      {
        "name": "Practice the replacement today",
        "description": "For the rest of today, notice when a sabotage script runs. Catch it. Name it. Consciously replace it with your new response. This is a skill — it gets easier with practice, but it requires intentional repetition at first."
      },
      {
        "name": "Write your scripts where you'll see them",
        "description": "Open <strong>Journal</strong> and write a dedicated entry titled \"Script Replacements.\" List each sabotage script on the left and its operational replacement on the right. Also add your personal mantra. When resistance hits, open this entry — seeing the old script next to the replacement makes the choice obvious."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 18.",
    "closingParagraphs": [
      "You've just addressed the most personal — and often the most powerful — component of the entire system. The external architecture is solid. Now the internal dialogue matches it."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 18",
      "title": "Design your weekly review"
    }
  },
  {
    "day": 18,
    "title": "Design Your Weekly Review",
    "phaseLabel": "Phase III — Install",
    "phase": 3,
    "heroTitle": "Design Your\nWeekly Review",
    "heroIntro": "The installation ends on Day 21. What keeps the system alive after that is the review cycle. Today you build the single most important retention mechanism in the entire program — the habit that protects all the other habits.",
    "principleLabel": "The Law of Feedback",
    "principleParagraphs": [
      "Continuous improvement requires continuous feedback. Without a regular mechanism to assess what's working and what isn't, even the best system gradually drifts off course — not because it failed, but because it stopped being actively maintained."
    ],
    "sections": [
      {
        "title": "Why most systems die after the program ends",
        "content": [
          {
            "type": "prose",
            "html": "Here's the pattern: someone completes a course, a challenge, or a program. For a few weeks, they're energized. They follow the system. Results come. Then, gradually, they stop paying attention. They skip a day. Then a week. The habits erode. The tracker goes unused. Within two months, they're back where they started — or close to it."
          },
          {
            "type": "prose",
            "html": "This pattern is so common it's almost universal. And the reason is always the same: <strong>the program ended, and nothing replaced the structure of daily lessons with a self-sustaining feedback loop.</strong>"
          }
        ]
      },
      {
        "title": "The 10-minute weekly review",
        "content": [
          {
            "type": "prose",
            "html": "Your review follows a simple, repeatable format. It should take no more than 10 minutes. Longer is unnecessary — and if it's longer, you'll eventually skip it. The power is in the consistency, not the depth. A 10-minute review done every week for a year is infinitely more valuable than a 60-minute review done once and never repeated."
          },
          {
            "type": "prose",
            "html": "<strong>Minutes 1–3: Data review.</strong> Open your tracker. Look at the past 7 days. Check your non-negotiable completion rate. Note your keystone habit consistency. Read your daily notes. What patterns do you see? Where were you strong? Where were the gaps?"
          },
          {
            "type": "callout",
            "html": "<p><strong>The same time, every week.</strong> The review only works if it happens consistently. Choose a specific day and time — Sunday evening is common, but any consistent slot works. Put it in your calendar as a recurring event. Set a reminder. Treat it as non-negotiable. The review is not an add-on to your system. It IS the system's maintenance protocol.</p>"
          }
        ]
      },
      {
        "title": "What the review prevents",
        "content": [
          {
            "type": "prose",
            "html": "Without a weekly review, three things happen gradually:"
          },
          {
            "type": "prose",
            "html": "<strong>Drift.</strong> Small deviations accumulate unnoticed. You miss a non-negotiable here, skip a habit there. Each miss is minor. But over weeks, they compound into a significant departure from your system. The review catches drift while it's still small and correctable."
          }
        ]
      }
    ],
    "appCard": {
      "label": "Set Up Your Review",
      "description": "Add your weekly review as a recurring <strong>Task</strong> so it shows up every week automatically.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Choose your weekly review day and time",
        "description": "Pick a specific, consistent slot — Sunday evening, Saturday morning, Friday afternoon. The day matters less than the consistency. Choose what works for your schedule and commit to it permanently."
      },
      {
        "name": "Write out your review template",
        "description": "Copy or adapt the 10-minute structure: data review, direction/identity check, priority check, one adjustment, next week's intention. Format it in a way you'll actually use — phone notes, notebook page, tracker section."
      },
      {
        "name": "Run a practice review right now",
        "description": "Use today as a trial run. Go through all 5 sections using your data from the past week. Time yourself. Adjust the format until it feels natural and fast. The practice run reveals whether the template works before you rely on it."
      },
      {
        "name": "Set a recurring calendar reminder",
        "description": "Put the weekly review in your calendar as a recurring event. Set a notification 15 minutes before. The review must be triggered externally until it becomes habitual — don't rely on memory."
      },
      {
        "name": "Write the rule",
        "description": "'Every [day] at [time], I run my 10-minute weekly review. Non-negotiable.' Add this to your system overview alongside your other non-negotiables. This is the habit that maintains all the other habits."
      },
      {
        "name": "Add weekly review as a recurring task",
        "description": "Open <strong>Tasks</strong> in the app and add \"Weekly Review\" as a recurring task on your chosen day. Include a note with the 10-minute template: data review, direction check, priority check, one adjustment, next week's intention. The app now triggers and tracks your reviews."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 19.",
    "closingParagraphs": [
      "You've just built the single most important retention mechanism in the entire program. The weekly review is what transforms 21 days of installation into a permanent operating system. Without it, the system has an expiration date. With it, the system has a heartbeat."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 19",
      "title": "Plan your monthly recalibration"
    }
  },
  {
    "day": 19,
    "title": "Plan Your Monthly Recalibration",
    "phaseLabel": "Phase III — Install",
    "phase": 3,
    "heroTitle": "Plan Your Monthly\nRecalibration",
    "heroIntro": "Weekly reviews keep you calibrated week to week. Monthly recalibrations keep your system alive month to month — ensuring your direction, identity, and priorities evolve as you grow instead of becoming stale artifacts you outgrow and abandon.",
    "principleLabel": "The Law of Goal Setting",
    "principleParagraphs": [
      "Goals are the fuel in the furnace of achievement. Without them, there's nothing to drive toward. But goals that never evolve become prisons instead of fuel — fixed targets in a changing life."
    ],
    "sections": [
      {
        "title": "Why monthly matters",
        "content": [
          {
            "type": "prose",
            "html": "Your weekly review handles tactical maintenance — did I do what I said I'd do? Are my habits holding? Where do I need to adjust? It operates at the level of daily execution."
          },
          {
            "type": "prose",
            "html": "The monthly recalibration operates at the strategic level. It asks bigger questions: Is my direction still the right direction? Has my identity evolved? Are my priorities still the right priorities? These questions don't need weekly attention — they change slowly. But they absolutely need monthly attention, because slow change is still change."
          }
        ]
      },
      {
        "title": "The 30-minute recalibration process",
        "content": [
          {
            "type": "prose",
            "html": "Monthly recalibration is more thorough than the weekly review but still structured and time-bounded. Thirty minutes, once a month, at the same time. Here's the process:"
          },
          {
            "type": "prose",
            "html": "<strong>Step 1: Review the month's weekly reviews (5 minutes).</strong> You have 4 weekly reviews to look back on. What themes emerged? Where was consistency strong across the month? Where did it repeatedly slip? The weekly reviews are your raw data — the monthly recalibration is where you synthesize them into insight."
          },
          {
            "type": "callout",
            "html": "<p><strong>The evolution principle:</strong> Your direction, identity, and priorities are meant to evolve. Changing them during a recalibration is not inconsistency — it's growth. The only failure is leaving them unchanged despite clear evidence that they need updating. Rigidity is not commitment. Rigidity is how good systems become irrelevant.</p>"
          }
        ]
      },
      {
        "title": "The rhythm of sustained operation",
        "content": [
          {
            "type": "prose",
            "html": "After Day 21, your complete operating rhythm looks like this:"
          },
          {
            "type": "prose",
            "html": "<strong>Daily:</strong> Execute your structure. Complete your non-negotiables and keystone habits. Log in the tracker during your evening close-out. Time: 2 minutes for logging."
          }
        ]
      }
    ],
    "appCard": {
      "label": "Set Up Recalibration",
      "description": "Add your monthly recalibration as a recurring <strong>Task</strong> in the tracker.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Choose your monthly recalibration date",
        "description": "Pick a specific day each month — first Sunday, last Saturday, the 1st. The date matters less than the consistency. Add it to your calendar as a recurring event with a reminder."
      },
      {
        "name": "Write out your recalibration template",
        "description": "The 5-step process with time allocations: monthly review synthesis (5 min), direction reassessment (5 min), identity reassessment (5 min), priority reassessment (5 min), next month's focus (10 min). Format it alongside your weekly review template."
      },
      {
        "name": "Run a practice recalibration now",
        "description": "Treat the past 19 days as your first month. Walk through all 5 steps with real data. Update your direction and identity if they've evolved. Reassess your priorities. Set a focus for the final 2 days and beyond."
      },
      {
        "name": "Document your evolution since Day 1",
        "description": "Write a brief paragraph about how your thinking has changed. What do you understand about yourself now that you didn't on Day 1? What priorities have shifted? What surprised you? This becomes part of your permanent installation record."
      },
      {
        "name": "Confirm your complete operating rhythm",
        "description": "Write out your three cycles in one place: daily (execute + log), weekly (10-min review), monthly (30-min recalibration). This is the engine that runs your system indefinitely. Make sure all three have calendar entries."
      },
      {
        "name": "Add monthly recalibration to the app",
        "description": "Open <strong>Tasks</strong> and add \"Monthly Recalibration\" as a task on your chosen date. Include a note with the 5-step template. Your app now contains triggers for both maintenance cycles — weekly and monthly. The system maintains itself."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 20.",
    "closingParagraphs": [
      "You now have every maintenance mechanism in place. Daily execution keeps the system moving. Weekly reviews keep it calibrated. Monthly recalibrations keep it evolving. Three nested cycles, each serving a different time horizon, together creating a self-sustaining operating rhythm."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 20",
      "title": "Consolidate your operating system"
    }
  },
  {
    "day": 20,
    "title": "Consolidate Your Operating System",
    "phaseLabel": "Phase III — Install",
    "phase": 3,
    "heroTitle": "Consolidate Your\nOperating System",
    "heroIntro": "Twenty days of building. Every component, every principle, every decision — scattered across notes, your tracker, and your memory. Today, you bring it all together into one clear, complete document: your personal operating manual.",
    "principleLabel": "The Law of Clarity",
    "principleParagraphs": [
      "The greater clarity you have about who you are and what you want, the more you accomplish in a shorter period of time. Clarity eliminates hesitation. It removes the friction of uncertainty. It turns intention into immediate action."
    ],
    "sections": [
      {
        "title": "Why consolidation matters",
        "content": [
          {
            "type": "prose",
            "html": "Over 20 days, you've created a lot of infrastructure. Direction statement. Identity statement. Daily indicators. Three-anchor structure. Non-negotiables. Keystone habits with cue-routine-reward formulas. Decision rules. If-then protocols. Energy alignment notes. Priority stack with outcomes. Minimum viable day. Restart protocol. Failure protocol. Sabotage scripts and replacements. Personal mantra. Weekly review template. Monthly recalibration template. Accountability structure."
          },
          {
            "type": "prose",
            "html": "That's substantial. And it's probably distributed across multiple locations — notebook pages, phone notes, tracker entries, mental memory. Some of it you remember clearly. Some of it has faded. Some of it was updated at various points and you may not be sure which version is current."
          }
        ]
      },
      {
        "title": "Your operating manual structure",
        "content": [
          {
            "type": "prose",
            "html": "Your manual should include these sections, in this order. Each section should be brief — a few sentences to a short paragraph. The entire document should be readable in under 5 minutes."
          },
          {
            "type": "prose",
            "html": "<strong>Section 1: Direction.</strong> Your current direction statement — updated through today. This is the destination, the \"where am I going?\""
          },
          {
            "type": "callout",
            "html": "<p><strong>The one-page challenge:</strong> Try to fit the essential version of each section on a single page. The detailed version can be longer — but the summary page is what you'll reference most often. During a weekly review, you should be able to scan the summary page in under a minute and know exactly where you stand.</p>"
          }
        ]
      },
      {
        "title": "Making it a living document",
        "content": [
          {
            "type": "prose",
            "html": "Your operating manual is not carved in stone. It's a living document that gets updated during every monthly recalibration. Direction evolves. Priorities shift. Habits mature. Decision rules get added or retired. The manual should always reflect your <em>current</em> operating system — not the version from a month ago."
          },
          {
            "type": "prose",
            "html": "Store it somewhere permanent and accessible. A dedicated note in your phone. A document in your files. A printed page in a notebook. Whatever format ensures you can access it within 30 seconds at any time. If it's buried in a folder you never open, it's useless. If it's one tap or one glance away, it becomes a daily reference."
          }
        ]
      }
    ],
    "appCard": {
      "label": "Review Your Full System",
      "description": "The <strong>Dashboard</strong> is part of your operating manual. All your Goals, Habits, Tasks, and Journal entries — consolidated.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Assemble your operating manual",
        "description": "Go through all 12 sections listed above. For each one, write or compile the current version. Much of it already lives in the app — your direction and identity in <strong>Goals</strong>, your execution data in <strong>Tasks</strong> and <strong>Habits</strong>, your reflections and protocols in <strong>Journal</strong>, and your aggregate data in the <strong>Dashboard</strong>. Pull from these sources as you compile."
      },
      {
        "name": "Review the complete system",
        "description": "Read through the entire manual start to finish. Then open the app and cross-reference: do your <strong>Goals</strong> match your written direction and identity? Do your <strong>Tasks</strong> and <strong>Habits</strong> match your written non-negotiables and keystone habits? Update anything that's out of sync."
      },
      {
        "name": "Create the one-page summary",
        "description": "Distill the full manual into a single-page overview: direction (2 sentences), identity (2 sentences), priorities (3 lines), daily structure (3 anchors), non-negotiables (3-5 items), maintenance rhythm (weekly + monthly). This is your quick-reference page."
      },
      {
        "name": "Store it permanently",
        "description": "Put the full manual and the one-page summary somewhere you can access within 30 seconds. Consider storing it as a dedicated <strong>Journal</strong> entry in the app titled \"Operating Manual\" — that way it lives alongside all your other system data in one place."
      },
      {
        "name": "Read it once more tonight",
        "description": "Read the full manual before bed. Let the complete picture of your system settle in. Tomorrow is the final day. You walk into it knowing exactly what you've built and exactly how it works."
      }
    ],
    "tasksSubtitle": "Complete all tasks before moving to Day 21.",
    "closingParagraphs": [
      "Your system is now documented, complete, and consolidated. Everything you've built over 20 days lives in one place — organized, accessible, and ready for permanent use."
    ],
    "nextDay": {
      "eyebrow": "Tomorrow — Day 21",
      "title": "Activation day"
    }
  },
  {
    "day": 21,
    "title": "System Installed — Activation Day",
    "phaseLabel": "Phase III — Install",
    "phase": 3,
    "heroTitle": "System Installed.\nActivation Day.",
    "heroIntro": "Twenty-one days ago, you had a direction but no system. Now you have both — a complete, documented, stress-tested personal operating system built on the psychology of achievement and tailored entirely to your life. Today, the installation ends. Operational mode begins.",
    "principleLabel": "The Law of Cause and Effect",
    "principleParagraphs": [
      "We return to where we started. Every result has a cause. Every outcome traces back to a decision, a pattern, or a system that produced it."
    ],
    "sections": [
      {
        "title": "The full scope of what you've built",
        "content": [
          {
            "type": "prose",
            "html": "Before you move into operational mode, take a moment to see — really see — the complete architecture of what you've created."
          },
          {
            "type": "prose",
            "html": "<strong>Phase I — Stabilize (Days 1–7):</strong> You went from zero structure to a functioning daily system. Direction locked. Three-anchor structure in place. Unconscious default patterns identified. Non-negotiable behaviors installed. Tracker live and logging. Environment redesigned. First review completed. You went from reactive to grounded."
          }
        ]
      },
      {
        "title": "The shift from installation to operation",
        "content": [
          {
            "type": "prose",
            "html": "Starting tomorrow, the daily lessons stop. No new input. No new principles. No external structure telling you what to focus on today. That was the installation. It's complete."
          },
          {
            "type": "prose",
            "html": "What continues is the rhythm you've built:"
          }
        ]
      },
      {
        "title": "The compound future",
        "content": [
          {
            "type": "prose",
            "html": "Here's what most people don't understand about systems like this: the real results don't show up in 21 days. They show up in 90 days, in 6 months, in a year. The Law of Accumulation — every small effort compounds — means that the person running this system for 6 months will be in a fundamentally different position than the person who stopped at Day 21."
          },
          {
            "type": "prose",
            "html": "Day 22 won't feel dramatically different from Day 21. Day 50 will. Day 100 will be transformative. The daily actions are small. The compound effect is not."
          },
          {
            "type": "callout",
            "html": "<p><strong>The question that matters:</strong> What will your tracker look like on Day 100? What will your monthly recalibration reveal after 3 months of consistent operation? What will your identity statement say after a year of living it? You can't answer these questions today. But you've built the system that will answer them. All you have to do is keep running it.</p>"
          }
        ]
      }
    ],
    "appCard": {
      "label": "Final Dashboard Review",
      "description": "Open the <strong>Dashboard</strong> one last time as installation. Your streaks, data, and Journal tell the story of 21 days.",
      "url": "https://structured-achieve-operating-system.netlify.app/"
    },
    "tasks": [
      {
        "name": "Run your final installation review",
        "description": "Open your operating manual. Read through every section. Confirm everything is current, clear, and accurate. This is your last check before operational mode begins. Make any final updates now."
      },
      {
        "name": "Compare Day 1 to Day 21",
        "description": "Read your original Day 1 direction statement then your current version. Open the <strong>Dashboard</strong> — look at your streaks, your completion rates, your consistency across 17 tracked days. Open <strong>Journal</strong> and read your Day 7 and Day 14 entries. The evolution is documented. Write down what's changed."
      },
      {
        "name": "Log your final installation entry",
        "description": "Open <strong>Journal</strong> and write your final installation entry. Reference your Dashboard data: overall Task completion rate, longest streak, Habit consistency, total Journal entries. This is your operational baseline — the benchmark for every future monthly recalibration."
      },
      {
        "name": "Confirm your first weekly review",
        "description": "Verify the day, time, and calendar entry. Your first operational weekly review happens this week. It's the bridge between installation and permanent operation."
      },
      {
        "name": "Confirm your first monthly recalibration",
        "description": "Put the exact date in your calendar. One month from today. This is non-negotiable. The monthly recalibration is what keeps the system evolving with you."
      },
      {
        "name": "Make a commitment to yourself",
        "description": "Write one sentence — a commitment to continue operating this system. Not forever. Just until your next monthly recalibration. One month at a time. That's how permanent systems are built: one renewable commitment at a time."
      }
    ],
    "tasksSubtitle": "Complete all tasks to finalize your installation.",
    "closingParagraphs": [
      "You built this. Every component. Every day. Every decision. Yours."
    ]
  }
];

export function getLessonByDay(day: number): LessonData | undefined {
  return LESSON_DATA.find(l => l.day === day);
}
