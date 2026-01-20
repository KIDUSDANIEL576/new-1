
import React, { useState, useEffect } from 'react';
import { Store, ShieldCheck, CheckCircle, XCircle, UserCheck, ExternalLink } from 'lucide-react';
import { mockApi } from '../../services/mockApi';
import { Card } from '../../components/common/Card';

const MarketplaceApprovals: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    mockApi.getSuppliers().then(setSuppliers);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-6">
         <div className="p-5 bg-blue-600 text-white rounded-[2rem] shadow-2xl">
            <Store size={40} />
         </div>
         <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Supplier Authentication</h1>
          <p className="text-slate-500 text-lg font-medium italic">Authorized supply chain enrollment queue.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {suppliers.map(s => (
          <Card key={s.id} className="p-10 flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-100">
             <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                      <UserCheck size={32} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{s.name}</h3>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{s.category} Entity</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-slate-50">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Date</p>
                      <p className="text-xs font-bold text-slate-900">{s.date}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Identity</p>
                      <p className="text-xs font-bold text-slate-900">{s.contact}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Status</p>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[8px] font-black uppercase tracking-tighter">Doc Review</span>
                   </div>
                   <div>
                      <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest flex items-center gap-1">
                         Review Compliance <ExternalLink size={12} />
                      </button>
                   </div>
                </div>
             </div>

             <div className="flex flex-row md:flex-col gap-4 border-l border-slate-50 pl-8 min-w-[200px]">
                <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100">
                   <CheckCircle size={20} /> Verify
                </button>
                <button className="w-full py-4 bg-white text-rose-600 border border-rose-100 rounded-2xl font-black hover:bg-rose-50 flex items-center justify-center gap-3 transition-all">
                   <XCircle size={20} /> Reject
                </button>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceApprovals;
