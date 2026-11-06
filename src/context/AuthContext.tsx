import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  quickLogin: (targetRole: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hirehub_token'));
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.warn('Failed to fetch authenticated user profile', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('hirehub_token', access_token);
    setToken(access_token);
    setUser(userData);
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('hirehub_token', access_token);
    setToken(access_token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('hirehub_token');
    localStorage.removeItem('hirehub_user');
    setToken(null);
    setUser(null);
  };

  const quickLogin = async (targetRole: UserRole) => {
    let email = 'alex.candidate@example.com';
    let pass = 'password123';

    if (targetRole === 'recruiter') {
      email = 'sarah.recruiter@technova.io';
      pass = 'password123';
    } else if (targetRole === 'admin') {
      email = 'admin@hirehub.com';
      pass = 'admin123';
    }

    await login(email, pass);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isLoading,
        login,
        register,
        logout,
        quickLogin,
        refreshUser,
      }}
    >
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
