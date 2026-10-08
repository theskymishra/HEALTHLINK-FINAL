import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole, email?: string, password?: string, customName?: string) => Promise<boolean>;
  signup: (role: 'doctor' | 'patient', name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USERS: Record<UserRole, User> = {
  doctor: {
    id: 'DOC-201',
    name: 'Dr. Rahul Sharma',
    email: 'dr.rahul@healthlink.org',
    role: 'Doctor',
    roleKey: 'doctor',
    phone: '+91 98200 12005',
  },
  patient: {
    id: 'PAT-1001',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@healthlink.org',
    role: 'Patient',
    roleKey: 'patient',
    phone: '+91 98201 44521',
  },
  admin: {
    id: 'ADM-001',
    name: 'Healthlink Admin',
    email: 'admin@healthlink.org',
    role: 'Admin',
    roleKey: 'admin',
    phone: '+91 98200 99001',
  },
};

const AUTH_KEY = 'healthlink_v2_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading auth state from storage', e);
    }
    // Default to Healthlink Admin
    return DEMO_USERS.admin;
  });

  const isAuthenticated = !!user;
  const role: UserRole = user?.roleKey || (user?.role === 'Doctor' ? 'doctor' : user?.role === 'Patient' ? 'patient' : 'admin');

  const login = async (selectedRole: UserRole, email?: string, _password?: string, customName?: string): Promise<boolean> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: selectedRole, email, password: _password, customName }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Authentication failed');
    }

    if (data.token) {
      localStorage.setItem('healthlink_jwt_token', data.token);
    }
    if (data.user) {
      setUser(data.user);
      localStorage.setItem(AUTH_KEY, JSON.stringify(data.user));
    }
    return true;
  };

  const signup = async (signupRole: 'doctor' | 'patient', name: string, email: string, password?: string): Promise<boolean> => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: signupRole, name, email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Registration failed');
    }

    if (data.token) {
      localStorage.setItem('healthlink_jwt_token', data.token);
    }
    if (data.user) {
      setUser(data.user);
      localStorage.setItem(AUTH_KEY, JSON.stringify(data.user));
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('healthlink_jwt_token');
  };

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
