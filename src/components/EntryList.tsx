import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { Entry, Category, Converter } from '../types';
import { formatSingleUnit } from '../utils/formatting';
import { formatDisplayDate } from '../utils/dateUtils';

interface EntryListProps {
  entries: Entry[];
  categories: Category[];
  converters: Converter[];
  onEditEntry: (entry: Entry) => void;
  onDeleteEntry: (id: string) => void;
}

export function EntryList({ entries, categories, converters, onEditEntry, onDeleteEntry }: EntryListProps) {
  const getCategoryType = (categoryName: string): string => {
    const cat = categories.find(c => c.name === categoryName);
    return cat?.type || 'Time';
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No entries found for this period.</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add your first entry above to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map(entry => {
        const categoryType = getCategoryType(entry.category);
        const formattedAmount = formatSingleUnit(categoryType, entry.amount, entry.unit, converters);
        
        return (
          <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                    {formatDisplayDate(entry.date)}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white">{entry.category}</span>
                  <span className="text-lg font-bold text-blue-600">{formattedAmount}</span>
                </div>
                {entry.note && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 italic">{entry.note}</p>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onEditEntry(entry)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md transition-colors"
                  title="Edit entry"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this entry?')) {
                      onDeleteEntry(entry.id);
                    }
                  }}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}