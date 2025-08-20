import React from 'react';
import { BookOpenCheck, BarChart3, CheckSquare, Settings, HelpCircle, LogOut, User } from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterCategory: string;
  onFilterChange: (category: string) => void;
  categories: Array<{ name: string }>;
  user?: { email?: string } | null;
  onSignOut?: () => void;
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
  onSignOut,
  onShowAuth
}: NavigationProps) {
  const tabs = [
    { id: 'log' as TabType, label: 'Activity Log', icon: BookOpenCheck },
    { id: 'stats' as TabType, label: 'Dashboard', icon: BarChart3 },
    { id: 'tasks' as TabType, label: 'Daily Routines', icon: CheckSquare },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
    { id: 'help' as TabType, label: 'Help', icon: HelpCircle },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navigation */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Achievement Tracker</h1>
            
            <nav className="hidden md:flex space-x-1">
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
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">
                  {user.email}
                </span>
                <button
                  onClick={onSignOut}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
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
        {currentTab === 'log' && (
          <div className="py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end">
              <select
                value={filterCategory}
                onChange={(e) => onFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}