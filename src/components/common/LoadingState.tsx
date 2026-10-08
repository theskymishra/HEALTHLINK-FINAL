import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading records...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 space-y-3 ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-brand-200 dark:border-brand-900 animate-pulse" />
        <div className="w-10 h-10 rounded-full border-2 border-brand-600 dark:border-brand-400 border-t-transparent animate-spin absolute inset-0" />
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
};
