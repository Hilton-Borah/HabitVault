import { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isToday,
  isPast
} from 'date-fns';
import { CheckIcon, XMarkIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

// Get the saved view preference or default to 'month'
const getSavedView = () => {
  try {
    return localStorage.getItem('habitViewPreference') || 'month';
  } catch {
    return 'month';
  }
};

export default function HabitHeatmap({ habits, onHabitStatusChange }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState([]);
  const [view, setView] = useState(getSavedView);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingHabit, setEditingHabit] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null); // Track which habit is being updated
  const [darkMode, setDarkMode] = useState(false);

  // Save view preference whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('habitViewPreference', view);
    } catch (error) {
      console.error('Error saving view preference:', error);
    }
  }, [view]);

  useEffect(() => {
    let start, end;
    
    if (view === 'month') {
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
    } else {
      start = startOfWeek(currentDate, { weekStartsOn: 0 });
      end = endOfWeek(currentDate, { weekStartsOn: 0 });
    }
    
    const daysInRange = eachDayOfInterval({ start, end });
    setDays(daysInRange);
  }, [currentDate, view]);

  // Reset selected date to today when changing months/weeks
  useEffect(() => {
    const today = new Date();
    const isCurrentPeriod = view === 'month' 
      ? today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear()
      : days.some(day => isSameDay(day, today));

    if (isCurrentPeriod) {
      setSelectedDate(today);
    }
  }, [currentDate, view, days]);

  const getHabitStatus = (habit, date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return habit.checkIns.find(checkIn => {
      const checkInDate = new Date(checkIn.date);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate.getTime() === targetDate.getTime();
    })?.status || null;
  };

  const getHabitsForDay = (day) => {
    const targetDate = new Date(day);
    targetDate.setHours(0, 0, 0, 0);
    
    return habits
      .filter(habit => {
        // Check if the day is after or equal to the habit's start date
        const habitStartDate = new Date(habit.startDate);
        habitStartDate.setHours(0, 0, 0, 0);
        return targetDate >= habitStartDate;
      })
      .map(habit => {
        const isTargetDay = habit.targetDays.includes(day.getDay());
        const checkIn = habit.checkIns.find(ci => {
          const checkInDate = new Date(ci.date);
          checkInDate.setHours(0, 0, 0, 0);
          return checkInDate.getTime() === targetDate.getTime();
        });
        
        return {
          ...habit,
          isTargetDay,
          status: checkIn ? checkIn.status : (isTargetDay ? 'unmarked' : 'non-target')
        };
      }).filter(habit => habit.isTargetDay);
  };

  const getDayStatus = (day) => {
    // Disable future dates
    if (!isPast(day) && !isToday(day)) return 'future';
    
    // Get habits that have started by this day
    const dayHabits = getHabitsForDay(day);
    
    if (dayHabits.length === 0) return 'no-habits';
    
    const completedHabits = dayHabits.filter(h => h.status === 'completed');
    if (completedHabits.length === dayHabits.length) return 'all-completed';
    if (completedHabits.length > 0) return 'partially-completed';
    return 'none-completed';
  };

  const getColorClass = (status) => {
    switch (status) {
      case 'all-completed':
        return 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-600';
      case 'partially-completed':
        return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500 dark:border-yellow-600';
      case 'none-completed':
        return 'bg-red-50 dark:bg-red-900/30 border-red-500 dark:border-red-600';
      case 'future':
        return 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-50';
      case 'no-habits':
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const previous = () => {
    if (view === 'month') {
      setCurrentDate(prev => subMonths(prev, 1));
    } else {
      setCurrentDate(prev => subWeeks(prev, 1));
    }
  };

  const next = () => {
    if (view === 'month') {
      setCurrentDate(prev => addMonths(prev, 1));
    } else {
      setCurrentDate(prev => addWeeks(prev, 1));
    }
  };

  const getDateRangeText = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      if (format(weekStart, 'MMM yyyy') === format(weekEnd, 'MMM yyyy')) {
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd, yyyy')}`;
      }
      return `${format(weekStart, 'MMM d, yyyy')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    }
  };

  const getEmptyCells = () => {
    if (view === 'month') {
      const firstDay = startOfMonth(currentDate);
      const emptyDays = firstDay.getDay();
      return Array(emptyDays).fill(null);
    }
    return [];
  };

  const emptyCells = getEmptyCells();

  const handleStatusChange = async (habitId, date, status) => {
    try {
      setUpdatingStatus(habitId); // Set updating status
      // Convert to local midnight
      const localDate = new Date(date);
      localDate.setHours(0, 0, 0, 0);
      await onHabitStatusChange(habitId, localDate, status);
      setEditingHabit(null);
    } finally {
      setUpdatingStatus(null); // Clear updating status
    }
  };

  const handleStatusChangeClear = async (habitId, date, status) => {
    try {
      // setUpdatingStatus(habitId); // Set updating status
      // // Convert to local midnight
      // const localDate = new Date(date);
      // localDate.setHours(0, 0, 0, 0);
      // await onHabitStatusChange(habitId, localDate, status);
      setEditingHabit(null);
    } finally {
      setUpdatingStatus(null); // Clear updating status
    }
  };

  const HabitStatusChangePopover = ({ habit, date }) => (
    <div className="absolute z-50 mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-2 -translate-x-1/2 left-1/2">
      <div className="flex space-x-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChange(habit._id, date, 'completed');
          }}
          className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 transition-colors"
          title="Mark as completed"
          disabled={updatingStatus === habit._id}
        >
          <CheckIcon className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChange(habit._id, date, 'missed');
          }}
          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors"
          title="Mark as missed"
          disabled={updatingStatus === habit._id}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChangeClear(habit._id, date, null);
          }}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-colors"
          title="Clear status"
          disabled={updatingStatus === habit._id}
        >
          ×
        </button>
      </div>
    </div>
  );

  const handleViewChange = (newView) => {
    setView(newView);
    // If switching view and today is visible in the new view, select it
    const today = new Date();
    if (newView === 'month' && 
        today.getMonth() === currentDate.getMonth() && 
        today.getFullYear() === currentDate.getFullYear()) {
      setSelectedDate(today);
    } else if (newView === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      if (today >= weekStart && today <= weekEnd) {
        setSelectedDate(today);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Calendar Section */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleViewChange('month')}
                className={`px-2 py-1 rounded-md text-sm ${
                  view === 'month'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Show monthly view"
              >
                Monthly
              </button>
              <button
                onClick={() => handleViewChange('week')}
                className={`px-2 py-1 rounded-md text-sm ${
                  view === 'week'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Show weekly view"
              >
                Weekly
              </button>
            </div>
            <QuestionMarkCircleIcon 
              className="h-4 w-4 text-gray-400 cursor-help"
              title="Green: All habits completed&#10;Yellow: Some habits completed&#10;Red: No habits completed&#10;Click on any date to see details"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
            <button
              onClick={previous}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-1.5 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title={`Previous ${view}`}
            >
              ←
            </button>
            <h3 className="text-sm font-semibold min-w-[120px] text-center dark:text-gray-200">
              {getDateRangeText()}
            </h3>
            <button
              onClick={next}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-1.5 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title={`Next ${view}`}
            >
              →
            </button>
          </div>
        </div>

        <div className="min-w-[280px] overflow-x-auto">
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-gray-500 dark:text-gray-400 font-medium pb-1">
                {day}
              </div>
            ))}
            
            {view === 'month' && emptyCells.map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}
            
            {days.map((day, i) => {
              const dayStatus = getDayStatus(day);
              const isSelected = selectedDate && isSameDay(selectedDate, day);
              const dayHabits = getHabitsForDay(day);
              const isTodays = isToday(day);
              const isFuture = !isPast(day) && !isToday(day);
              
              return (
                <button
                  key={i}
                  onClick={() => isFuture ? null : setSelectedDate(isSelected ? null : day)}
                  className={`aspect-square p-0.5 rounded-md border transition-all relative
                    ${getColorClass(dayStatus)}
                    ${isSelected ? 'ring-2 ring-primary-500 dark:ring-primary-400' : 'hover:border-primary-300 dark:hover:border-primary-500'}
                    ${dayHabits.length > 0 ? 'cursor-pointer' : 'cursor-default'}
                    ${isTodays ? 'ring-2 ring-primary-300 dark:ring-primary-500' : ''}
                    dark:text-gray-200`}
                  disabled={isFuture}
                  title={`${format(day, 'MMMM d, yyyy')}${dayHabits.length > 0 ? 
                    `\nHabits completed: ${dayHabits.filter(h => h.status === 'completed').length}/${dayHabits.length}` 
                    : '\nNo habits scheduled'}${isTodays ? '\n(Today)' : ''}`}
                >
                  <div className="h-full w-full flex flex-col items-center justify-center">
                    <span className={`text-xs font-medium ${
                      isTodays 
                        ? 'text-primary-700 dark:text-primary-400' 
                        : darkMode 
                          ? 'text-gray-200' 
                          : 'text-gray-700'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {dayHabits.length > 0 && (
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {dayHabits.filter(h => h.status === 'completed').length}/{dayHabits.length}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Date Details Card */}
      {selectedDate && (
        <div className="w-full lg:w-52 border-t lg:border-l lg:border-t-0 pt-4 lg:pt-0 lg:pl-4 mt-4 lg:mt-0">
          <h3 className="font-medium text-sm mb-3 flex items-center justify-between text-gray-900 dark:text-gray-100">
            {format(selectedDate, 'MMMM d, yyyy')}
            {isPast(selectedDate) && !isToday(selectedDate) && (
              <QuestionMarkCircleIcon 
                className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-help"
                title="Click on any habit to change its status for this date"
              />
            )}
          </h3>
          
          <div className="space-y-3">
            {(!isPast(selectedDate) && !isToday(selectedDate)) ? (
              <p className="text-gray-500 dark:text-gray-400 text-xs">Future date - no status available</p>
            ) : (
              <>
                <div className="space-y-1.5">
                  <h4 className="font-medium text-sm text-green-600 dark:text-green-400">Completed</h4>
                  {getHabitsForDay(selectedDate)
                    .filter(h => getHabitStatus(h, selectedDate) === 'completed')
                    .map(habit => (
                      <div 
                        key={habit._id} 
                        className={`flex items-center text-xs relative group cursor-pointer ${
                          updatingStatus === habit._id ? 'opacity-50' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPast(selectedDate) && !updatingStatus) {
                            setEditingHabit(editingHabit?._id === habit._id ? null : habit);
                          }
                        }}
                      >
                        <CheckIcon className="h-3 w-3 text-green-500 dark:text-green-400 mr-1.5" />
                        <span className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                          {habit.name}
                        </span>
                        {editingHabit?._id === habit._id && !updatingStatus && (
                          <HabitStatusChangePopover habit={habit} date={selectedDate} />
                        )}
                      </div>
                    ))}
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-medium text-sm text-red-600 dark:text-red-400">Incomplete</h4>
                  {getHabitsForDay(selectedDate)
                    .filter(h => getHabitStatus(h, selectedDate) !== 'completed')
                    .map(habit => (
                      <div 
                        key={habit._id} 
                        className={`flex items-center text-xs relative group cursor-pointer ${
                          updatingStatus === habit._id ? 'opacity-50' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPast(selectedDate) && !updatingStatus) {
                            setEditingHabit(editingHabit?._id === habit._id ? null : habit);
                          }
                        }}
                      >
                        <XMarkIcon className="h-3 w-3 text-red-500 dark:text-red-400 mr-1.5" />
                        <span className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                          {habit.name}
                        </span>
                        {editingHabit?._id === habit._id && !updatingStatus && (
                          <HabitStatusChangePopover habit={habit} date={selectedDate} />
                        )}
                      </div>
                    ))}
                </div>

                {getHabitsForDay(selectedDate).length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs">No habits scheduled for this day</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 