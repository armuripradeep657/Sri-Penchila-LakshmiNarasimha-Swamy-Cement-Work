'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, code: string, name?: string, email?: string, firmName?: string) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
  updateProfile: (profileData: { name?: string; email?: string; firmName?: string; phone?: string }) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('pcp_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setToken(savedToken);
      const res = await api.getMe();
      if (res?.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.warn('Session expired or invalid, clearing');
      localStorage.removeItem('pcp_token');
      localStorage.removeItem('pcp_user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (
    phone: string,
    code: string,
    name?: string,
    email?: string,
    firmName?: string
  ): Promise<User> => {
    const res = await api.verifyOtp(phone, code, name, email, firmName);
    if (res.accessToken && res.user) {
      localStorage.setItem('pcp_token', res.accessToken);
      localStorage.setItem('pcp_user', JSON.stringify(res.user));
      setToken(res.accessToken);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Authentication failed');
  };

  const updateProfile = async (profileData: {
    name?: string;
    email?: string;
    firmName?: string;
    phone?: string;
  }): Promise<User> => {
    const res = await api.updateProfile(profileData);
    if (res?.user) {
      setUser(res.user);
      localStorage.setItem('pcp_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error('Failed to update profile');
  };

  const logout = () => {
    localStorage.removeItem('pcp_token');
    localStorage.removeItem('pcp_user');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAdmin,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
