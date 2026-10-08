import React, { useState, useEffect } from 'react';
import {
  User,
  Sun,
  Moon,
  Bell,
  Lock,
  Shield,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  // Profile Form State
  const [name, setName] = useState(user?.name || 'Administrator');
  const [email, setEmail] = useState(user?.email || 'admin@healthlink.org');
  const [phone, setPhone] = useState(user?.phone || '+91 98200 99001');
  const [role, setRole] = useState(user?.role || 'Admin');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Notification Preferences State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [billingUpdates, setBillingUpdates] = useState(false);
  const [dailySummary, setDailySummary] = useState(true);

  // Security Placeholders State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Profile details updated successfully', 'success');
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      showToast('Please fill all password fields', 'error');
      return;
    }
    showToast('Password credentials updated successfully', 'success');
    setCurrentPass('');
    setNewPass('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          System & Account Settings
        </h1>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
          Hospital portal preferences, credentials, and notification settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Appearance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Profile */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  User Profile
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage account identifiers and hospital access details
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Display Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
                <Input
                  label="Hospital Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@healthlink.org"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Direct Contact Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                />
                <Input
                  label="System Role"
                  value={role}
                  disabled
                  helperText="Role permissions configured by hospital policy"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" type="submit" leftIcon={<Save className="w-4 h-4" />}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Section 2: Appearance (Light / Dark Mode) */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Appearance & Display
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customize theme colors and persistent UI preferences
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  showToast('Light mode active', 'info');
                }}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  theme === 'light'
                    ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/40 dark:bg-slate-800'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-amber-500">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Light Mode</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Crisp, clean clinical aesthetic for daylight environments
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  showToast('Dark mode active', 'info');
                }}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  theme === 'dark'
                    ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-950/40'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sky-400">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Dark Mode</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    High contrast dark palette for reduced eye strain during shifts
                  </p>
                </div>
              </button>
            </div>
          </Card>

          {/* Section 3: Notifications */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Notification Preferences
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure clinical alerts and administrative event updates
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Urgent Clinical Alerts via Email</p>
                  <p className="text-slate-500 dark:text-slate-400">Immediate notifications for critical triage or lab anomalies</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Appointment Reminders</p>
                  <p className="text-slate-500 dark:text-slate-400">Daily schedule briefings and rescheduling alerts</p>
                </div>
                <input
                  type="checkbox"
                  checked={appointmentReminders}
                  onChange={(e) => setAppointmentReminders(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Billing & Payment Clearing</p>
                  <p className="text-slate-500 dark:text-slate-400">Settlement alerts for invoices and insurance approvals</p>
                </div>
                <input
                  type="checkbox"
                  checked={billingUpdates}
                  onChange={(e) => setBillingUpdates(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Daily Executive Summary</p>
                  <p className="text-slate-500 dark:text-slate-400">Nightly email report summarizing OPD volume and revenue</p>
                </div>
                <input
                  type="checkbox"
                  checked={dailySummary}
                  onChange={(e) => setDailySummary(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </Card>
        </div>

        {/* Right Column: Security Placeholders & System Compliance */}
        <div className="space-y-6">
          {/* Section 4: Security Placeholders */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Security & Access
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Authentication controls & portal protection
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSecurity} className="space-y-3.5">
              <Input
                label="Current Password"
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
              />
              <Input
                label="New Password"
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                helperText="Min 8 characters with numbers & symbols"
              />
              <Button variant="outline" size="sm" type="submit" className="w-full">
                Change Password
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Two-Factor Auth (2FA)</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Time-based OTP token security</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showToast(
                      !twoFactorEnabled ? '2FA Enabled (Mock placeholder)' : '2FA Disabled',
                      'info'
                    );
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    twoFactorEnabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* System & Data Security Compliance Card */}
          <Card className="p-6 space-y-4 bg-gradient-to-br from-brand-50/50 to-tealbrand-50/20 dark:from-slate-900 dark:to-brand-950/30 border-brand-200/80 dark:border-brand-900/60">
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
              <Shield className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                System & Data Security
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>HEALTHLINK</strong> operates under standardized healthcare confidentiality and clinical management guidelines:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-800 dark:text-slate-200">Role-Based Access Control</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Granular privileges for Doctors, Patients, and Administrative Staff</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-800 dark:text-slate-200">Clinical Audit Logging</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Timestamped encounter tracking for all diagnostic records and invoices</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-800 dark:text-slate-200">Patient Data Confidentiality</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Encrypted data handling compliant with digital healthcare guidelines</p>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>System Status: All clinical services operational</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
