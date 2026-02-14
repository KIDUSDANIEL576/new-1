
import React, { useState, useEffect } from 'react';
import { Building2, Search, Filter, MoreVertical, XCircle, CheckCircle, ArrowUpCircle, Download, Plus, X, Mail, Phone, MapPin, Zap, ShieldCheck, UserPlus, Key, Info, Banknote } from 'lucide-react';
import { mockApi } from '../../services/mockApi';
import { Pharmacy, PharmacyPlan, User, UserRole } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button/Button';
import { toast } from '../../components/common/Toast';

const PharmacyManagement: React.FC = () => {
  const [queue, setQueue] = useState<User[]>([]);
  const [nodes, setNodes] = useState<Pharmacy[]>([]);
  const [view, setView] = useState<'queue' | 'active'>('queue');
  const [loading, setLoading] = useState(true);
  
  // Dispatch Modal State
  const [dispatchTarget, setDispatchTarget] = useState<User | null>(null);
  const [dispatchForm, setDispatchForm] = useState({ password: '', plan: PharmacyPlan.BASIC });

  const loadData = async () => {
    setLoading(true);
    const [q, n] = await Promise.all([
      mockApi.getRegistrationQueue(),
      mockApi.getPharmacies()
    ]);
    setQueue(q);
    setNodes(n);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchTarget) return;
    
    await mockApi.approveAndDispatch(dispatchTarget.id, dispatchForm);
    toast.success(`Access credentials dispatched to ${dispatchTarget.email}`);
    setDispatchTarget(null);
    setDispatchForm({ password: '', plan: PharmacyPlan.BASIC });
    loadData();
  };

  const handleReject = async (id: string) => {
    if (!confirm("Terminate registration intent?")) return;
    await mockApi.rejectRegistration(id);
    toast.error("Enrollment request decommissioned.");
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Root Node Authority</h1>
          <p className="text-slate-500 text-lg font-medium italic">Authorize access protocols and verify clinical identities.</p>
        </div>
        <div className="flex p-1.5 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
           <button onClick={() => setView('queue')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'queue' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Registration Queue ({queue.length})</button>
           <button onClick={() => setView('active')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'active' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Active Nodes ({nodes.length})</button>
        </div>
      </div>

      {view === 'queue' ? (
        <div className="grid grid-cols-1 gap-6">
          {queue.length > 0 ? queue.map(u => (
            <Card key={u.id} className="p-8 group hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-100 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.75rem] flex items-center justify-center shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                       <UserPlus size={32}/>
                    </div>
                    <div>
                       <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-black text-slate-900 leading-tight">{u.name}</h3>
                          <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">{u.role}</span>
                       </div>
                       <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2"><Mail size={12}/> {u.email} • <Phone size={12}/> {u.phone}</p>
                    </div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1"><Info size={12}/> Enrollment Intent</p>
                     <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{u.purpose}"</p>
                  </div>
               </div>

               <div className="flex flex-row md:flex-col gap-4 border-l border-slate-50 pl-10 min-w-[240px]">
                  <button onClick={() => setDispatchTarget(u)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100">
                     <Key size={20} /> Dispatch Access
                  </button>
                  <button onClick={() => handleReject(u.id)} className="w-full py-4 bg-white text-rose-600 border border-rose-100 rounded-2xl font-black hover:bg-rose-50 flex items-center justify-center gap-3 transition-all">
                     <XCircle size={20} /> Reject Node
                  </button>
               </div>
            </Card>
          )) : (
            <div className="p-32 text-center text-slate-300 font-black italic border-2 border-dashed rounded-[4rem]">Verification Hub Synchronized. No pending nodes.</div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Node Identity</th>
                <th className="px-8 py-5">Service Tier</th>
                <th className="px-8 py-5">Connectivity</th>
                <th className="px-8 py-5 text-right">Directives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {nodes.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg"><Building2 size={24}/></div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">{p.plan} Tier</span>
                  </td>
                  <td className="px-8 py-6">
                     <span className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Node Operational
                     </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <button className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-xl shadow-sm transition-all"><ArrowUpCircle size={20}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Access Dispatch Modal */}
      {dispatchTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 bg-slate-900 text-white flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl"><Key size={24}/></div>
                    <div>
                       <h3 className="text-2xl font-black">Dispatch Node Access</h3>
                       <p className="text-slate-400 font-medium text-sm">Provisioning credentials for {dispatchTarget.email}</p>
                    </div>
                 </div>
                 <button onClick={() => setDispatchTarget(null)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
              </div>

              <form onSubmit={handleDispatch} className="p-12 space-y-8">
                 <div className="bg-blue-50 p-6 rounded-3xl space-y-4 border border-blue-100">
                    <div className="flex items-center gap-3 text-blue-600">
                       <Banknote size={24}/>
                       <h4 className="font-black text-sm uppercase tracking-widest">Verification Protocol</h4>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase leading-relaxed italic">Confirm offline payment (Telebirr/Bank) has been cleared before credential dispatch.</p>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Hub Password</label>
                       <input 
                         type="text" 
                         required 
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                         placeholder="e.g. NodeAccess99"
                         value={dispatchForm.password}
                         onChange={e => setDispatchForm({...dispatchForm, password: e.target.value})}
                       />
                    </div>

                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SaaS Protocol Tier</label>
                       <select 
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black focus:ring-2 focus:ring-blue-500 outline-none"
                         value={dispatchForm.plan}
                         onChange={e => setDispatchForm({...dispatchForm, plan: e.target.value as any})}
                       >
                          {Object.values(PharmacyPlan).map(p => <option key={p} value={p}>{p} Protocol</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setDispatchTarget(null)} className="flex-1 py-5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                    <button type="submit" className="flex-[2] py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                       <ShieldCheck size={20}/> Authorize & Dispatch
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyManagement;
