import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePreferencesStore = create(
  persist(
    (set) => ({
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      timeRange: 'week',
      showDailyQuote: true,

      toggleDarkMode: () => 
        set((state) => {
          const newDarkMode = !state.darkMode;
          // Ensure the class is updated
          if (newDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { darkMode: newDarkMode };
        }),
      setTimeRange: (range) => set({ timeRange: range }),
      toggleDailyQuote: () => set((state) => ({ showDailyQuote: !state.showDailyQuote })),
    }),
    {
      name: 'user-preferences',
      getStorage: () => localStorage,
      onRehydrateStorage: () => (state) => {
        // When the store is rehydrated from localStorage, ensure the theme is applied
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
  )
);

export default usePreferencesStore; 