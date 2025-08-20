import React from 'react';
import { HelpCircle, Clock, MapPin, Hash } from 'lucide-react';

export function HelpView() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <HelpCircle className="w-5 h-5 mr-2" />
          How to Use Daily Achievement Tracker
        </h3>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This app helps you track various activities with intelligent amount parsing. 
            Simply enter amounts in natural formats and the app will understand them automatically.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-6 h-6 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Time Tracking</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">1h 30m</code> - 1 hour 30 minutes</p>
                    <p><code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">90min</code> - 90 minutes</p>
                    <p><code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">1:30</code> - 1 hour 30 minutes</p>
                    <p><code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">3600s</code> - 3600 seconds</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="w-6 h-6 text-emerald-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Distance Tracking</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">5km</code> - 5 kilometers</p>
                    <p><code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">3km 250m</code> - 3.25 kilometers</p>
                    <p><code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">2.1mi</code> - 2.1 miles</p>
                    <p><code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">5935m</code> - 5935 meters</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Hash className="w-6 h-6 text-amber-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Count Tracking</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">12</code> - 12 times</p>
                    <p><code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">5x</code> - 5 times</p>
                    <p><code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">3 times</code> - 3 times</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tips & Features</h3>
        <div className="space-y-3 text-gray-600 dark:text-gray-400">
          <p>• <strong>Today's Totals:</strong> See your daily progress at a glance with activity count, time, and distance summaries</p>
          <p>• <strong>Streak Tracking:</strong> Track consecutive days of activity - your best streak is preserved even when current streaks break</p>
          <p>• <strong>Activity Records:</strong> Set personal bests by achieving your highest daily total in any category</p>
          <p>• <strong>Favorites/Habits:</strong> Mark categories as habits with the star icon to keep them visible in statistics</p>
          <p>• <strong>Smart Filtering:</strong> Use the category filter to focus on specific activities in your log</p>
          <p>• <strong>Detailed Statistics:</strong> View comprehensive stats including totals, averages, active days, and personal records</p>
          <p>• <strong>Data Management:</strong> Export your data as JSON for backup or import previous exports to restore history</p>
          <p>• <strong>Flexible Categories:</strong> Create custom categories with different measurement types (Time, Distance, Count) in Settings</p>
          <p>• <strong>Quick Entry:</strong> Add activities with natural language - the app understands formats like "1h 30m" or "5km 250m"</p>
          <p>• <strong>Edit & Delete:</strong> Modify or remove entries directly from the activity log with built-in confirmation</p>
        </div>
      </div>
    </div>
  );
}