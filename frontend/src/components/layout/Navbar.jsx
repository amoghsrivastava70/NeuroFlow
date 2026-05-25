import { Link, useLocation } from 'react-router-dom';
import { BrainCircuit, Moon, Sun } from 'lucide-react';

export default function Navbar({ theme, onToggleTheme }) {
  const location = useLocation();
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Library', path: '/library' },
    { name: 'Dashboard', path: '/dashboard' }
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/20 bg-primary/72 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <BrainCircuit className="text-accent-indigo group-hover:text-accent-teal transition-colors" size={32} />
          <span className="font-display font-bold text-2xl tracking-tight">NeuroFlow</span>
        </Link>
        <div className="flex gap-8 items-center">
          {navLinks.map(link => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`font-medium transition-colors hover:text-text-primary ${location.pathname === link.path ? 'text-accent-indigo' : 'text-text-muted'}`}
            >
              {link.name}
            </Link>
          ))}
          <button
            type="button"
            onClick={onToggleTheme}
            className="theme-surface inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-text-muted transition hover:border-accent-indigo/40 hover:text-text-primary"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} className="text-accent-amber" /> : <Moon size={16} className="text-accent-indigo" />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
