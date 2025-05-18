import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import HabitHeatmap from '../components/HabitHeatmap';
import usePreferencesStore from '../store/userPreferences';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function HabitList() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const darkMode = usePreferencesStore((state) => state.darkMode);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await axios.get('/api/habits');
      setHabits(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching habits:', error);
      setLoading(false);
    }
  };

  const handleCheckIn = async (habitId, date, status) => {
    try {
      // Convert to local midnight
      const localDate = new Date(date);
      localDate.setHours(0, 0, 0, 0);
      
      const response = await axios.post(`/api/habits/${habitId}/check-in`, {
        date: localDate.toISOString(),
        status: status === 'unmarked' || status === null ? null : status
      });
      
      // Update habits state optimistically
      setHabits(prevHabits => {
        return prevHabits.map(h => {
          if (h._id !== habitId) return h;
          return response.data;
        });
      });

      const statusMessage = status === 'completed' ? 'marked as completed' : 
                          status === 'missed' ? 'marked as missed' : 
                          'status cleared';
      toast.success(`Habit ${statusMessage}`);
    } catch (error) {
      console.error('Error updating habit status:', error);
      toast.error(error.response?.data?.message || 'Failed to update habit status');
      // Refresh habits to ensure consistency
      fetchHabits();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Habit Calendar
        </h1>
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/habits/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Habit
          </Link>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
        <HabitHeatmap 
          habits={habits} 
          onHabitStatusChange={handleCheckIn}
        />
      </div>
    </div>
  );
} 