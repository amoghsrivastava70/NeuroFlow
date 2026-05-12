import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Moon, Sun, Brain } from 'lucide-react';
import Home from './pages/Home';
import Study from './pages/Study';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md border-b border-gray-200 dark:border-navy-800">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-white">
              <Brain className="text-teal-500" /> NeuroFlow
            </Link>
            <div className="flex gap-6 items-center font-medium">
              <Link to="/library" className="hover:text-teal-500 transition">Library</Link>
              <Link to="/dashboard" className="hover:text-teal-500 transition">Dashboard</Link>
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-800">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-6 py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/study/:youtubeId" element={<Study />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}