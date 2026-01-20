
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { InventoryItem, InventoryCategory } from '../types';
import { RotateCcw, Search, AlertCircle, CheckCircle2, ChevronRight, X } from 'lucide-react';

const StockAdjustment: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('decrease');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const mockInventory: InventoryItem[] = [
    { id: '1', pharmacyId: 'pharm-1', medicineName: 'Amoxicillin', category: 'Antibiotic', stock: 5, expiryDate: '2024-12-01', costPrice: 12, price: 18, batchNumber: 'B123', brand: 'GSK', sku: 'AMX-001' },
    { id: '2', pharmacyId: 'pharm-1', medicineName: 'Paracetamol', category: 'Painkiller', stock: 120, expiryDate: '2025-05-15', costPrice: 2, price: 5, batchNumber: 'B456', brand: 'Dolo', sku: 'PAR-002' },
  ];

  const filteredItems = mockInventory.filter(i => 
    i.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || quantity <= 0 || reason.length < 10) return;
    
    // Simulate API call
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="h-full flex items-center justify-center animate-in zoom-in duration-300">
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl text-center space-y-6 max-w-lg w-full">
           <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
           </div>
           <h2 className="text-3xl font-black text-slate-900">Adjustment Recorded</h2>
           <p className="text-slate-500 font-medium">Stock levels for <strong>{selectedItem?.medicineName}</strong> have been updated and logged in the audit trail.</p>
           <button onClick={() => { setShowSuccess(false); setSelectedItem(null); setQuantity(0); setReason(''); }} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-100">
           <RotateCcw size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Inventory Correction</h1>
          <p className="text-slate-500 font-medium italic">All adjustments are high-severity events and require justification.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
             <h3 className="text-lg font-black text-slate-900">1. Select Medicine</h3>
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search item..." 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedItem?.id === item.id ? 'bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 border-slate-100 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-black">{item.medicineName}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedItem?.id === item.id ? 'text-blue-100' : 'text-slate-400'}`}>Current Stock: {item.stock}</p>
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
           {selectedItem ? (
             <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 animate-in slide-in-from-right-4">
                <h3 className="text-lg font-black text-slate-900">2. Adjustment Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setAdjustmentType('increase')}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                      adjustmentType === 'increase' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-50' : 'bg-slate-50 border-transparent text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl font-black">+</div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Found Items</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAdjustmentType('decrease')}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                      adjustmentType === 'decrease' ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-lg shadow-rose-50' : 'bg-slate-50 border-transparent text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl font-black">−</div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Damage/Theft</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-black text-xl"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Adjustment</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium resize-none"
                    placeholder="Describe why this adjustment is necessary (min 10 chars)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                   <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                   <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-wider">Note: This action will permanently update stock from {selectedItem.stock} to {adjustmentType === 'increase' ? selectedItem.stock + quantity : selectedItem.stock - quantity}.</p>
                </div>

                <div className="flex gap-4">
                   <button type="button" onClick={() => setSelectedItem(null)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                   <button type="submit" disabled={quantity <= 0 || reason.length < 10} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50">Log Adjustment</button>
                </div>
             </form>
           ) : (
             <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center text-slate-400">
                <RotateCcw size={64} className="mx-auto mb-6 opacity-20" />
                <p className="font-bold">Select a medicine from the left to start adjustment.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default StockAdjustment;
