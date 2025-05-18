import { useState, useEffect } from 'react';
import usePreferencesStore from '../store/userPreferences';

const quotes = [
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
];

export default function DailyQuote() {
  const [quote, setQuote] = useState(null);
  const showDailyQuote = usePreferencesStore((state) => state.showDailyQuote);

  useEffect(() => {
    // Get today's date as string to use as seed
    const today = new Date().toISOString().split('T')[0];
    
    // Use the date string to generate a consistent index for the day
    const index = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % quotes.length;
    
    setQuote(quotes[index]);
  }, []);

  if (!showDailyQuote || !quote) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 mb-6">
      <blockquote className="text-gray-800 dark:text-gray-200">
        <p className="text-lg font-medium mb-2">"{quote.text}"</p>
        <footer className="text-gray-600 dark:text-gray-400">— {quote.author}</footer>
      </blockquote>
    </div>
  );
} 