import { useState } from 'react';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    title: 'The Science of Habit Formation',
    excerpt: 'Understanding how habits work is the first step to building better ones. Learn about the habit loop and how to use it to your advantage.',
    author: 'Dr. Sarah Johnson',
    date: 'March 15, 2024',
    category: 'Science',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 2,
    title: 'Building a Morning Routine That Sticks',
    excerpt: 'A strong morning routine can set you up for success. Discover proven strategies to create and maintain an effective morning ritual.',
    author: 'Michael Chen',
    date: 'March 12, 2024',
    category: 'Lifestyle',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 3,
    title: 'The Power of Atomic Habits',
    excerpt: 'Small changes can lead to remarkable results. Learn how tiny improvements compound into transformative changes.',
    author: 'Emma Wilson',
    date: 'March 10, 2024',
    category: 'Personal Growth',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 4,
    title: 'Breaking Bad Habits: A Comprehensive Guide',
    excerpt: 'Breaking bad habits is just as important as building good ones. Discover effective strategies to overcome unwanted behaviors.',
    author: 'Dr. James Miller',
    date: 'March 8, 2024',
    category: 'Psychology',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  }
];

const categories = ['All', 'Science', 'Lifestyle', 'Personal Growth', 'Psychology'];

const Blogs = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Latest Blog Posts
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
            Insights, tips, and strategies to help you build better habits and live a more fulfilling life.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map(post => (
            <article
              key={post.id}
              className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 bg-white dark:bg-gray-800"
            >
              <div className="flex-shrink-0">
                <img className="h-48 w-full object-cover" src={post.image} alt="" />
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {post.category}
                    </p>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {post.readTime}
                    </p>
                  </div>
                  <Link to={`/blogs/${post.id}`} className="mt-2 block">
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {post.title}
                    </p>
                    <p className="mt-3 text-base text-gray-500 dark:text-gray-300">
                      {post.excerpt}
                    </p>
                  </Link>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <span className="sr-only">{post.author}</span>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                      {post.author[0]}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {post.author}
                    </p>
                    <div className="flex space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <time dateTime={post.date}>{post.date}</time>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center mt-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No posts found</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs; 