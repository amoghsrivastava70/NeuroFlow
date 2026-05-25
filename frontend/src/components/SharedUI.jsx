import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = "inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gradient-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] hover:-translate-y-0.5",
    secondary: "bg-card border border-border/30 text-text-primary hover:bg-card-hover hover:border-accent-indigo/45",
    danger: "bg-accent-rose/10 text-accent-rose border border-accent-rose/30 hover:bg-accent-rose/20"
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    success: "bg-accent-teal/10 text-accent-teal border-accent-teal/20",
    warning: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
    error: "bg-accent-rose/10 text-accent-rose border-accent-rose/20",
    default: "bg-accent-indigo/10 text-accent-indigo border-accent-indigo/20",
    neutral: "bg-card-hover/80 text-text-muted border-border/20"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-card-hover rounded-xl ${className}`} />
);

export const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center glass-card">
    <div className="p-4 bg-accent-indigo/10 rounded-full mb-4">
      <Icon size={40} className="text-accent-indigo" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-text-muted mb-6 max-w-md">{subtitle}</p>
    {action}
  </div>
);

export const ErrorMessage = ({ message, onRetry }) => (
  <div className="p-6 bg-accent-rose/10 border border-accent-rose/20 rounded-xl flex items-start gap-4 shadow-[0_18px_50px_rgba(225,29,72,0.12)]">
    <AlertCircle className="text-accent-rose shrink-0 mt-1" />
    <div className="flex-1">
      <h4 className="font-bold text-accent-rose mb-1">Error Processing Request</h4>
      <p className="text-sm mb-4 text-text-muted">{message}</p>
      {onRetry && (
        <Button variant="danger" onClick={onRetry} className="py-2 px-4 text-sm">
          <RefreshCw size={16} className="mr-2" /> Retry
        </Button>
      )}
    </div>
  </div>
);
