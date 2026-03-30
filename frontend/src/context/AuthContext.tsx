import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { users as mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('be_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('be_user'); }
    }
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    const found = mockUsers.find(u => u.email === email);
    if (found) {
      setUser(found);
      localStorage.setItem('be_user', JSON.stringify(found));
      localStorage.setItem('be_token', 'mock-jwt-token');
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, _password: string): Promise<boolean> => {
    const newUser: User = { id: Date.now(), name, email, role: 'user', created_at: new Date().toISOString() };
    setUser(newUser);
    localStorage.setItem('be_user', JSON.stringify(newUser));
    localStorage.setItem('be_token', 'mock-jwt-token');
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('be_user');
    localStorage.removeItem('be_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAdmin: user?.role === 'admin', login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
