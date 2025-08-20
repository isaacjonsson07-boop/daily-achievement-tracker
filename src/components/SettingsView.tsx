import React, { useState } from 'react';
import { Settings, PlusCircle, Trash2, Edit3, Save, X, ChevronDown, ChevronRight, Clock, MapPin, Hash, Moon, Sun } from 'lucide-react';
import { Category, Converter } from '../types';
import { TYPES, DEFAULT_CONVERTERS } from '../constants';
import { uid } from '../utils/dateUtils';
import { useTheme } from '../hooks/useTheme';

interface SettingsViewProps {
  categories: Category[];
  converters: Converter[];
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateConverters: (converters: Converter[]) => void;
}

export function SettingsView({ categories, converters, onUpdateCategories, onUpdateConverters }: SettingsViewProps) {
  const { theme, toggleTheme } = useTheme();
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [showConverters, setShowConverters] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'Time', displayUnit: 'Auto' });

  const addCategory = () => {
    if (!newCategory.name.trim()) return;
    
    const updated = [...categories, { ...newCategory, name: newCategory.name.trim() }];
    onUpdateCategories(updated);
    setNewCategory({ name: '', type: 'Time', displayUnit: 'Auto' });
  };

  const updateCategory = (index: number, category: Category) => {
    const updated = [...categories];
    updated[index] = category;
    onUpdateCategories(updated);
    setEditingCategoryId(null);
  };

  const deleteCategory = (index: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const updated = categories.filter((_, i) => i !== index);
      onUpdateCategories(updated);
    }
  };

  const resetConverters = () => {
    if (confirm('Reset all unit converters to defaults?')) {
      onUpdateConverters(DEFAULT_CONVERTERS);
    }
  };

  return (
    <div className="space-y-6">
      {/* Appearance Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          {theme === 'dark' ? <Moon className="w-5 h-5 mr-2" /> : <Sun className="w-5 h-5 mr-2" />}
          Appearance
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Dark Mode</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
          </div>
          
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      
      {/* Categories Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Categories
        </h3>
        
        {/* Add New Category */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
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
            <button
              onClick={addCategory}
              disabled={!newCategory.name.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add
            </button>
          </div>
        </div>
        
        {/* Category List */}
        <div className="space-y-2">
          {categories.map((category, index) => (
            <CategoryRow
              key={`${category.name}-${index}`}
              category={category}
              index={index}
              isEditing={editingCategoryId === `${category.name}-${index}`}
              onEdit={() => setEditingCategoryId(`${category.name}-${index}`)}
              onSave={(updatedCategory) => updateCategory(index, updatedCategory)}
              onCancel={() => setEditingCategoryId(null)}
              onDelete={() => deleteCategory(index)}
            />
          ))}
        </div>
      </div>

      {/* Converters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowConverters(!showConverters)}
            className="text-lg font-semibold text-gray-800 dark:text-white flex items-center hover:text-blue-600 transition-colors"
          >
            <Settings className="w-5 h-5 mr-2" />
            Unit Converters
            {showConverters ? <ChevronDown className="w-5 h-5 ml-2" /> : <ChevronRight className="w-5 h-5 ml-2" />}
          </button>
        </div>
        
        {showConverters && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600 dark:text-gray-400">Configure unit conversion factors</p>
              <button
                onClick={resetConverters}
                className="text-sm bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Settings className="w-4 h-4 mr-1" />
                Reset to Defaults
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TYPES.map(type => (
                <div key={type} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h5 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                    {type === 'Time' && <Clock className="w-4 h-4 mr-2 text-blue-500" />}
                    {type === 'Distance' && <MapPin className="w-4 h-4 mr-2 text-emerald-500" />}
                    {type === 'Count' && <Hash className="w-4 h-4 mr-2 text-amber-500" />}
                    {type}
                  </h5>
                  <div className="space-y-2">
                    {converters
                      .filter(c => c.type === type)
                      .map(converter => (
                        <div key={converter.unit} className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 rounded px-3 py-2 border border-gray-100 dark:border-gray-600">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{converter.unit}</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {converter.factorToBase}× {converter.baseUnit}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CategoryRowProps {
  category: Category;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (category: Category) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function CategoryRow({ category, index, isEditing, onEdit, onSave, onCancel, onDelete }: CategoryRowProps) {
  const [editName, setEditName] = useState(category.name);
  const [editType, setEditType] = useState(category.type);
  const [editDisplayUnit, setEditDisplayUnit] = useState(category.displayUnit);

  const handleSave = () => {
    if (!editName.trim()) return;
    onSave({
      name: editName.trim(),
      type: editType,
      displayUnit: editDisplayUnit
    });
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={editType}
          onChange={(e) => setEditType(e.target.value)}
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
        >
          <Save className="w-4 h-4" />
        </button>
        <button
          onClick={onCancel}
          className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="flex-1">
        <span className="font-medium text-gray-800 dark:text-white">{category.name}</span>
        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
          {category.type}
        </span>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onEdit}
          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}