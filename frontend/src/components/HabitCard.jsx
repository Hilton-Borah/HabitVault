import { useState } from 'react';
import { CheckIcon, XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import habitStore from '../store/habitStore';

export default function HabitCard({ habit }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { checkIn } = habitStore();

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayCheckIn = habit.checkIns.find(
    checkIn => format(new Date(checkIn.date), 'yyyy-MM-dd') === todayStr
  );

  const handleCheckIn = async (status) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await checkIn(habit._id, today.toISOString(), status);
    } catch (error) {
      console.error('Failed to check in:', error);
    }
    setIsUpdating(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{habit.name}</h3>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                {format(new Date(habit.startDate), 'MMM d, yyyy')}
              </div>
            </div>
            {habit.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{habit.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCheckIn('completed')}
              disabled={isUpdating}
              className={`p-2 rounded-full ${
                todayCheckIn?.status === 'completed'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
            >
              <CheckIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleCheckIn('missed')}
              disabled={isUpdating}
              className={`p-2 rounded-full ${
                todayCheckIn?.status === 'missed'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-500 dark:text-gray-400">
              Current streak: <span className="font-medium text-gray-700 dark:text-gray-300">{habit.streaks.current}</span>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Best streak: <span className="font-medium text-gray-700 dark:text-gray-300">{habit.streaks.longest}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 