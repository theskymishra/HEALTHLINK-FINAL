import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositiveChange?: boolean;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositiveChange = true,
  icon,
  iconBgColor = 'bg-brand-50 dark:bg-brand-950/40',
  iconColor = 'text-brand-600 dark:text-brand-400',
}) => {
  return (
    <Card className="p-5 relative overflow-hidden" hoverable>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {value}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor} shrink-0`}>
          {icon}
        </div>
      </div>

      {(subtitle || change) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                isPositiveChange
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isPositiveChange ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {change}
            </span>
          )}
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 ml-auto truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
