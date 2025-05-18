import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import PublicLayout from './Layout';
import DashboardLayout from './DashboardLayout';

const RootLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Define routes that should use the dashboard layout
  const dashboardRoutes = ['/dashboard', '/habits', '/analytics', '/settings'];
  const shouldUseDashboardLayout = isAuthenticated && dashboardRoutes.some(route => location.pathname.startsWith(route));

  if (shouldUseDashboardLayout) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return <PublicLayout>{children}</PublicLayout>;
};

export default RootLayout; 