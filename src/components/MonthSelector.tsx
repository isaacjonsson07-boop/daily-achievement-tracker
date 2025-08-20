import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fmtDateISO, startOfMonth } from '../utils/dateUtils';

interface MonthSelectorProps {
  month: string;
  onMonthChange: (month: string) => void;
}

export function MonthSelector({ month, onMonthChange }: MonthSelectorProps) {
  const currentMonth = new Date(month + "T00:00:00");
  
  const goToPrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    onMonthChange(fmtDateISO(prev));
  };
  
  const goToNextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    onMonthChange(fmtDateISO(next));
  };
  
  const goToCurrentMonth = () => {
    onMonthChange(fmtDateISO(startOfMonth()));
  };

  const formatMonthYear = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {formatMonthYear(month)}
          </h2>
          <button
            onClick={goToCurrentMonth}
            className="text-sm text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 transition-colors"
          >
            Go to current month
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}