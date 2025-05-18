import { Routes, Route, Outlet } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Page imports
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import HabitList from '../pages/HabitList';
import NewHabit from '../pages/NewHabit';
import Analytics from '../pages/Analytics';
import Settings from '../pages/Settings';
import Blogs from '../pages/Blogs';
import About from '../pages/About';
import FAQ from '../pages/FAQ';

const PublicLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <div className="flex-grow">
      <Outlet />
    </div>
    <Footer />
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with Navbar and Footer */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/faq" element={<FAQ />} />
      </Route>

      {/* Protected Routes with Dashboard Layout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/habits" element={<HabitList />} />
        <Route path="/habits/new" element={<NewHabit />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* 404 Route with Public Layout */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 