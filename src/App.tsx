import React, { useEffect, useMemo, useState } from 'react';
import { Entry, Category, Converter, Task, Goal, TabType } from './types';
import { DEFAULT_CATEGORIES, DEFAULT_CONVERTERS } from './constants';
import { startOfMonth, endOfMonth, fmtDateISO, uid } from './utils/dateUtils';
import { loadFromStorage, saveToStorage } from './utils/storage';
import { saveToCloud, loadFromCloud } from './utils/cloudStorage';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useCapacitor } from './hooks/useCapacitor';
import { Navigation } from './components/Navigation';
import { AuthModal } from './components/AuthModal';
import { MonthSelector } from './components/MonthSelector';
import { GoalTracker } from './components/GoalTracker';
import { EntryForm } from './components/EntryForm';
import { EntryList } from './components/EntryList';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { HelpView } from './components/HelpView';
import { TasksView } from './components/TasksView';

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { theme } = useTheme();
  useCapacitor();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [converters, setConverters] = useState<Converter[]>(DEFAULT_CONVERTERS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [month, setMonth] = useState(fmtDateISO(startOfMonth()));
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [currentTab, setCurrentTab] = useState<TabType>("log");
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Load data from localStorage on mount (fallback)
  useEffect(() => {
    const data = loadFromStorage();
    if (data.entries) setEntries(data.entries);
    if (data.categories) setCategories(data.categories);
    if (data.converters) setConverters(data.converters);
    if (data.tasks) setTasks(data.tasks);
    if (data.goals) setGoals(data.goals);
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
    saveToStorage({ entries, categories, converters, tasks, goals, month });
    if (user) {
      saveDataToCloud();
    }
  }, [entries, categories, converters, tasks, goals, month, user]);

  const loadDataFromCloud = async () => {
    setSyncing(true);
    try {
      const { data, error } = await loadFromCloud();
      setEntries(data?.entries || []);
      setCategories(data?.categories || DEFAULT_CATEGORIES);
      setConverters(data?.converters || DEFAULT_CONVERTERS);
      setTasks(data?.tasks || []);
      setGoals(data?.goals || []);
    } catch (error) {
      console.error('Failed to load from cloud:', error);
    } finally {
      setSyncing(false);
    }
  };

  const saveDataToCloud = async () => {
    try {
      await saveToCloud({ entries, categories, converters, tasks, goals });
    } catch (error) {
      console.error('Failed to save to cloud:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    // Clear local data when signing out
    setEntries([]);
    setCategories(DEFAULT_CATEGORIES);
    setConverters(DEFAULT_CONVERTERS);
    setTasks([]);
    setGoals([]);
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

  const handleAddGoal = (goal: Goal) => {
    setGoals(prev => [...prev, goal]);
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
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
        onSignOut={handleSignOut}
        onShowAuth={() => setShowAuthModal(true)}
      />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={signIn}
        onSignUp={signUp}
      />
      
      {syncing && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-blue-800 text-sm">Syncing your data...</span>
          </div>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'log' && (
          <>
            <EntryForm
              categories={categories}
              converters={converters}
              onAddEntry={handleAddEntry}
              onUpdateCategories={setCategories}
              editingEntry={editingEntry}
              onUpdateEntry={handleUpdateEntry}
              onCancelEdit={handleCancelEdit}
            />
            
            <EntryList
              entries={filteredEntries}
              categories={categories}
              converters={converters}
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          </>
        )}
        
        {currentTab === 'stats' && (
          <>
            <StatsView
              entries={entriesThisMonth}
              categories={categories}
              converters={converters}
              goals={goals}
              onUpdateCategories={setCategories}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          </>
        )}
        
        {currentTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
        
        {currentTab === 'settings' && (
          <SettingsView
            categories={categories}
            converters={converters}
            onUpdateCategories={setCategories}
            onUpdateConverters={setConverters}
          />
        )}
        
        {currentTab === 'help' && <HelpView />}
      </main>
    </div>
  );
}

export default App;