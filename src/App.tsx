import React, { useEffect, useState } from 'react';
import {
  TabType, Habit, HabitCompletion, Goal,
} from './types';
import { useAuth } from './hooks/useAuth';
import { useSupabaseData } from './hooks/useSupabaseData';
import { supabase } from './lib/supabase';
import { Navigation } from './components/Navigation';
import { TabCover } from './components/TabCover';
import { AuthModal } from './components/AuthModal';
import { TodayView } from './components/TodayView';
import { SettingsView } from './components/SettingsView';
import { JournalingView } from './components/JournalingView';
import { ReviewsView } from './components/ReviewsView';
import { SystemView } from './components/SystemView';
import { AchievementsView } from './components/AchievementsView';

function App() {
  const {
    user, loading: authLoading, plan, trialEndsAt, planSource,
    signIn, signUp, signOut, startTrial,
    devSetFreePlan, devStartTrial, devSetPaidPlan,
  } = useAuth();

  // === STATE ===
  const [currentTab, setCurrentTab] = useState<TabType>('today');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Dual-mode data (localStorage + Supabase)
  const {
    nonNegotiables, nnCompletions,
    dailyTasks, journalEntries, systemDocuments,
    savedReviews, systemReports, readPatches,
    installationCompleteDate, recalPending,
    handleToggleNN, addNonNegotiable, deleteNonNegotiable,
    addDailyTask, toggleDailyTask, deleteDailyTask,
    updateJournalEntry, updateSystemDocument,
    saveSavedReview, saveSystemReport,
    updateReadPatches, updateInstallationDate, updateRecalPending,
    loading: dataLoading, clearAll,
  } = useSupabaseData({ user, authLoading });

  // Habits (Supabase)
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([]);

  // Goals (Supabase)
  const [goals, setGoals] = useState<Goal[]>([]);

  const userId = user?.id;

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
            id: `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
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

  const handleSignOut = async () => {
    await signOut();
    clearAll();
    setHabits([]);
    setHabitCompletions([]);
    setGoals([]);
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
        <div className={`px-6 sm:px-10 lg:px-14 pb-24 md:pb-12 ${currentTab === 'today' ? 'pt-12' : ''}`}>
        {currentTab === 'today' && (
          <TodayView
            nonNegotiables={nonNegotiables}
            nnCompletions={nnCompletions}
            onToggleNN={handleToggleNN}
            habits={habits}
            habitCompletions={habitCompletions}
            onToggleHabit={handleToggleHabit}
            dailyTasks={dailyTasks}
            onAddTask={addDailyTask}
            onToggleTask={toggleDailyTask}
            onDeleteTask={deleteDailyTask}
          />
        )}

        {currentTab === 'installation' && (
          <JournalingView
            journalEntries={journalEntries}
            onUpdateJournalEntry={updateJournalEntry}
            user={user}
            plan={plan}
            trialEndsAt={trialEndsAt}
            onStartTrial={startTrial}
            readPatches={readPatches}
            onUpdateReadPatches={updateReadPatches}
            installationCompleteDate={installationCompleteDate}
            onUpdateInstallationDate={updateInstallationDate}
          />
        )}

        {currentTab === 'reviews' && (
          <ReviewsView
            nonNegotiables={nonNegotiables}
            nnCompletions={nnCompletions}
            habits={habits}
            habitCompletions={habitCompletions}
            dailyTasks={dailyTasks}
            systemDocuments={systemDocuments}
            onUpdateSystemDocument={updateSystemDocument}
            savedReviews={savedReviews}
            onSaveReview={saveSavedReview}
            recalPending={recalPending}
            onUpdateRecalPending={updateRecalPending}
            onDeleteNonNegotiable={deleteNonNegotiable}
            onAddNonNegotiable={addNonNegotiable}
            onHabitsChange={loadHabits}
            user={user}
          />
        )}

        {currentTab === 'achievements' && (
          <AchievementsView
            nonNegotiables={nonNegotiables}
            nnCompletions={nnCompletions}
            habits={habits}
            habitCompletions={habitCompletions}
            dailyTasks={dailyTasks}
            userId={userId}
            systemReports={systemReports}
            onSaveSystemReport={saveSystemReport}
          />
        )}

        {currentTab === 'system' && (
          <SystemView
            nonNegotiables={nonNegotiables}
            onAddNonNegotiable={addNonNegotiable}
            onDeleteNonNegotiable={deleteNonNegotiable}
            systemDocuments={systemDocuments}
            onUpdateSystemDocument={updateSystemDocument}
            habits={habits}
            onHabitsChange={loadHabits}
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
