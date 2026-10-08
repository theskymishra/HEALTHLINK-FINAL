import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, User as UserIcon, Stethoscope, Shield, HeartPulse } from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { UserRole } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { LiveBackground } from '../components/common/LiveBackground';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [signUpRole, setSignUpRole] = useState<'doctor' | 'patient'>('patient');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState(DEMO_USERS.admin.email);
  const [password, setPassword] = useState('securePass123');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Switch role during Login mode
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(DEMO_USERS[role].email);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      if (!password || password.length < 4) {
        setError('Please enter a password (min 4 characters)');
        return;
      }

      setLoading(true);
      try {
        await signup(signUpRole, name, email, password);
        showToast(`Account created! Welcome to HEALTHLINK, ${name}.`, 'success');
        navigate('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      if (!password || password.length < 4) {
        setError('Please enter a password (min 4 characters)');
        return;
      }

      setLoading(true);
      try {
        await login(selectedRole, email, password);
        const loggedUser = DEMO_USERS[selectedRole];
        showToast(`Welcome back, ${loggedUser.name}! Signed in as ${loggedUser.role}.`, 'success');
        navigate('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to authenticate. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-theme overflow-hidden">
      {/* Live Interactive Background */}
      <LiveBackground />

      {/* Top Bar with theme switch */}
      <div className="relative z-10 flex items-center justify-between max-w-6xl w-full mx-auto py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-tealbrand-500 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            HEALTH<span className="text-brand-600 dark:text-brand-400">LINK</span>
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors backdrop-blur-xs"
          title="Toggle Theme"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      {/* Main Login / Sign Up Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-2xl p-8 sm:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 mb-1">
              <Activity className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              HEALTH<span className="text-brand-600 dark:text-brand-400">LINK</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Smart Hospital Management, Simplified.
            </p>
          </div>

          {/* Role Selection Tabs */}
          {!isSignUp ? (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                Select Portal Access Role
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('doctor')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                    selectedRole === 'doctor'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Doctor</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('patient')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                    selectedRole === 'patient'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Patient</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                    selectedRole === 'admin'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSignUpRole('doctor')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                    signUpRole === 'doctor'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Doctor Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSignUpRole('patient')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                    signUpRole === 'patient'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Patient Account</span>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={signUpRole === 'doctor' ? 'Dr. Sunita Rao' : 'Aarav Mehta'}
                leftIcon={<UserIcon className="w-4 h-4" />}
                required
              />
            )}

            <Input
              label={isSignUp ? 'Email Address' : `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Email Address`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@healthlink.org"
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <Input
              label="Access Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
            />

            {error && (
              <div className="p-3 text-xs rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 font-medium">
                {error}
              </div>
            )}

            {!isSignUp && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() => showToast('Password reset instructions will be sent to your registered email.', 'info')}
                  className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 text-sm font-bold shadow-md"
              isLoading={loading}
            >
              {isSignUp ? 'Create Account & Sign In' : `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            </Button>
          </form>

          {/* Sign In / Sign Up Toggle */}
          <div className="text-center pt-1 border-t border-slate-100 dark:border-slate-800">
            {isSignUp ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                  }}
                  className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setName('');
                    setEmail('');
                    setError('');
                  }}
                  className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                >
                  Sign Up
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-3 text-xs text-slate-400 dark:text-slate-500">
        HEALTHLINK &copy; {new Date().getFullYear()} — Smart Hospital Management System. All rights reserved.
      </footer>
    </div>
  );
};
