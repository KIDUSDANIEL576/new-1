
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, PharmacyPlan, PatientPlan } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
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

  const login = async (email: string, role: UserRole) => {
    // In a real app, this would query the backend users table
    const mockUser: User = {
      id: `u-${Math.random().toString(36).substr(2, 9)}`,
      email,
      name: email.split('@')[0],
      role,
      plan: role === UserRole.PHARMACY_ADMIN ? PharmacyPlan.PLATINUM : 
            role === UserRole.PATIENT ? PatientPlan.PAID : undefined,
      pharmacyId: role.includes('Pharmacy') || role === UserRole.PHARMACIST ? 'pharm-1' : undefined,
      patientStatus: role === UserRole.PATIENT ? 'active' : undefined,
      createdAt: new Date().toISOString()
    };

    // Patient status checks from spec 7.1
    if (role === UserRole.PATIENT) {
      // Simulate status check logic
      const status: any = 'active'; // This would be fetched from DB
      if (status === 'pending_approval') {
        return { success: false, message: "Your account is under review. Please wait for admin approval." };
      }
      if (status === 'rejected') {
        return { success: false, message: "Your account was not approved. Contact support if needed." };
      }
    }

    setUser(mockUser);
    localStorage.setItem('medintellicare_user', JSON.stringify(mockUser));
    return { success: true };
  };

  const register = async (data: Partial<User>) => {
    // Mock registration logic from spec 7.2
    return { success: true, message: "Registration successful! Your account is under review." };
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
