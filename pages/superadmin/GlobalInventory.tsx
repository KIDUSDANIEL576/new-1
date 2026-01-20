
import React, { useState, useEffect } from 'react';
import { Database, Search, Filter, Package, ChevronRight } from 'lucide-react';
import { mockApi } from '../../services/mockApi';
import { InventoryItem } from '../../types';
import { Card } from '../../components/common/Card';

const GlobalInventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    mockApi.getGlobalInventory().then(setItems);
  }, []);

  const filtered = items.filter(i => i.medicineName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-6">
         <div className="p-5 bg-blue-600 text-white rounded-[2rem] shadow-2xl">
            <Database size={40} />
         </div>
         <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Global Inventory Matrix</h1>
          <p className="text-slate-500 text-lg font-medium italic">Cross-node stock aggregation and regional deficit tracking.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 border-blue-100 bg-blue-50/20">
           <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Network Stock</p>
           <h3 className="text-4xl font-black text-blue-900">{items.reduce((acc, curr) => acc + curr.stock, 0).toLocaleString()} Units</h3>
        </Card>
        <Card className="p-8 border-emerald-100 bg-emerald-50/20">
           <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Tracked SKU Nodes</p>
           <h3 className="text-4xl font-black text-emerald-900">{items.length} Products</h3>
        </Card>
        <Card className="p-8 border-amber-100 bg-amber-50/20">
           <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Regional Shortages</p>
           <h3 className="text-4xl font-black text-amber-900">{items.filter(i => i.stock < 10).length} Critical</h3>
        </Card>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 bg-slate-50/30 flex items-center gap-4 border-b border-slate-100">
          <Search className="text-slate-300 ml-4" size={24} />
          <input 
            type="text" 
            placeholder="Filter global inventory matrix..." 
            className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Medication & SKU</th>
                <th className="px-8 py-5">Node Identity</th>
                <th className="px-8 py-5 text-center">Batch Vol.</th>
                <th className="px-8 py-5 text-right">Expiration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 rounded-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                         <Package size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight">{item.medicineName}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{item.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <p className="text-sm font-black text-slate-700">Node ID: {item.pharmacyId}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                     <span className={`px-4 py-1.5 rounded-xl text-xs font-black border ${item.stock < 10 ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
                        {item.stock} UNITS
                     </span>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-slate-500 uppercase text-xs">
                     {new Date(item.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GlobalInventory;
