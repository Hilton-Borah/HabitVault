import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import LogoutConfirmModal from '../components/modals/LogoutConfirmModal';

const About = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleContactClick = () => {
    toast.success('Message sent! We will get back to you soon.');
  };

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    toast.success('Logged out successfully');
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero section */}
      <div className="relative bg-gray-50 dark:bg-gray-800 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              About HabitVault
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              We're on a mission to help people build better habits and transform their lives through consistent action.
            </p>
            <div className="mt-5 flex justify-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 dark:text-gray-300">Welcome, {user?.name}!</span>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="relative py-16 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="prose prose-indigo prose-lg text-gray-500 dark:text-gray-300 mx-auto">
            <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-8">Our Story</h2>
            <p className="text-center mb-12">
              Founded in 2024, HabitVault emerged from a simple observation: building good habits is hard, but it doesn't have to be.
              We believe that with the right tools and support, anyone can transform their life through the power of consistent habits.
            </p>
            
            <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-8">Our Mission</h2>
            <p className="text-center mb-12">
              Our mission is to make habit-building accessible, enjoyable, and effective for everyone. We combine behavioral science
              with modern technology to create a platform that not only tracks habits but helps you understand and improve them.
            </p>

            <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-8">Our Team</h2>
            <p className="text-center mb-12">
              We're a passionate team of developers, designers, and behavioral scientists working together to create the best
              habit-tracking experience possible. Our diverse backgrounds and shared commitment to excellence drive us to
              continuously improve and innovate.
            </p>
          </div>
        </div>
      </div>

      {/* Contact section */}
      <div className="bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Get in touch
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500 dark:text-gray-300">
                Have questions about HabitVault? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>
            <div className="mt-8 lg:mt-0">
              <form className="grid grid-cols-1 gap-y-6" onSubmit={(e) => { e.preventDefault(); handleContactClick(); }}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder="Your name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Message
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder="Your message"
                    ></textarea>
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Send message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default About; 