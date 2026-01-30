import React from 'react';
import { BookOpenCheck, BarChart3, CheckSquare, BookOpen, Calendar, Settings, Info, User, Crown } from 'lucide-react';
import { TabType } from '../types';
import { getTrialDaysRemaining } from '../utils/trialUtils';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterCategory: string;
  onFilterChange: (category: string) => void;
  categories: Array<{ name: string }>;
  user?: { email?: string } | null;
  plan?: 'free' | 'paid';
  trialEndsAt?: string | null;
  onSignOut: () => void;
  onShowAuth?: () => void;
}

export function Navigation({
  currentTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  filterCategory,
  onFilterChange,
  categories,
  user,
  plan = 'free',
  trialEndsAt = null,
  onSignOut,
  onShowAuth
}: NavigationProps) {
  const trialDaysRemaining = getTrialDaysRemaining(trialEndsAt);
  const isTrialActive = trialDaysRemaining > 0;
  const tabs = [
    { id: 'log' as TabType, label: "Today's Tasks", icon: CheckSquare },
    { id: 'stats' as TabType, label: 'Dashboard', icon: BarChart3 },
    { id: 'tasks' as TabType, label: 'Daily Habits', icon: Calendar },
    { id: 'journaling' as TabType, label: 'Journaling', icon: BookOpen },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
    { id: 'help' as TabType, label: 'Info', icon: Info },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navigation */}
        <div className="flex items-center h-16 justify-between">
          <div className="flex items-center gap-10">

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Achievement Tracker</h1>
            
            <nav className="hidden md:flex space-x-4">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                      currentTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.id !== 'settings' && tab.id !== 'help' && <span>{tab.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                {/* Plan Badge */}
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  plan === 'paid' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                  isTrialActive ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {plan === 'paid' && <span className="flex items-center"><Crown className="w-3 h-3 mr-1" />Paid</span>}
                  {plan === 'free' && isTrialActive && <span className="flex items-center"><Crown className="w-3 h-3 mr-1" />Trial ({trialDaysRemaining}d)</span>}
                  {plan === 'free' && !isTrialActive && 'Free'}
                </div>

                {/* User Email */}
                <span className="text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                  {user.email}
                </span>
              </div>
            ) : (
              <button
                onClick={onShowAuth}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </button>
            )}
          </div>
          </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-3">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                    currentTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Search and Filter */}
      </div>
    </div>
  );
}