import React from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const getInitials = (n: string) => {
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 dark:border-slate-700 ${className}`}
      />
    );
  }

  // Generates consistent pastel background from name
  const colors = [
    'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300',
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300',
    'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-semibold border border-transparent select-none shrink-0 ${sizeClasses[size]} ${colors[colorIndex]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
