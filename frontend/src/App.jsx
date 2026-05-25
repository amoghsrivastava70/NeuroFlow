import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import DashboardPage from './pages/DashboardPage';
import LibraryPage from './pages/LibraryPage';

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      {/* Framer motion wrapper for page transitions */}
      <AnimatePresence mode="wait">
        <Routes key={location.pathname} location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/study/:youtubeId" element={<StudyPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/library" element={<LibraryPage />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
