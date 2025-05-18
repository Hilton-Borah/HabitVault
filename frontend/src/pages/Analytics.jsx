import { useState, useEffect } from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import usePreferencesStore from '../store/userPreferences';
import api from '../utils/axios';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Analytics() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const darkMode = usePreferencesStore((state) => state.darkMode);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await api.get('https://habitvault-backend-js12.onrender.com/api/habits');
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`p-6 ${darkMode ? 'dark' : ''}`}>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Analytics
        </h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Track your progress and identify patterns
        </p>
      </div>

      {habits.length === 0 ? (
        <div className={`text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
          <div className="max-w-sm mx-auto">
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No habits to analyze
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Start tracking habits to see your analytics!
            </p>
          </div>
        </div>
      ) : (
        <AnalyticsDashboard habits={habits} />
      )}
    </div>
  );
} 