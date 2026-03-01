import React, { useEffect, useRef, useState } from 'react';
import {
  TabType, DailyTask, NonNegotiable, NonNegotiableCompletion,
  Habit, HabitCompletion, Goal, JournalEntry,
} from './types';
import { fmtDateISO, uid } from './utils/dateUtils';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { Navigation } from './components/Navigation';
import { TabCover } from './components/TabCover';
import { AuthModal } from './components/AuthModal';
import { TodayView } from './components/TodayView';
import { SettingsView } from './components/SettingsView';
import { JournalingView } from './components/JournalingView';
import { ReviewsView } from './components/ReviewsView';
import { SystemView } from './components/SystemView';

function App() {
  const {
    user, loading: authLoading, plan, trialEndsAt, planSource,
    signIn, signUp, signOut, startTrial,
    devSetFreePlan, devStartTrial, devSetPaidPlan,
  } = useAuth();

  // === STATE ===
  const [currentTab, setCurrentTab] = useState<TabType>('today');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Non-Negotiables (localStorage)
  const [nonNegotiables, setNonNegotiables] = useState<NonNegotiable[]>([]);
  const [nnCompletions, setNNCompletions] = useState<NonNegotiableCompletion[]>([]);

  // Habits (Supabase)
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([]);

  // Daily tasks (localStorage)
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);

  // Goals (Supabase)
  const [goals, setGoals] = useState<Goal[]>([]);

  // Journal (localStorage)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  const userId = user?.id;
  const isFirstRender = useRef(true);

  // === LOAD DATA ===
  useEffect(() => {
    try {
      const nnRaw = localStorage.getItem('sa_non_negotiables');
      if (nnRaw) setNonNegotiables(JSON.parse(nnRaw));

      const nnCompRaw = localStorage.getItem('sa_nn_completions');
      if (nnCompRaw) setNNCompletions(JSON.parse(nnCompRaw));

      const tasksRaw = localStorage.getItem('sa_daily_tasks');
      if (tasksRaw) setDailyTasks(JSON.parse(tasksRaw));

      const journalRaw = localStorage.getItem('sa_journal_entries');
      if (journalRaw) {
        setJournalEntries(JSON.parse(journalRaw));
      } else {
        // Migrate from legacy storage if sa_journal_entries doesn't exist yet
        const legacyRaw = localStorage.getItem('daily-achievement-tracker');
        if (legacyRaw) {
          try {
            const legacy = JSON.parse(legacyRaw);
            if (legacy.journalEntries?.length) {
              setJournalEntries(legacy.journalEntries);
              localStorage.setItem('sa_journal_entries', JSON.stringify(legacy.journalEntries));
            }
          } catch { /* ignore legacy parse errors */ }
        }
      }
    } catch (e) {
      console.warn('Failed to load data:', e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem('sa_non_negotiables', JSON.stringify(nonNegotiables));
    localStorage.setItem('sa_nn_completions', JSON.stringify(nnCompletions));
    localStorage.setItem('sa_daily_tasks', JSON.stringify(dailyTasks));
    localStorage.setItem('sa_journal_entries', JSON.stringify(journalEntries));
  }, [nonNegotiables, nnCompletions, dailyTasks, journalEntries]);

  // Load Supabase data when authenticated
  useEffect(() => {
    if (user && !authLoading) {
      loadHabits();
      loadHabitCompletions();
      loadGoals();
    }
  }, [user, authLoading]);

  const loadHabits = async () => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setHabits(data || []);
    } catch (e) {
      console.error('Error loading habits:', e);
    }
  };

  const loadHabitCompletions = async () => {
    try {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .order('completion_date', { ascending: false });
      if (error) throw error;
      setHabitCompletions(data || []);
    } catch (e) {
      console.error('Error loading habit completions:', e);
    }
  };

  const loadGoals = async () => {
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return;
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setGoals((data || []).map((g: any) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        target_amount: g.target_amount,
        current_amount: g.current_amount,
        unit: g.unit,
        target_date: g.target_date || '',
        created_at: g.created_at,
        completed: g.completed,
        completed_at: g.completed_at,
      })));
    } catch (e) {
      console.error('Error loading goals:', e);
    }
  };

  // === HANDLERS ===

  const handleToggleNN = (nn: NonNegotiable, date: string) => {
    const existing = nnCompletions.find(
      (c) => c.non_negotiable_id === nn.id && c.completion_date === date
    );
    if (existing) {
      setNNCompletions((prev) => prev.filter((c) => c.id !== existing.id));
    } else {
      setNNCompletions((prev) => [
        ...prev,
        {
          id: uid(),
          non_negotiable_id: nn.id,
          user_id: userId || 'local',
          completion_date: date,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleToggleHabit = async (habit: Habit, date: string) => {
    const existing = habitCompletions.find(
      (c) => c.habit_id === habit.id && c.completion_date === date
    );

    if (existing) {
      if (user) {
        await supabase.from('habit_completions').delete().eq('id', existing.id);
        loadHabitCompletions();
      } else {
        setHabitCompletions((prev) => prev.filter((c) => c.id !== existing.id));
      }
    } else {
      if (user) {
        await supabase.from('habit_completions').insert({
          habit_id: habit.id,
          user_id: user.id,
          completion_date: date,
          completed_number: habit.target_number || 1,
        });
        loadHabitCompletions();
      } else {
        setHabitCompletions((prev) => [
          ...prev,
          {
            id: uid(),
            habit_id: habit.id,
            user_id: 'local',
            completion_date: date,
            completed_number: habit.target_number || 1,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    }
  };

  const handleAddDailyTask = (task: DailyTask) => {
    setDailyTasks((prev) => [...prev, task]);
  };

  const handleToggleTask = (id: string) => {
    setDailyTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setDailyTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateJournalEntry = (entry: JournalEntry) => {
    setJournalEntries((prev) => {
      const existing = prev.find((e) => e.dayNumber === entry.dayNumber);
      if (existing) {
        return prev.map((e) => (e.dayNumber === entry.dayNumber ? entry : e));
      }
      return [...prev, entry];
    });
  };

  const handleSignOut = async () => {
    await signOut();
    setNonNegotiables([]);
    setNNCompletions([]);
    setDailyTasks([]);
    setHabits([]);
    setHabitCompletions([]);
    setGoals([]);
    setJournalEntries([]);
  };

  // === RENDER ===

  if (authLoading) {
    return (
      <div className="min-h-screen bg-sa-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-sa-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sa-cream-faint text-xs">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sa-bg">
      <Navigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        user={user}
        plan={plan}
        trialEndsAt={trialEndsAt}
        onSignOut={handleSignOut}
        onShowAuth={() => setShowAuthModal(true)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={signIn}
        onSignUp={signUp}
      />

      <main className="md:ml-[260px] min-h-screen">
        <TabCover tab={currentTab} />
        <div className="px-6 sm:px-10 lg:px-14 pb-24 md:pb-12">
        {currentTab === 'today' && (
          <TodayView
            nonNegotiables={nonNegotiables}
            nnCompletions={nnCompletions}
            onToggleNN={handleToggleNN}
            habits={habits}
            habitCompletions={habitCompletions}
            onToggleHabit={handleToggleHabit}
            dailyTasks={dailyTasks}
            onAddTask={handleAddDailyTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {currentTab === 'installation' && (
          <JournalingView
            journalEntries={journalEntries}
            onUpdateJournalEntry={handleUpdateJournalEntry}
            user={user}
            plan={plan}
            trialEndsAt={trialEndsAt}
            onStartTrial={startTrial}
          />
        )}

        {currentTab === 'reviews' && (
          <ReviewsView
            nonNegotiables={nonNegotiables}
            nnCompletions={nnCompletions}
            habits={habits}
            habitCompletions={habitCompletions}
            dailyTasks={dailyTasks}
            goals={goals}
          />
        )}

        {currentTab === 'system' && (
          <SystemView
            nonNegotiables={nonNegotiables}
            onUpdateNonNegotiables={setNonNegotiables}
            habits={habits}
            onHabitsChange={loadHabits}
            goals={goals}
            onGoalsChange={loadGoals}
            user={user}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            user={user}
            plan={plan}
            trialEndsAt={trialEndsAt}
            planSource={planSource}
            onSignIn={() => setShowAuthModal(true)}
            onSignOut={signOut}
            onStartTrial={startTrial}
            devSetFreePlan={devSetFreePlan}
            devStartTrial={devStartTrial}
            devSetPaidPlan={devSetPaidPlan}
          />
        )}
        </div>
      </main>
    </div>
  );
}

export default App;
