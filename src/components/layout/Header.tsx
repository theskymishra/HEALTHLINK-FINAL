import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  Bell,
  Menu,
  ChevronDown,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Derive page title from current route and authenticated role
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';

    if (role === 'doctor') {
      if (path === '/appointments') return 'My Appointments';
      if (path === '/patients') return 'My Patients';
      if (path.startsWith('/patients/')) return 'Patient Clinical Profile';
      if (path === '/medical-records') return 'Medical Records';
      if (path === '/settings') return 'Doctor Settings & Profile';
      return 'Doctor Portal';
    }

    if (role === 'patient') {
      if (path === '/appointments') return 'My Appointments';
      if (path === '/medical-records') return 'My Medical Records';
      if (path === '/billing') return 'Billing';
      if (path === '/settings') return 'Account Settings & Profile';
      return 'Patient Portal';
    }

    // Default Admin titles
    if (path.startsWith('/patients/')) return 'Patient Details';
    if (path === '/patients') return 'Patients';
    if (path.startsWith('/doctors/')) return 'Doctor Profile';
    if (path === '/doctors') return 'Doctors';
    if (path === '/appointments') return 'Appointments';
    if (path === '/medical-records') return 'Medical Records';
    if (path === '/billing') return 'Billing';
    if (path === '/settings') return 'Settings';
    return 'Hospital Management System';
  };

  const getPortalSubtitle = () => {
    if (role === 'doctor') return 'HEALTHLINK Clinical Practice Portal';
    if (role === 'patient') return 'HEALTHLINK Personal Healthcare Portal';
    return 'HEALTHLINK Hospital Management Portal';
  };

  const notifications = role === 'patient'
    ? [
        { id: 1, title: 'Appointment with Dr. Rahul Sharma confirmed for Tomorrow', time: '10m ago', unread: true },
        { id: 2, title: 'New Lab Report available: Comprehensive Lipid Panel', time: '1d ago', unread: true },
        { id: 3, title: 'Invoice INV-2026-1041 marked as Paid', time: '3d ago', unread: false },
      ]
    : role === 'doctor'
    ? [
        { id: 1, title: 'New Appointment booked: Priya Sharma (10:00 AM)', time: '15m ago', unread: true },
        { id: 2, title: 'Lab report uploaded for Aarav Mehta (Lipid Panel)', time: '45m ago', unread: true },
        { id: 3, title: 'Clinical notes pending sign-off for 2 encounters', time: '2h ago', unread: false },
      ]
    : [
        { id: 1, title: 'New Appointment booked across hospital OPD', time: '10m ago', unread: true },
        { id: 2, title: 'Lab report uploaded for Aarav Mehta', time: '45m ago', unread: true },
        { id: 3, title: 'Invoice INV-2026-1041 marked as Paid', time: '2h ago', unread: false },
      ];

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-theme px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
            {getPortalSubtitle()}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Light/Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative focus:outline-none"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setShowNotifications(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Notifications
                </span>
                <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    {n.unread && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 mt-1 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge with Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800 hover:opacity-90 transition-opacity focus:outline-none cursor-pointer"
            aria-label="User profile menu"
          >
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {user?.name || 'User'}
              </span>
              <span className="block text-[10px] text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {user?.role || 'User'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block ml-0.5" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Settings</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
