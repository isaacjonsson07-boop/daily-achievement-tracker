import React, { useEffect, useMemo, useState } from 'react';
import { Entry, Category, Converter, Task, Goal, JournalEntry, ScheduleItem, TabType, Habit, HabitCompletion } from './types';
import { DEFAULT_CATEGORIES, DEFAULT_CONVERTERS } from './constants';
import { startOfMonth, endOfMonth, fmtDateISO, uid } from './utils/dateUtils';
import { loadFromStorage, saveToStorage } from './utils/storage';
import { saveToCloud, loadFromCloud } from './utils/cloudStorage';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useCapacitor } from './hooks/useCapacitor';
import { supabase } from './lib/supabase';
import { Navigation } from './components/Navigation';
import { AuthModal } from './components/AuthModal';
import { MonthSelector } from './components/MonthSelector';
import { EntryForm } from './components/EntryForm';
import { EntryList } from './components/EntryList';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { HelpView } from './components/HelpView';
import { HabitsView } from './components/HabitsView';
import { JournalingView } from './components/JournalingView';
import { TodayTasksView } from './components/TodayTasksView';

function App() {
  const {
    user,
    loading: authLoading,
    plan,
    trialEndsAt,
    planSource,
    signIn,
    signUp,
    signOut,
    startTrial,
    devSetFreePlan,
    devStartTrial,
    devSetPaidPlan
  } = useAuth();
  const { theme } = useTheme();
  useCapacitor();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [converters, setConverters] = useState<Converter[]>(DEFAULT_CONVERTERS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [month, setMonth] = useState(fmtDateISO(startOfMonth()));
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [currentTab, setCurrentTab] = useState<TabType>("log");
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([]);

  // Load data from localStorage on mount (fallback)
  useEffect(() => {
    const data = loadFromStorage();
    if (data.entries) setEntries(data.entries);
    if (data.categories) setCategories(data.categories);
    if (data.converters) setConverters(data.converters);
    if (data.tasks) setTasks(data.tasks);
    if (data.goals) setGoals(data.goals);
    if (data.journalEntries) setJournalEntries(data.journalEntries);
    if (data.scheduleItems) setScheduleItems(data.scheduleItems);
    if (data.habits) setHabits(data.habits);
    if (data.habitCompletions) setHabitCompletions(data.habitCompletions);
    if (data.month) setMonth(data.month);
  }, []);

  // Load data from cloud when user signs in
  useEffect(() => {
    if (user && !authLoading) {
      loadDataFromCloud();
    }
  }, [user, authLoading]);

  // Save data to both localStorage and cloud when state changes
  useEffect(() => {
    saveToStorage({ entries, categories, converters, tasks, goals, journalEntries, scheduleItems, habits, habitCompletions, month });
    if (user) {
      saveDataToCloud();
    }
  }, [entries, categories, converters, tasks, goals, journalEntries, scheduleItems, habits, habitCompletions, month, user]);

  const loadDataFromCloud = async () => {
    setSyncing(true);
    try {
     let data: any = null;
let error: any = null;

if (window.location.search.includes("nocloud=1")) {
  console.log("NO CLOUD LOAD MODE");
} else {
  const res = await loadFromCloud();
  data = res.data;
  error = res.error;
}
      setEntries(data?.entries || []);
      setCategories(data?.categories || DEFAULT_CATEGORIES);
      setConverters(data?.converters || DEFAULT_CONVERTERS);
      setTasks(data?.tasks || []);
      setGoals(data?.goals || []);
      setScheduleItems(data?.scheduleItems || []);
    } catch (error) {
      console.error('Failed to load from cloud:', error);
    } finally {
      setSyncing(false);
    }
  };

  const saveDataToCloud = async () => {
    try {
      await saveToCloud({ entries, categories, converters, tasks, goals, journalEntries, scheduleItems });
    } catch (error) {
      console.error('Failed to save to cloud:', error);
    }
  };

  const loadHabits = async () => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error loading habits:', error);
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
    } catch (error) {
      console.error('Error loading habit completions:', error);
    }
  };

  const loadGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      console.log('📥 Loaded goals from database (raw):', data);

      const transformedGoals: Goal[] = (data || []).map((dbGoal: any) => ({
        id: dbGoal.id,
        title: dbGoal.title,
        description: dbGoal.description,
        category: dbGoal.category || '',
        targetAmount: dbGoal.target_amount,
        currentAmount: dbGoal.current_amount,
        unit: dbGoal.unit,
        targetDate: dbGoal.target_date || '',
        createdAt: dbGoal.created_at,
        completed: dbGoal.completed,
        completedAt: dbGoal.completed_at,
        goalType: dbGoal.goal_type,
        duration: dbGoal.duration,
        distance: dbGoal.distance
      }));

      console.log('📥 Transformed goals:', transformedGoals);
      setGoals(transformedGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadHabits();
      loadHabitCompletions();
      loadGoals();
    }
  }, [user, authLoading, currentTab]);


  const handleSignOut = async () => {
    await signOut();
    // Clear local data when signing out
    setEntries([]);
    setCategories(DEFAULT_CATEGORIES);
    setConverters(DEFAULT_CONVERTERS);
    setTasks([]);
    setGoals([]);
    setJournalEntries([]);
    setScheduleItems([]);
    setHabits([]);
    setHabitCompletions([]);
    setMonth(fmtDateISO(startOfMonth()));
  };

  // Calculate month boundaries
  const monthStart = useMemo(() => new Date(month + "T00:00:00"), [month]);
  const monthEnd = useMemo(() => endOfMonth(monthStart), [monthStart]);

  // Filter entries for current month
  const entriesThisMonth = useMemo(() => {
    return entries.filter(e => {
      const d = new Date(e.date + "T00:00:00");
      return d >= monthStart && d <= monthEnd;
    });
  }, [entries, monthStart, monthEnd]);

  // Apply search and category filters
  const filteredEntries = useMemo(() => {
    let filtered = entriesThisMonth;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.category.toLowerCase().includes(query) ||
        (e.note && e.note.toLowerCase().includes(query))
      );
    }

    if (filterCategory !== "ALL") {
      filtered = filtered.filter(e => e.category === filterCategory);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entriesThisMonth, searchQuery, filterCategory]);

  const handleAddEntry = (entry: Entry) => {
    setEntries(prev => [...prev, entry]);
  };

  const handleUpdateEntry = (updatedEntry: Entry) => {
    setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setCurrentTab('log');
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const handleAddTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddGoal = async (goal: Goal) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('goals')
          .insert({
            id: goal.id,
            user_id: user.id,
            title: goal.title,
            description: goal.description,
            category: goal.category,
            target_amount: goal.targetAmount,
            current_amount: goal.currentAmount,
            unit: goal.unit,
            target_date: goal.targetDate,
            completed: goal.completed,
            completed_at: goal.completedAt,
            goal_type: goal.goalType,
            duration: goal.duration,
            distance: goal.distance,
            created_at: goal.createdAt,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        console.log('✅ Goal added to database:', goal.title);
        await loadGoals();
      } else {
        setGoals(prev => [...prev, goal]);
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      setGoals(prev => [...prev, goal]);
    }
  };

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    console.log('🎯 App.tsx: handleUpdateGoal called with:', {
      id: updatedGoal.id,
      title: updatedGoal.title,
      currentAmount: updatedGoal.currentAmount,
      targetAmount: updatedGoal.targetAmount,
      completed: updatedGoal.completed,
      timestamp: new Date().toISOString()
    });

    // Update local state immediately to prevent re-render issues
    setGoals(prev => {
      const oldGoal = prev.find(g => g.id === updatedGoal.id);
      console.log('🔄 App.tsx: Updating goal state. Old value:', oldGoal?.currentAmount, '→ New value:', updatedGoal.currentAmount);
      return prev.map(g => g.id === updatedGoal.id ? updatedGoal : g);
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('goals')
          .update({
            title: updatedGoal.title,
            description: updatedGoal.description,
            category: updatedGoal.category,
            target_amount: updatedGoal.targetAmount,
            current_amount: updatedGoal.currentAmount,
            unit: updatedGoal.unit,
            target_date: updatedGoal.targetDate,
            completed: updatedGoal.completed,
            completed_at: updatedGoal.completedAt,
            goal_type: updatedGoal.goalType,
            duration: updatedGoal.duration,
            distance: updatedGoal.distance,
            updated_at: new Date().toISOString()
          })
          .eq('id', updatedGoal.id);

        if (error) throw error;
        console.log('💾 Goal saved to database:', {
          id: updatedGoal.id,
          title: updatedGoal.title,
          currentAmount: updatedGoal.currentAmount
        });
        // Don't reload goals to prevent re-render loops and double-counting
        // The state is already updated above
      }
    } catch (error) {
      console.error('❌ Error updating goal:', error);
      // State already updated above, no need to update again on error
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('goals')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await loadGoals();
      } else {
        setGoals(prev => prev.filter(g => g.id !== id));
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      setGoals(prev => prev.filter(g => g.id !== id));
    }
  };

  const handleUpdateJournalEntry = (updatedEntry: JournalEntry) => {
    setJournalEntries(prev => {
      const existing = prev.find(e => e.dayNumber === updatedEntry.dayNumber);
      if (existing) {
        return prev.map(e => e.dayNumber === updatedEntry.dayNumber ? updatedEntry : e);
      } else {
        return [...prev, updatedEntry];
      }
    });
  };

  const handleAddScheduleItem = (item: ScheduleItem) => {
    setScheduleItems(prev => [...prev, item]);
  };

  const handleUpdateScheduleItem = (updatedItem: ScheduleItem) => {
    setScheduleItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteScheduleItem = (id: string) => {
    setScheduleItems(prev => prev.filter(item => item.id !== id));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterCategory={filterCategory}
        onFilterChange={setFilterCategory}
        categories={categories}
        user={user}
        plan={plan}
        onSignOut={handleSignOut}
        onShowAuth={() => setShowAuthModal(true)}
        syncing={syncing}
      />

      {showAuthModal && (
        <AuthModal
        isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSignIn={signIn}
          onSignUp={signUp}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'log' && (
          <TodayTasksView
            scheduleItems={scheduleItems}
            goals={goals}
            converters={converters}
            onAddScheduleItem={handleAddScheduleItem}
            onUpdateScheduleItem={handleUpdateScheduleItem}
            onDeleteScheduleItem={handleDeleteScheduleItem}
            onUpdateGoal={handleUpdateGoal}
            onGoalUpdate={loadGoals}
            onHabitCompletionChange={loadHabitCompletions}
            allHabits={habits}
            habitCompletions={habitCompletions}
            setHabitCompletions={setHabitCompletions}
          />
        )}
        
        {currentTab === 'stats' && (
          <>
            <StatsView
              entries={entries}
              categories={categories}
              converters={converters}
              goals={goals}
              scheduleItems={scheduleItems}
              habits={habits}
              habitCompletions={habitCompletions}
              plan={plan}
              onUpdateCategories={setCategories}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          </>
        )}
        
        {currentTab === 'tasks' && (
          <HabitsView
            habits={habits}
            goals={goals}
            onHabitsChange={loadHabits}
            setHabits={setHabits}
          />
        )}
        
        {currentTab === 'journaling' && (
          <JournalingView
            journalEntries={journalEntries}
            onUpdateJournalEntry={handleUpdateJournalEntry}
            user={user}
            plan={plan}
            trialEndsAt={trialEndsAt}
            onStartTrial={startTrial}
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
        
        {currentTab === 'help' && <HelpView />}
      </main>
    </div>
  );
}

export default App;