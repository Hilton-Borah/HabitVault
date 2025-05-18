import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import ThemeProvider from './components/ThemeProvider';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App; 