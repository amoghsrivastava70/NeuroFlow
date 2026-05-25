import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LockKeyhole, UserRound, BrainCircuit, ArrowRight, Moon, Sun, BadgeCheck, Eye, EyeOff } from 'lucide-react';
import { loginUser, signupUser } from '../lib/api';
import { Badge, Button, ErrorMessage } from '../components/SharedUI';

const initialLoginForm = {
  username: '',
  password: '',
};

const initialSignupForm = {
  fullName: '',
  username: '',
  password: '',
};

export default function LoginPage({ onLogin, theme, onToggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('signup');
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [signupForm, setSignupForm] = useState(initialSignupForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const targetPath = location.state?.from || '/';

  const isLogin = mode === 'login';
  const activeForm = isLogin ? loginForm : signupForm;

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setShowPassword(false);
  };

  const updateForm = (key, value) => {
    if (isLogin) {
      setLoginForm((currentForm) => ({ ...currentForm, [key]: value }));
    } else {
      setSignupForm((currentForm) => ({ ...currentForm, [key]: value }));
    }
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = isLogin
        ? await loginUser(loginForm)
        : await signupUser(signupForm);

      onLogin(response.data.user);
      navigate(targetPath, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.error
        || (isLogin ? 'Unable to log in with that account.' : 'Unable to create your account right now.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-80 [mask-image:radial-gradient(ellipse_at_center,white,transparent_85%)]" />
      <div className="absolute -top-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-indigo/15 blur-3xl" />
      <div className="absolute right-6 top-6 z-20">
        <button
          type="button"
          onClick={onToggleTheme}
          className="theme-surface inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-text-muted transition hover:border-accent-indigo/40 hover:text-text-primary"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} className="text-accent-amber" /> : <Moon size={16} className="text-accent-indigo" />}
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </div>

      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_0.95fr]"
        >
          <section className="glass-card flex flex-col justify-center p-8 md:p-12">
            <Badge variant="default" className="mb-6">
              <BrainCircuit size={14} className="inline mr-2 -mt-0.5" />
              {isLogin ? 'Returning User' : 'Create Account'}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-xl">
              {isLogin ? (
                <>Log back into your <span className="bg-clip-text text-transparent bg-gradient-primary">personal study space</span></>
              ) : (
                <>Start a <span className="bg-clip-text text-transparent bg-gradient-primary">new study identity</span></>
              )}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-text-muted">
              {isLogin
                ? 'Sign in with the username and password already stored in Neon to load your own library, dashboard, and quiz history.'
                : 'New users should sign up first. Your credentials will be stored in Neon, and every video, dashboard stat, and study session will stay linked to your account.'}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!isLogin ? 'bg-accent-indigo text-white shadow-[0_0_18px_rgba(59,130,246,0.35)]' : 'theme-surface text-text-muted hover:text-text-primary'}`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isLogin ? 'bg-accent-indigo text-white shadow-[0_0_18px_rgba(59,130,246,0.35)]' : 'theme-surface text-text-muted hover:text-text-primary'}`}
              >
                Login
              </button>
            </div>
          </section>

          <section className="glass-card p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">{isLogin ? 'Welcome back' : 'Create your account'}</h2>
              <p className="mt-2 text-text-muted">
                {isLogin
                  ? 'Enter the credentials you used when signing up.'
                  : 'Choose your identity once. After signup, that account becomes the owner of your future library and dashboard data.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-text-muted">Full Name</span>
                  <div className="relative">
                    <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint" size={18} />
                    <input
                      value={activeForm.fullName}
                      onChange={(event) => updateForm('fullName', event.target.value)}
                      className="w-full rounded-2xl border border-border/25 bg-card/90 py-4 pl-12 pr-4 outline-none transition placeholder:text-text-faint focus:border-accent-indigo"
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                  </div>
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-text-muted">Username</span>
                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint" size={18} />
                  <input
                    value={activeForm.username}
                    onChange={(event) => updateForm('username', event.target.value)}
                    className="w-full rounded-2xl border border-border/25 bg-card/90 py-4 pl-12 pr-4 outline-none transition placeholder:text-text-faint focus:border-accent-indigo"
                    placeholder="Enter username"
                    autoComplete="username"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-text-muted">Password</span>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={activeForm.password}
                    onChange={(event) => updateForm('password', event.target.value)}
                    className="w-full rounded-2xl border border-border/25 bg-card/90 py-4 pl-12 pr-14 outline-none transition placeholder:text-text-faint focus:border-accent-indigo"
                    placeholder={isLogin ? 'Enter password' : 'Choose a password'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((currentValue) => !currentValue)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-faint transition hover:text-text-primary"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {!isLogin ? <p className="mt-2 text-xs text-text-faint">Use at least 6 characters.</p> : null}
              </label>

              {error ? <ErrorMessage message={error} /> : null}

              <Button type="submit" disabled={submitting} className="w-full justify-center py-4">
                {submitting
                  ? (isLogin ? 'Signing in...' : 'Creating account...')
                  : (isLogin ? 'Login to NeuroFlow' : 'Create Account')}
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </form>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
