import { useState } from 'react';
import toast from 'react-hot-toast';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        className="flex justify-between items-center w-full py-6 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-gray-900 dark:text-white">{question}</span>
        <span className="ml-6">
          <svg
            className={`w-6 h-6 transform ${isOpen ? 'rotate-180' : ''} text-gray-500 dark:text-gray-300 transition-transform duration-200`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        className={`${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden transition-all duration-300`}
      >
        <div className="pb-6 pr-6">
          <p className="text-gray-600 dark:text-gray-300">{answer}</p>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "What is HabitVault?",
      answer: "HabitVault is a powerful habit tracking platform that helps you build and maintain positive habits. It combines behavioral science with modern technology to make habit-building accessible, enjoyable, and effective."
    },
    {
      question: "How does habit tracking work?",
      answer: "Our habit tracking system allows you to define habits, set reminders, and track your progress daily. You can visualize your progress through beautiful charts and analytics, helping you stay motivated and identify patterns in your behavior."
    },
    {
      question: "Is there a mobile app available?",
      answer: "We're currently developing mobile apps for both iOS and Android platforms. Sign up for our newsletter to be notified when they're available!"
    },
    {
      question: "Can I track multiple habits at once?",
      answer: "Yes! You can track unlimited habits simultaneously. We recommend starting with 2-3 habits to build momentum and gradually adding more as you become comfortable with your routine."
    },
    {
      question: "How much does it cost?",
      answer: "HabitVault offers a generous free tier that includes basic habit tracking and analytics. Our premium plans start at $5/month and include advanced features like detailed analytics, priority support, and custom reminders."
    },
    {
      question: "Can I export my data?",
      answer: "Yes, you can export your habit data in various formats (CSV, JSON, PDF) for personal analysis or backup purposes. We believe in data portability and giving you complete control over your information."
    }
  ];

  const handleContactSupport = () => {
    toast.success('Support request received! We\'ll get back to you soon.', {
      icon: '📧',
      duration: 4000,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl animate-fade-in">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 animate-fade-in-up">
            Can't find what you're looking for? Feel free to{' '}
            <button
              onClick={handleContactSupport}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium hover:underline focus:outline-none"
            >
              contact our support team
            </button>
            .
          </p>
        </div>

        <div className="mt-12 space-y-0 animate-fade-in-up">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
            Still have questions?{' '}
            <a
              href="mailto:support@habitvault.com"
              className="ml-2 font-semibold hover:underline"
            >
              Email us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ; 