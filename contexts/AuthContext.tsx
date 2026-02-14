
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { mockApi } from '../services/mockApi';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: Partial<User>) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('medintellicare_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    const result = await mockApi.login(email, password);
    
    if (result.success && result.user) {
      setUser(result.user);
      localStorage.setItem('medintellicare_user', JSON.stringify(result.user));
      return { success: true };
    }
    
    return { success: false, message: result.message };
  };

  const register = async (data: Partial<User>) => {
    try {
      const res = await mockApi.signup(data);
      return { success: true, message: res.message };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medintellicare_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
