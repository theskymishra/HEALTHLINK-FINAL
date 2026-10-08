import React from 'react';
import { getStatusBadgeColor } from '../../utils/formatters';

interface BadgeProps {
  status?: string;
  variant?: 'status' | 'primary' | 'secondary' | 'neutral';
  children: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant = 'status',
  children,
  showDot = true,
  className = '',
}) => {
  if (status || variant === 'status') {
    const { bg, text, border, dot } = getStatusBadgeColor(status || String(children));
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${bg} ${text} ${border} ${className}`}
      >
        {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />}
        {children}
      </span>
    );
  }

  const styles = {
    primary: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800',
    secondary: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
