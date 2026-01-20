import React, { useState, useEffect } from 'react';
import { Building2, Search, Filter, MoreVertical, XCircle, CheckCircle, ArrowUpCircle, Download, Plus, X, Mail, Phone, MapPin } from 'lucide-react';
import { mockApi } from '../../services/mockApi';
import { Pharmacy, PharmacyPlan } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button/Button';

const PharmacyManagement: React.FC = () => {
  const [list, setList] = useState<Pharmacy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', plan: PharmacyPlan.BASIC });

  const loadData = async () => {
    setLoading(true);
    const data = await mockApi.getPharmacies();
    setList(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleToggleStatus = async (id: string) => {
    await mockApi.togglePharmacyStatus(id);
    loadData();
  };

  const handleForceUpgrade = async (id: string, plan: PharmacyPlan) => {
    await mockApi.forceUpgrade(id, plan);
    loadData();
  };

  const handleAddPharmacy = async (e: React.FormEvent) => {
    e.preventDefault();
    await mockApi.addPharmacy(formData);
    setShowAddModal(false);
    setFormData({ name: '', email: '', phone: '', address: '', plan: PharmacyPlan.BASIC });
    loadData();
  };

  const filtered = list.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Node Network Control</h1>
          <p className="text-slate-500 text-lg font-medium italic">Platform-wide pharmacy node administration.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={20} />}
          className="rounded-2xl"
        >
          Initialize New Node
        </Button>
      </div>

      <Card className="flex items-center gap-4 p-4 border-2 border-slate-50 shadow-inner bg-white">
        <Search className="text-slate-300 ml-4" size={24} />
        <input 
          type="text" 
          placeholder="Fuzzy search nodes by name, identity, or address..." 
          className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
          <Filter size={20} />
        </button>
      </Card>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Node Identity</th>
                <th className="px-8 py-5">Subscription</th>
                <th className="px-8 py-5 text-center">Staff Vol.</th>
                <th className="px-8 py-5">Connectivity</th>
                <th className="px-8 py-5 text-right">Direct Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${p.status === 'Active' ? 'bg-blue-600' : 'bg-slate-400'}`}>
                         <Building2 size={24} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{p.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      p.plan === PharmacyPlan.PLATINUM ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                      p.plan === PharmacyPlan.STANDARD ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {p.plan}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <p className="text-lg font-black text-slate-900">{p.staffCount}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">Provisioned</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] ${
                      p.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full bg-current ${p.status === 'Active' ? 'animate-pulse' : ''}`}></div>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleForceUpgrade(p.id, PharmacyPlan.PLATINUM)}
                        title="Force Platinum Tier"
                        className="p-3 bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 rounded-xl shadow-sm"
                      >
                        <ArrowUpCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(p.id)}
                        className={`p-3 bg-white border border-slate-200 rounded-xl shadow-sm ${p.status === 'Active' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                      >
                        {p.status === 'Active' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-8 border-b border-slate-50 bg-blue-600 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black">Add New Pharmacy</h3>
                  <p className="opacity-80">Onboard a new healthcare provider.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X size={24} />
                </button>
             </div>
             <form onSubmit={handleAddPharmacy} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Pharmacy Name</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="e.g. HealthFirst Hub"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                      <input 
                        type="email" 
                        required 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="admin@heal.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="09..."
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Street, City, Area"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Initial Plan</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      value={formData.plan}
                      onChange={e => setFormData({...formData, plan: e.target.value as PharmacyPlan})}
                    >
                      {Object.values(PharmacyPlan).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                   <Button type="submit" fullWidth className="flex-1 rounded-2xl">Create Entity</Button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyManagement;