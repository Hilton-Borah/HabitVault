import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, CalendarIcon, ListBulletIcon, ClockIcon, PencilIcon, TrashIcon, TrophyIcon, FireIcon } from '@heroicons/react/24/outline';
import DailyQuote from '../components/DailyQuote';
import usePreferencesStore from '../store/userPreferences';
import habitStore from '../store/habitStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import HabitForm from '../components/HabitForm';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [editingHabit, setEditingHabit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const darkMode = usePreferencesStore((state) => state.darkMode);
  const { habits, isLoading: loading, fetchHabits, checkIn: handleCheckInStore, deleteHabit } = habitStore();

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Update active tab when habits change
  useEffect(() => {
    if (habits.length === 0 && activeTab === 'due') {
      setActiveTab('all');
    }
  }, [habits, activeTab]);

  const handleCheckIn = async (habitId, status) => {
    try {
      const localDate = new Date();
      localDate.setHours(0, 0, 0, 0);
      
      await handleCheckInStore(habitId, localDate.toISOString(), status);
      toast.success(`Habit ${status === 'completed' ? 'completed' : 'marked as missed'}`);
    } catch (error) {
      console.error('Error updating habit status:', error);
      toast.error('Failed to update habit status');
    }
  };

  const getTodayStatus = (habit) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return habit.checkIns.find(checkIn => {
      const checkInDate = new Date(checkIn.date);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate.getTime() === today.getTime();
    })?.status;
  };

  const isHabitForToday = (habit) => {
    const today = new Date().getDay();
    return habit.targetDays.includes(today);
  };

  const isHabitDueToday = (habit) => {
    const isForToday = isHabitForToday(habit);
    const todayStatus = getTodayStatus(habit);
    return isForToday && (!todayStatus || todayStatus === 'missed');
  };

  const todayHabits = habits.filter(isHabitForToday);
  const dueHabits = habits.filter(isHabitDueToday);
  const displayHabits = activeTab === 'today' 
    ? todayHabits 
    : activeTab === 'due' 
    ? dueHabits 
    : habits;

  const TabButton = ({ tab, label, icon: Icon, count }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
        activeTab === tab
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
          : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`
      }`}
      title={`View ${label.toLowerCase()}`}
    >
      <Icon className="h-5 w-5 mr-2" />
      {label}
      {count !== undefined && (
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
          activeTab === tab
            ? 'bg-primary-200 text-primary-800 dark:bg-primary-800 dark:text-primary-200'
            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  const handleDelete = async () => {
    try {
      await deleteHabit(habitToDelete._id);
      setShowDeleteModal(false);
      setHabitToDelete(null);
      toast.success('Habit deleted successfully');
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Failed to delete habit');
    }
  };

  const getBestStreaks = () => {
    if (!habits.length) return null;

    const longestStreak = Math.max(...habits.map(h => h.streaks.longest));
    const currentBestStreak = Math.max(...habits.map(h => h.streaks.current));
    
    const habitWithLongestStreak = habits.find(h => h.streaks.longest === longestStreak);
    const habitWithCurrentStreak = habits.find(h => h.streaks.current === currentBestStreak);

    return {
      longest: {
        streak: longestStreak,
        habitName: habitWithLongestStreak?.name
      },
      current: {
        streak: currentBestStreak,
        habitName: habitWithCurrentStreak?.name
      }
    };
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
      <DailyQuote className="mb-8" />
      
      {/* Streak Information */}
      {habits.length > 0 && getBestStreaks() && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 flex items-center`}>
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <TrophyIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                Longest Streak
              </h3>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {getBestStreaks().longest.streak} days
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                {getBestStreaks().longest.habitName}
              </p>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 flex items-center`}>
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
              <FireIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                Current Best Streak
              </h3>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {getBestStreaks().current.streak} days
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                {getBestStreaks().current.habitName}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 flex-col sm:flex-row space-y-4 sm:space-y-0">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          My Habits
        </h1>
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-center sm:justify-end">
          <Link
            to="/habits"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            View Calendar
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

      <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 justify-center sm:justify-start">
        {habits.length > 0 && (
          <TabButton
            tab="due"
            label="Due Today"
            icon={ClockIcon}
            count={dueHabits.length}
          />
        )}
        <TabButton
          tab="today"
          label="Today's Habits"
          icon={CalendarIcon}
          count={todayHabits.length}
        />
        <TabButton
          tab="all"
          label="All Habits"
          icon={ListBulletIcon}
          count={habits.length}
        />
      </div>

      {displayHabits.length === 0 ? (
        <div className={`text-center py-8 sm:py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow mx-4 sm:mx-0`}>
          <div className="max-w-sm mx-auto">
            <div className="mb-4">
              <div className="animate-bounce text-4xl mb-4">
                {activeTab === 'due' && habits.length > 0 ? '✅' : '🎉'}
              </div>
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeTab === 'due' && habits.length > 0
                  ? "All habits completed for today!"
                  : activeTab === 'today'
                  ? "No habits scheduled for today"
                  : "No habits created yet"}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                {activeTab === 'due' && habits.length > 0
                  ? "Great job keeping up with your habits!"
                  : activeTab === 'today'
                  ? "Add some habits or check back tomorrow!"
                  : "Start by creating your first habit!"}
              </p>
            </div>
            <Link
              to="/habits/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add New Habit
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {displayHabits.map((habit) => {
            const todayStatus = getTodayStatus(habit);
            const isDue = isHabitDueToday(habit);
            return (
              <div
                key={habit._id}
                className={`${
                  darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                } rounded-lg shadow p-4 sm:p-6 relative ${
                  isDue ? 'border-2 border-yellow-500 dark:border-yellow-600' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="text-base sm:text-lg font-medium truncate">{habit.name}</h3>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        Started {format(new Date(habit.startDate), 'MMM d, yyyy')}
                      </div>
                      {habit.description && (
                        <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleCheckIn(habit._id, 'completed')}
                      className={`p-1.5 rounded-full transition-colors ${
                        todayStatus === 'completed'
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                      }`}
                      title="Mark as completed for today"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleCheckIn(habit._id, 'missed')}
                      className={`p-1.5 rounded-full transition-colors ${
                        todayStatus === 'missed'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                      }`}
                      title="Mark as missed for today"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setEditingHabit(habit);
                        setShowEditModal(true);
                      }}
                      className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      title="Edit habit"
                    >
                      <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setHabitToDelete(habit);
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete habit"
                    >
                      <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
                
                <div className={`mt-4 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      Current Streak
                    </span>
                    <span className="font-medium">
                      {habit.streaks.current} days
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <HabitForm
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingHabit(null);
          fetchHabits();
        }}
        habit={editingHabit}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setHabitToDelete(null);
        }}
        onConfirm={handleDelete}
        habitName={habitToDelete?.name}
      />
    </div>
  );
} 