import { useEffect } from 'react';
import usePreferencesStore from '../store/userPreferences';

const ThemeProvider = ({ children }) => {
  const { darkMode } = usePreferencesStore();

  useEffect(() => {
    // Apply the theme class to the document root
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Add class to prevent theme flash
    document.documentElement.classList.add('theme-transitioning');
  }, [darkMode]);

  // Add transition class to prevent theme flash
  useEffect(() => {
    document.documentElement.classList.add('theme-transitioning');
    const timeout = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return children;
};

export default ThemeProvider; 