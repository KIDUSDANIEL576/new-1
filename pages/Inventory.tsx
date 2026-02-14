
import React, { useState, useEffect } from 'react';
// Added Link import to fix error on line 115
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { InventoryItem, PharmacyPlan, InventoryCategory } from '../types';
import { geminiService } from '../services/geminiService';
import { 
  Plus, Search, Filter, Brain, AlertCircle, 
  Trash2, Edit, Upload, X, Download, Package
} from 'lucide-react';

const CATEGORIES: InventoryCategory[] = [
  'Medicine', 'Painkiller', 'Antibiotic', 'Antiviral',
  'Antihistamine', 'Vitamin', 'Cosmetics', 'Supplies', 'Other'
];

const Inventory: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ category: 'All', stock: 'All' });

  useEffect(() => {
    // Added brandName property to all mock items
    const mockItems: InventoryItem[] = [
      { id: '1', pharmacyId: 'pharm-1', medicineName: 'Amoxicillin', brandName: 'GSK', category: 'Antibiotic', stock: 5, expiryDate: '2024-12-01', costPrice: 12, price: 18, batchNumber: 'B123', brand: 'GSK', sku: 'AMX-001' },
      { id: '2', pharmacyId: 'pharm-1', medicineName: 'Paracetamol', brandName: 'Dolo', category: 'Painkiller', stock: 120, expiryDate: '2025-05-15', costPrice: 2, price: 5, batchNumber: 'B456', brand: 'Dolo', sku: 'PAR-002' },
      { id: '3', pharmacyId: 'pharm-1', medicineName: 'Ibuprofen', brandName: 'Advil', category: 'Painkiller', stock: 45, expiryDate: '2024-11-20', costPrice: 5, price: 9, batchNumber: 'B789', brand: 'Advil', sku: 'IBU-003' },
      { id: '4', pharmacyId: 'pharm-1', medicineName: 'Metformin', brandName: 'Glucophage', category: 'Medicine', stock: 8, expiryDate: '2025-01-10', costPrice: 15, price: 25, batchNumber: 'B101', brand: 'Glucophage', sku: 'MET-004' },
    ];
    setItems(mockItems);
  }, []);

  const getAIPredictions = async () => {
    if (user?.plan !== PharmacyPlan.PLATINUM) return;
    setLoadingAI(true);
    const mockSales = items.map(i => ({
      id: Math.random().toString(),
      pharmacyId: i.pharmacyId,
      medicineName: i.medicineName,
      quantity: Math.floor(Math.random() * 50),
      totalPrice: 100,
      date: '2023-10-24',
      profitMargin: 20,
      soldBy: 'system',
      timestamp: new Date().toISOString()
    }));
    const res = await geminiService.predictRestock(items, mockSales);
    setPredictions(res);
    setLoadingAI(false);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeFilters.category === 'All' || item.category === activeFilters.category;
    const matchesStock = activeFilters.stock === 'All' || 
                        (activeFilters.stock === 'Low' && item.stock < 10) ||
                        (activeFilters.stock === 'Out' && item.stock === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const getLimit = () => {
    if (user?.plan === PharmacyPlan.BASIC) return 200;
    if (user?.plan === PharmacyPlan.STANDARD) return 300;
    return Infinity;
  };

  const limitReached = items.length >= getLimit();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 font-medium">Tracking {items.length} / {getLimit() === Infinity ? 'Unlimited' : getLimit()} items.</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.plan === PharmacyPlan.PLATINUM && (
            <button 
              onClick={getAIPredictions}
              disabled={loadingAI}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl shadow-xl transition-all flex items-center gap-2"
            >
              <Brain size={20} className={loadingAI ? 'animate-spin' : ''} />
              AI Insights
            </button>
          )}
          {user?.plan !== PharmacyPlan.BASIC && (
            <button 
              onClick={() => setShowImportModal(true)}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              title="Bulk Import"
            >
              <Upload size={20} />
            </button>
          )}
          <button 
            onClick={() => !limitReached && setShowAddModal(true)}
            disabled={limitReached}
            className={`font-black px-6 py-3 rounded-2xl shadow-xl transition-all flex items-center gap-2 ${
              limitReached ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Plus size={20} />
            {limitReached ? 'Limit Reached' : 'Add Item'}
          </button>
        </div>
      </div>

      {limitReached && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 animate-in fade-in duration-300">
           <AlertCircle size={20} />
           <p className="text-sm font-bold uppercase tracking-wide">You have reached the {user?.plan} plan limit of {getLimit()} items. <Link to="/subscription" className="underline font-black">Upgrade now</Link> for more capacity.</p>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search catalog..." 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={activeFilters.category}
              onChange={(e) => setActiveFilters({...activeFilters, category: e.target.value})}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-100 transition-all">
              <Download size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">Medicine & SKU</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4 text-center">Stock Level</th>
                <th className="px-8 py-4">Unit Price</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div>
                      <p className="font-black text-slate-900">{item.medicineName}</p>
                      <span className="text-[10px] font-black uppercase text-slate-400">SKU: {item.sku}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <p className={`text-lg font-black ${item.stock < 10 ? 'text-rose-600' : 'text-slate-900'}`}>{item.stock}</p>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-900">${item.price}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 text-slate-400 hover:text-blue-600"><Edit size={18} /></button>
                      <button className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                <h3 className="text-2xl font-black">Register Medicine</h3>
                <button onClick={() => setShowAddModal(false)}><X size={24} /></button>
             </div>
             <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Medicine Name</label>
                  <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl" placeholder="Paracetamol" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase">Initial Stock</label>
                    <input type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase">Price ($)</label>
                    <input type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl" />
                  </div>
                </div>
                <button className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all">Complete Entry</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;