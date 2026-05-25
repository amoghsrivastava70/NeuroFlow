import { useEffect, useState } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import DashboardPage from './pages/DashboardPage';
import LibraryPage from './pages/LibraryPage';
import LoginPage from './pages/LoginPage';
import { clearStoredUser, getStoredUser, storeUser } from './lib/auth';

const STORAGE_KEY = 'neuroflow-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const location = useLocation();
  const [theme, setTheme] = useState(getInitialTheme);
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleLogin = (nextUser) => {
    storeUser(nextUser);
    setUser(nextUser);
  };

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {user ? <Navbar theme={theme} onToggleTheme={toggleTheme} user={user} onLogout={handleLogout} /> : null}
      {/* Framer motion wrapper for page transitions */}
      <AnimatePresence mode="wait">
        <Routes key={location.pathname} location={location}>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} />} />
          <Route path="/" element={<ProtectedRoute user={user}><HomePage /></ProtectedRoute>} />
          <Route path="/study/:youtubeId" element={<ProtectedRoute user={user}><StudyPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute user={user}><DashboardPage /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute user={user}><LibraryPage /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
