
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnalyticsEngine } from '../services/analytics';
import { useAuth } from './AuthContext';
import { UserRole, Sale, InventoryItem } from '../types';

interface AnalyticsContextType {
  salesTrend: { name: string; sales: number }[];
  topItems: { name: string; qty: number; price: string }[];
  mrr: number;
  loading: boolean;
  refresh: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [salesTrend, setSalesTrend] = useState<{ name: string; sales: number }[]>([]);
  const [topItems, setTopItems] = useState<{ name: string; qty: number; price: string }[]>([]);
  const [mrr, setMrr] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = () => {
    if (!user) return;
    setLoading(true);
    
    // Simulate data loading
    // Fixed: Removed profitMargin as it is not present in the Sale interface
    const mockSales: Sale[] = [
      { id: '1', pharmacyId: 'pharm-1', medicineName: 'Paracetamol', quantity: 45, totalPrice: 472.5, date: new Date().toISOString().split('T')[0] },
      { id: '2', pharmacyId: 'pharm-1', medicineName: 'Amoxicillin', quantity: 32, totalPrice: 800, date: new Date().toISOString().split('T')[0] },
    ];

    setSalesTrend(AnalyticsEngine.calculateSalesTrend(mockSales));
    setTopItems(AnalyticsEngine.calculateTopSellingItems(mockSales));
    setMrr(4550); // Hardcoded for demo
    setLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  return (
    <AnalyticsContext.Provider value={{ salesTrend, topItems, mrr, loading, refresh: loadAnalytics }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return context;
};
