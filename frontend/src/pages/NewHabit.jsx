import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@headlessui/react';
import usePreferencesStore from '../store/userPreferences';
import axios from 'axios';

const DAYS = [
  { name: 'Sunday', value: 0 },
  { name: 'Monday', value: 1 },
  { name: 'Tuesday', value: 2 },
  { name: 'Wednesday', value: 3 },
  { name: 'Thursday', value: 4 },
  { name: 'Friday', value: 5 },
  { name: 'Saturday', value: 6 },
];

export default function NewHabit() {
  const navigate = useNavigate();
  const darkMode = usePreferencesStore((state) => state.darkMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetDays: [1, 2, 3, 4, 5], // Default to weekdays
    startDate: new Date().toISOString().split('T')[0],
    isEveryDay: false
  });

  const toggleDay = (day) => {
    if (formData.isEveryDay) return;
    
    setFormData(prev => {
      const newTargetDays = prev.targetDays.includes(day)
        ? prev.targetDays.filter(d => d !== day)
        : [...prev.targetDays, day];
      return { ...prev, targetDays: newTargetDays };
    });
  };

  const toggleEveryDay = () => {
    setFormData(prev => ({
      ...prev,
      isEveryDay: !prev.isEveryDay,
      targetDays: !prev.isEveryDay ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await axios.post('/api/habits', {
        name: formData.name,
        description: formData.description,
        targetDays: formData.targetDays,
        startDate: formData.startDate
      });
      
      navigate('/habits');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create habit');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Create New Habit
        </h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Add a new habit to track and build consistency
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`bg-white ${darkMode ? 'dark:bg-gray-800' : ''} shadow rounded-lg p-6`}>
          {error && (
            <div className="mb-4 p-4 rounded-md bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {/* Habit Name */}
          <div className="mb-6">
            <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Habit Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                ${darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary-500 focus:border-primary-500' 
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}`}
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                ${darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary-500 focus:border-primary-500' 
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}`}
            />
          </div>

          {/* Every Day Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <span className="flex flex-col">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Every Day
                </span>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Track this habit every day of the week
                </span>
              </span>
              <Switch
                checked={formData.isEveryDay}
                onChange={toggleEveryDay}
                className={`${
                  formData.isEveryDay ? 'bg-primary-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    formData.isEveryDay ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </div>

          {/* Target Days */}
          <div className="mb-6">
            <span className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Target Days
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  disabled={formData.isEveryDay}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-colors
                    ${formData.targetDays.includes(day.value)
                      ? 'bg-primary-100 text-primary-700'
                      : `${darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    ${formData.isEveryDay ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {day.name.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div className="mb-6">
            <label htmlFor="startDate" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                ${darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary-500 focus:border-primary-500' 
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}`}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/habits')}
              className={`py-2 px-4 rounded-md text-sm font-medium
                ${darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 