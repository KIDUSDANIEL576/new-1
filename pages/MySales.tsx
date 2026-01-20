
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { History, Search, Filter, Download, Receipt, ShoppingBag } from 'lucide-react';

const MySales: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'Today' | 'This Week' | 'This Month'>('Today');

  const mockSales = [
    { id: 'REC-001', time: '10:30 AM', medicine: 'Paracetamol 500mg', qty: 2, amount: '$21.00', date: '2023-10-25' },
    { id: 'REC-002', time: '11:15 AM', medicine: 'Amoxicillin 250mg', qty: 1, amount: '$25.00', date: '2023-10-25' },
    { id: 'REC-003', time: '02:45 PM', medicine: 'Ibuprofen 400mg', qty: 3, amount: '$47.25', date: '2023-10-25' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 text-white rounded-[1.5rem] shadow-xl shadow-slate-200">
             <History size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Personal Performance</h1>
            <p className="text-slate-500 font-medium">Tracking your contribution to {user?.pharmacyId || 'the pharmacy'}.</p>
          </div>
        </div>
        <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          {['Today', 'This Week', 'This Month'].map(t => (
            <button 
              key={t}
              onClick={() => setFilter(t as any)}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
                filter === t ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total Volume</p>
             <h3 className="text-3xl font-black text-slate-900">{mockSales.reduce((sum, s) => sum + s.qty, 0)} Items</h3>
           </div>
           <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <ShoppingBag size={28} />
           </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Revenue Generated</p>
             <h3 className="text-3xl font-black text-slate-900">$93.25</h3>
           </div>
           <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Receipt size={28} />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
           <h4 className="text-lg font-black text-slate-900">Transaction History</h4>
           <button className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-all">
             <Download size={20} />
           </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">Time & Date</th>
                <th className="px-8 py-4">Medicine Detail</th>
                <th className="px-8 py-4 text-center">Qty</th>
                <th className="px-8 py-4">Total Amount</th>
                <th className="px-8 py-4 text-right">Receipt #</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-all group cursor-default">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-900 leading-none">{sale.time}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sale.date}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-700">{sale.medicine}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg font-black text-slate-900">{sale.qty}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-blue-600">{sale.amount}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-xs font-mono font-black text-slate-400">{sale.id}</span>
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

export default MySales;
