import React, { useState } from 'react';
import { PlusCircle, Save, X, Plus } from 'lucide-react';
import { Entry, Category, Converter } from '../types';
import { TYPES } from '../constants';
import { parseAmountByType, amountPlaceholderByType } from '../utils/parsing';
import { uid, fmtDateISO } from '../utils/dateUtils';

interface EntryFormProps {
  categories: Category[];
  converters: Converter[];
  onAddEntry: (entry: Entry) => void;
  onUpdateCategories: (categories: Category[]) => void;
  editingEntry?: Entry | null;
  onUpdateEntry?: (entry: Entry) => void;
  onCancelEdit?: () => void;
}

export function EntryForm({ 
  categories, 
  converters, 
  onAddEntry, 
  onUpdateCategories,
  editingEntry, 
  onUpdateEntry, 
  onCancelEdit 
}: EntryFormProps) {
  const [date, setDate] = useState(editingEntry?.date || fmtDateISO(new Date()));
  const [category, setCategory] = useState(editingEntry?.category || categories[0]?.name || '');
  const [amountStr, setAmountStr] = useState(editingEntry ? `${editingEntry.amount}` : '');
  const [note, setNote] = useState(editingEntry?.note || '');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'Time', displayUnit: 'Auto' });

  const selectedCategory = categories.find(c => c.name === category);
  const categoryType = selectedCategory?.type || 'Time';

  const addCategory = () => {
    if (!newCategory.name.trim()) return;
    
    const updated = [...categories, { ...newCategory, name: newCategory.name.trim() }];
    onUpdateCategories(updated);
    setCategory(newCategory.name.trim());
    setNewCategory({ name: '', type: 'Time', displayUnit: 'Auto' });
    setShowAddCategory(false);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsed = parseAmountByType(amountStr, categoryType, converters);
    if (!parsed) {
      alert('Could not parse amount. Please check the format.');
      return;
    }

    const entry: Entry = {
      id: editingEntry?.id || uid(),
      date,
      category,
      amount: parsed.value,
      unit: parsed.unit,
      note: note.trim() || undefined,
    };

    if (editingEntry && onUpdateEntry) {
      onUpdateEntry(entry);
    } else {
      onAddEntry(entry);
    }

    // Reset form if adding new entry
    if (!editingEntry) {
      setAmountStr('');
      setNote('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAddCategory(!showAddCategory)}
          className="text-xl font-semibold text-gray-800 dark:text-white flex items-center hover:text-blue-600 transition-colors"
        >
          {editingEntry ? <Save className="w-5 h-5 mr-2" /> : <PlusCircle className="w-5 h-5 mr-2" />}
          {editingEntry ? 'Edit Entry' : 'Add Category'}
        </button>
      </div>
      
      {/* Add New Category Form */}
      {showAddCategory && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Add New Category</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Category name"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newCategory.type}
              onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="flex space-x-2">
              <button
                onClick={addCategory}
                disabled={!newCategory.name.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add
              </button>
              <button
                onClick={() => setShowAddCategory(false)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount ({categoryType})
            </label>
            <input
              type="text"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder={amountPlaceholderByType(categoryType)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>
        
        <div className="flex space-x-2 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-3 py-2 text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
          >
            {editingEntry ? <Save className="w-3 h-3 mr-1" /> : <PlusCircle className="w-3 h-3 mr-1" />}
            {editingEntry ? 'Update' : 'Add Activity'}
          </button>
          
          {editingEntry && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </button>
          )}
        </div>
        
        {/* Examples hint */}
        <div className="text-xs text-gray-500 pt-1 border-t">
          <span className="font-medium">Examples:</span> Time: "1h 30m" or "90min" or "1:30" • Distance: "5km" or "3.2mi" or "1500m"
        </div>
      </form>
    </div>
  );
}