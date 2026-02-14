
import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/mockApi';
import { AuditLog } from '../../types';
import { FileText, Search, Clock, Info, ShieldCheck, Download } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { toast } from '../../components/common/Toast';

const AuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    const data = await mockApi.getAuditLogs();
    setLogs(data);
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <div className="p-5 bg-slate-900 text-white rounded-[2rem] shadow-2xl">
              <ShieldCheck size={40} />
           </div>
           <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Immortal Audit Trail</h1>
            <p className="text-slate-500 text-lg font-medium italic">Cryptographically linked system activities and compliance logs.</p>
           </div>
        </div>
        <button onClick={() => toast.success('Audit Ledger Exported.')} className="px-8 py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
           <Download size={20} /> Export Audit Ledger
        </button>
      </div>

      <Card className="overflow-hidden border-2 border-slate-900/5 shadow-inner">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Global Activity Stream</h4>
           <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
              <input type="text" placeholder="Filter Audit Metadata..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Event Sequence</th>
                <th className="px-8 py-5">Directive Type</th>
                <th className="px-8 py-5">Authorized Entity</th>
                <th className="px-8 py-5">Details / Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <Clock size={14} className="text-slate-300" />
                      <p className="text-xs font-mono font-bold text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-tighter">{log.action}</span>
                  </td>
                  <td className="px-8 py-6 text-xs font-black text-slate-900">{log.user}</td>
                  <td className="px-8 py-6 text-xs font-medium italic text-slate-500">"{log.details}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AuditTrail;
