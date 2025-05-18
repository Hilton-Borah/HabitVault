import { create } from 'zustand';
import axios from 'axios';
import { isToday, isSameDay, parseISO, addDays, differenceInDays } from 'date-fns';

const habitStore = create((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,
  stats: null,
  trends: null,
  rankings: null,

  calculateStreaks: (habit) => {
    const checkIns = [...habit.checkIns].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakActive = true;
    let tempStreak = 0;

    // Calculate current streak from most recent check-in
    for (let i = checkIns.length - 1; i >= 0; i--) {
      const checkIn = checkIns[i];
      const checkInDate = new Date(checkIn.date);
      const isCompleted = checkIn.status === 'completed';
      
      if (isToday(checkInDate) && isCompleted) {
        if (currentStreakActive) currentStreak++;
      }
      else if (isCompleted) {
        if (currentStreakActive) {
          currentStreak++;
        }
      } else {
        currentStreakActive = false;
      }
    }

    // Calculate longest streak by checking all check-ins
    for (let i = 0; i < checkIns.length; i++) {
      const currentCheckIn = checkIns[i];
      const nextCheckIn = checkIns[i + 1];
      
      if (currentCheckIn.status === 'completed') {
        tempStreak++;
        
        if (nextCheckIn) {
          const currentDate = new Date(currentCheckIn.date);
          const nextDate = new Date(nextCheckIn.date);
          const daysDifference = differenceInDays(nextDate, currentDate);
          
          // If there's a gap or next check-in is not completed, end the streak
          if (daysDifference > 1 || nextCheckIn.status !== 'completed') {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 0;
          }
        } else {
          // For the last check-in
          longestStreak = Math.max(longestStreak, tempStreak);
        }
      } else {
        // Reset temp streak if current check-in is not completed
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }

    return {
      current: currentStreak,
      longest: longestStreak
    };
  },

  updateStreaks: (habit) => {
    const { calculateStreaks } = get();
    const streaks = calculateStreaks(habit);
    return {
      ...habit,
      streaks: {
        ...habit.streaks,
        ...streaks
      }
    };
  },

  fetchHabits: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get('https://habitvault-backend-js12.onrender.com/api/habits');
      // Calculate streaks for each habit
      const habitsWithStreaks = response.data.map(get().updateStreaks);
      set({ habits: habitsWithStreaks, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch habits',
        isLoading: false
      });
    }
  },

  createHabit: async (habitData) => {
    set({ isLoading: true });
    try {
      const response = await axios.post('https://habitvault-backend-js12.onrender.com/api/habits', habitData);
      const habitWithStreaks = get().updateStreaks(response.data);
      set(state => ({
        habits: [...state.habits, habitWithStreaks],
        isLoading: false
      }));
      return habitWithStreaks;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create habit',
        isLoading: false
      });
      throw error;
    }
  },

  updateHabit: async (habitId, habitData) => {
    set({ isLoading: true });
    try {
      const response = await axios.put(`https://habitvault-backend-js12.onrender.com/api/habits/${habitId}`, habitData);
      const habitWithStreaks = get().updateStreaks(response.data);
      set(state => ({
        habits: state.habits.map(h => h._id === habitId ? habitWithStreaks : h),
        isLoading: false
      }));
      return habitWithStreaks;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update habit',
        isLoading: false
      });
      throw error;
    }
  },

  deleteHabit: async (habitId) => {
    set({ isLoading: true });
    try {
      await axios.delete(`https://habitvault-backend-js12.onrender.com/api/habits/${habitId}`);
      set(state => ({
        habits: state.habits.filter(h => h._id !== habitId),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete habit',
        isLoading: false
      });
      return false;
    }
  },

  checkIn: async (habitId, date, status) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`https://habitvault-backend-js12.onrender.com/api/habits/${habitId}/check-in`, {
        date,
        status
      });
      
      // Calculate new streaks after check-in
      const habitWithStreaks = get().updateStreaks(response.data);
      
      // Update the habit with new data including updated streaks
      set(state => ({
        habits: state.habits.map(h => 
          h._id === habitId ? habitWithStreaks : h
        ),
        isLoading: false
      }));
      
      return habitWithStreaks;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to check in',
        isLoading: false
      });
      return null;
    }
  },

  fetchStats: async () => {
    try {
      const response = await axios.get('https://habitvault-backend-js12.onrender.com/api/analytics/stats');
      set({ stats: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch stats' });
      return null;
    }
  },

  fetchTrends: async (timeRange = 'week') => {
    try {
      const response = await axios.get(`https://habitvault-backend-js12.onrender.com/api/analytics/trends?timeRange=${timeRange}`);
      set({ trends: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch trends' });
      return null;
    }
  },

  fetchRankings: async () => {
    try {
      const response = await axios.get('https://habitvault-backend-js12.onrender.com/api/analytics/ranking');
      set({ rankings: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch rankings' });
      return null;
    }
  },

  clearError: () => set({ error: null })
}));

export default habitStore; 