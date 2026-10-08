import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarDays,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Activity,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  // Role-aware navigation definitions per requirements
  const getNavItems = () => {
    if (role === 'doctor') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Appointments', path: '/appointments', icon: CalendarDays },
        { name: 'My Patients', path: '/patients', icon: Users },
        { name: 'Medical Records', path: '/medical-records', icon: FileText },
        { name: 'Settings', path: '/settings', icon: Settings },
      ];
    }
    if (role === 'patient') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Appointments', path: '/appointments', icon: CalendarDays },
        { name: 'My Medical Records', path: '/medical-records', icon: FileText },
        { name: 'Billing', path: '/billing', icon: CreditCard },
        { name: 'Settings', path: '/settings', icon: Settings },
      ];
    }
    // Default Admin navigation
    return [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Patients', path: '/patients', icon: Users },
      { name: 'Doctors', path: '/doctors', icon: UserCheck },
      { name: 'Appointments', path: '/appointments', icon: CalendarDays },
      { name: 'Medical Records', path: '/medical-records', icon: FileText },
      { name: 'Billing', path: '/billing', icon: CreditCard },
      { name: 'Settings', path: '/settings', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800">
        <NavLink
          to="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-tealbrand-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              HEALTH<span className="text-brand-600 dark:text-brand-400">LINK</span>
            </span>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 -mt-0.5">
              {role === 'doctor' ? 'Doctor Portal' : role === 'patient' ? 'Patient Portal' : 'Hospital Admin'}
            </p>
          </div>
        </NavLink>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Main Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User profile & Logout */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user?.role || 'User'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
