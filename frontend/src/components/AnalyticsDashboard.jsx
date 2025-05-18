import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  ChartBarIcon,
  CheckCircleIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import usePreferencesStore from '../store/userPreferences';
import { 
  format, 
  subDays,
  subMonths,
  eachDayOfInterval, 
  startOfDay,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO
} from 'date-fns';

export default function AnalyticsDashboard({ habits }) {
  const [stats, setStats] = useState({
    totalHabits: 0,
    completionRate: 0,
    bestHabit: null,
    habitsByCompletion: [],
    progressData: [],
    highestStreak: null,
    habitWithHighestStreak: null,
    bestCurrentStreak: null,
    habitWithBestCurrentStreak: null
  });

  const darkMode = usePreferencesStore((state) => state.darkMode);
  const timeRange = usePreferencesStore((state) => state.timeRange);

  useEffect(() => {
    if (!habits?.length) return;

    const today = startOfDay(new Date());
    let startDate;
    
    if (timeRange === 'week') {
      startDate = subDays(today, 6);
    } else {
      startDate = startOfMonth(today);
    }

    const dateInterval = {
      start: startDate,
      end: today
    };

    // Calculate completion rates and find best streaks for each habit
    const habitStats = habits.map(habit => {
      const filteredCheckIns = habit.checkIns.filter(ci => 
        isWithinInterval(new Date(ci.date), dateInterval)
      );
      
      const total = filteredCheckIns.length;
      const completed = filteredCheckIns.filter(ci => ci.status === 'completed').length;
      const rate = total > 0 ? (completed / total) * 100 : 0;
      
      return {
        name: habit.name,
        completionRate: rate,
        currentStreak: habit.streaks.current,
        longestStreak: habit.streaks.longest
      };
    });

    // Find best performing habit
    const bestHabit = habitStats.reduce((best, current) => 
      current.completionRate > (best?.completionRate || 0) ? current : best
    , null);

    // Find highest streak
    const highestStreak = Math.max(...habitStats.map(h => h.longestStreak));
    const habitWithHighestStreak = habitStats.find(h => h.longestStreak === highestStreak);

    // Find best current streak
    const bestCurrentStreak = Math.max(...habitStats.map(h => h.currentStreak));
    const habitWithBestCurrentStreak = habitStats.find(h => h.currentStreak === bestCurrentStreak);

    // Calculate overall completion rate
    const overallRate = habitStats.reduce((sum, curr) => sum + curr.completionRate, 0) / habitStats.length;

    // Prepare data for pie chart with better formatting
    const habitsByCompletion = habitStats
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5) // Only show top 5 habits
      .map(h => ({
        name: h.name.length > 15 ? h.name.substring(0, 15) + '...' : h.name,
        value: h.completionRate
      }));

    // Calculate dynamic progress data
    const dateRange = eachDayOfInterval({ start: startDate, end: today });
    
    const progressData = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOfWeek = new Date(date).getDay();

      const scheduledHabits = habits.filter(habit => 
        habit.targetDays.includes(dayOfWeek)
      ).length;

      const completedHabits = habits.reduce((count, habit) => {
        if (!habit.targetDays.includes(dayOfWeek)) return count;
        
        const isCompleted = habit.checkIns.some(ci => 
          format(new Date(ci.date), 'yyyy-MM-dd') === dateStr && 
          ci.status === 'completed'
        );
        
        return count + (isCompleted ? 1 : 0);
      }, 0);

      return {
        date: format(date, timeRange === 'week' ? 'EEE' : 'dd'),
        fullDate: format(date, 'MMM dd'),
        scheduled: scheduledHabits,
        completed: completedHabits
      };
    });

    setStats({
      totalHabits: habits.length,
      completionRate: overallRate,
      bestHabit,
      habitsByCompletion,
      progressData,
      highestStreak,
      habitWithHighestStreak,
      bestCurrentStreak,
      habitWithBestCurrentStreak
    });
  }, [habits, timeRange]);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const subTextColor = darkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className={`${cardBg} rounded-xl shadow-lg p-6 transition-transform hover:scale-105`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${subTextColor}`}>Total Habits</p>
              <p className={`text-3xl font-bold mt-2 text-primary-600`}>{stats.totalHabits}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <ChartBarIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        
        <div className={`${cardBg} rounded-xl shadow-lg p-6 transition-transform hover:scale-105`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${subTextColor}`}>Completion Rate</p>
              <p className={`text-3xl font-bold mt-2 text-green-600`}>
                {stats.completionRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`${cardBg} rounded-xl shadow-lg p-6 transition-transform hover:scale-105`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${subTextColor}`}>Best Performing</p>
              <p className={`text-xl font-bold mt-2 text-blue-600 truncate max-w-[180px]`}>
                {stats.bestHabit?.name || 'N/A'}
              </p>
              {stats.bestHabit && (
                <p className={`text-sm ${subTextColor} mt-1`}>
                  {stats.bestHabit.completionRate.toFixed(1)}% completion
                </p>
              )}
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <StarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        {/* <div className={`${cardBg} rounded-xl shadow-lg p-6 transition-transform hover:scale-105`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${subTextColor}`}>Highest Streak</p>
              <p className={`text-3xl font-bold mt-2 text-amber-600`}>
                {stats.highestStreak || 0}
              </p>
              {stats.habitWithHighestStreak && (
                <p className={`text-sm ${subTextColor} mt-1 truncate max-w-[180px]`}>
                  {stats.habitWithHighestStreak.name}
                </p>
              )}
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <TrophyIcon className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div> */}

        <div className={`${cardBg} rounded-xl shadow-lg p-6 transition-transform hover:scale-105`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${subTextColor}`}>Current Streak</p>
              <p className={`text-3xl font-bold mt-2 text-purple-600`}>
                {stats.bestCurrentStreak || 0}
              </p>
              {stats.habitWithBestCurrentStreak && (
                <p className={`text-sm ${subTextColor} mt-1 truncate max-w-[180px]`}>
                  {stats.habitWithBestCurrentStreak.name}
                </p>
              )}
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <ArrowTrendingUpIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Chart */}
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className={`text-lg font-semibold ${textColor}`}>
              {timeRange === 'week' ? 'Weekly' : format(new Date(), 'MMMM')} Progress
            </h3>
            <div className="flex gap-6 items-center">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${darkMode ? 'bg-blue-400 opacity-30' : 'bg-blue-200'}`}></div>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Scheduled Habits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${darkMode ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Completed</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={stats.progressData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                barGap={0}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(107, 114, 128, 0.2)'} 
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  stroke={darkMode ? '#9CA3AF' : '#4B5563'}
                  tick={{ 
                    fontSize: 12,
                    fill: darkMode ? '#9CA3AF' : '#4B5563',
                  }}
                  tickLine={false}
                  axisLine={false}
                  interval={timeRange === 'week' ? 0 : 1}
                  dy={10}
                />
                <YAxis 
                  stroke={darkMode ? '#9CA3AF' : '#4B5563'}
                  tick={{ 
                    fontSize: 12,
                    fill: darkMode ? '#9CA3AF' : '#4B5563',
                  }}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: darkMode ? 'rgba(55, 65, 81, 0.2)' : 'rgba(229, 231, 235, 0.4)' }}
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1F2937' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    padding: '8px 12px',
                  }}
                  labelStyle={{
                    color: darkMode ? '#E5E7EB' : '#374151',
                    fontWeight: '500',
                    marginBottom: '4px',
                  }}
                  itemStyle={{
                    color: darkMode ? '#9CA3AF' : '#4B5563',
                    fontSize: '12px',
                  }}
                  formatter={(value, name, props) => {
                    const labels = {
                      scheduled: 'Scheduled',
                      completed: 'Completed'
                    };
                    return [`${value} ${labels[name]}`, props.payload.fullDate];
                  }}
                />
                <Bar 
                  dataKey="scheduled" 
                  fill={darkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(59, 130, 246, 0.15)'}
                  radius={[4, 4, 0, 0]}
                  name="scheduled"
                  maxBarSize={50}
                />
                <Bar 
                  dataKey="completed" 
                  fill={darkMode ? '#60A5FA' : '#3B82F6'}
                  radius={[4, 4, 0, 0]}
                  name="completed"
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={`mt-6 flex justify-between items-center ${darkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'} rounded-lg p-4`}>
            <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Today's Progress
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <div className={`text-2xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {stats.progressData[stats.progressData.length - 1]?.scheduled || 0}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Scheduled
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {stats.progressData[stats.progressData.length - 1]?.completed || 0}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Completed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Habits Distribution */}
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <h3 className={`text-lg font-semibold mb-6 ${textColor}`}>Top 5 Habits by Completion</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.habitsByCompletion}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ value }) => `${value.toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.habitsByCompletion.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={darkMode ? COLORS[index % COLORS.length] : COLORS[index % COLORS.length]}
                      stroke={darkMode ? '#1F2937' : 'white'}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1F2937' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    padding: '8px 12px',
                    color: darkMode ? '#FFFFFF' : '#374151'
                  }}
                  itemStyle={{
                    color: darkMode ? '#FFFFFF' : '#374151'
                  }}
                  formatter={(value, name) => [
                    `${value.toFixed(1)}% completion`,
                    name
                  ]}
                />
                <Legend 
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm font-medium`}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}