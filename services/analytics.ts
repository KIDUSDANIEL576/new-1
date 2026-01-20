import { Pharmacy, PharmacyPlan, Sale, User, AuditLog, InventoryItem } from '../types';

export class AnalyticsEngine {
  /**
   * Calculate Monthly Recurring Revenue (MRR)
   */
  static calculateMRR(pharmacies: Pharmacy[]): number {
    const planPrices: Record<string, number> = {
      [PharmacyPlan.BASIC]: 49,
      [PharmacyPlan.STANDARD]: 99,
      [PharmacyPlan.PLATINUM]: 149,
    };
    
    return pharmacies
      .filter(p => p.status === 'Active' || p.status === 'Expiring')
      .reduce((sum, p) => sum + (planPrices[p.plan] || 0), 0);
  }
  
  /**
   * Calculate Annual Recurring Revenue (ARR)
   */
  static calculateARR(mrr: number): number {
    return mrr * 12;
  }
  
  /**
   * Calculate Sales Trends
   */
  static calculateSalesTrend(sales: Sale[], days: number = 7): { name: string; sales: number }[] {
    const trend: Record<string, number> = {};
    const lastDays = Array.from({ length: days }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    lastDays.forEach(day => {
      trend[day] = sales
        .filter(s => s.date === day)
        .reduce((sum, s) => sum + s.totalPrice, 0);
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return lastDays.map(day => ({
      name: dayNames[new Date(day).getDay()],
      sales: trend[day] || 0
    }));
  }

  /**
   * Calculate Top Selling Items
   */
  static calculateTopSellingItems(sales: Sale[], limit: number = 5): { name: string; qty: number; price: string }[] {
    const itemStats: Record<string, { qty: number; revenue: number }> = {};
    
    sales.forEach(sale => {
      if (!itemStats[sale.medicineName]) {
        itemStats[sale.medicineName] = { qty: 0, revenue: 0 };
      }
      itemStats[sale.medicineName].qty += sale.quantity;
      itemStats[sale.medicineName].revenue += sale.totalPrice;
    });
    
    return Object.entries(itemStats)
      .map(([name, stats]) => ({
        name,
        qty: stats.qty,
        price: `$${stats.revenue.toFixed(2)}`
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, limit);
  }

  /**
   * Calculate Inventory Stats
   */
  static calculateInventorySummary(inventory: InventoryItem[]) {
    const lowStockCount = inventory.filter(i => i.stock > 0 && i.stock < 10).length;
    const expiringCount = inventory.filter(i => {
      const diff = new Date(i.expiryDate).getTime() - new Date().getTime();
      return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
    }).length;

    return { lowStockCount, expiringCount };
  }
}
