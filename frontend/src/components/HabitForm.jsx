import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import habitStore from '../store/habitStore';
import usePreferencesStore from '../store/userPreferences';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Sunday' },
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
];

export default function HabitForm({ isOpen, onClose, habit = null }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetDays, setTargetDays] = useState(DAYS_OF_WEEK.map(day => day.id));
  const { createHabit, updateHabit, isLoading } = habitStore();
  const darkMode = usePreferencesStore((state) => state.darkMode);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description || '');
      setTargetDays(habit.targetDays);
    }
  }, [habit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const habitData = {
      name,
      description,
      targetDays,
    };

    try {
      if (habit) {
        await updateHabit(habit._id, habitData);
      } else {
        await createHabit(habitData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save habit:', error);
    }
  };

  const toggleDay = (dayId) => {
    setTargetDays(prev => {
      if (prev.includes(dayId)) {
        return prev.filter(id => id !== dayId);
      }
      return [...prev, dayId].sort();
    });
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={`relative transform overflow-hidden rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6`}>
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className={`rounded-md ${darkMode ? 'bg-gray-800 text-gray-400 hover:text-gray-300' : 'bg-white text-gray-400 hover:text-gray-500'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className={`text-lg font-semibold leading-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {habit ? 'Edit Habit' : 'Create New Habit'}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      <div>
                        <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Habit Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500 focus:ring-primary-500' 
                              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                          }`}
                          placeholder="e.g., Morning Exercise"
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Description (Optional)
                        </label>
                        <textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500 focus:ring-primary-500' 
                              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                          }`}
                          placeholder="Add some details about your habit..."
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Target Days
                        </label>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-7">
                          {DAYS_OF_WEEK.map((day) => (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => toggleDay(day.id)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                targetDays.includes(day.id)
                                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                                  : darkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-white text-gray-500 hover:bg-gray-50'
                              } border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                            >
                              {day.name.slice(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                        >
                          {isLoading ? 'Saving...' : habit ? 'Update Habit' : 'Create Habit'}
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className={`mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset sm:mt-0 sm:w-auto ${
                            darkMode
                              ? 'bg-gray-700 text-gray-300 ring-gray-600 hover:bg-gray-600'
                              : 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 