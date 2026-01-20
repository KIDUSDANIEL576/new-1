
import React, { useState, useEffect } from 'react';
import { 
  Settings, CreditCard, Gift, Zap, CheckCircle2, 
  XCircle, Clock, Trash2, Edit, Plus, X, ShieldAlert,
  Snowflake, Bell, Megaphone, Flag, Cpu, Calendar, AlertTriangle,
  Download, Filter, Search, UserPlus, Key, Info, PieChart,
  Palette, Image as ImageIcon, Activity, DollarSign, Percent, 
  ChevronRight, Users, ShieldCheck, EyeOff, Sparkles, Sliders,
  MapPin, Phone
} from 'lucide-react';
import { mockApi } from '../../services/mockApi';
import { 
  Plan, UpgradeRequest, BonusGrant, HolidayTheme, SystemVersion,
  FeedbackEntry, PharmacyPlan, SystemSafety, Pharmacy, User,
  UserRole, ProductIntelligence
} from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button/Button';
import { toast } from '../../components/common/Toast';

const PlanControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monetization' | 'upgrades' | 'patient_mon' | 'admin'>('monetization');
  
  // Data State
  const [plans, setPlans] = useState<Plan[]>([]);
  const [upgrades, setUpgrades] = useState<UpgradeRequest[]>([]);
  const [revenue, setRevenue] = useState<any>(null);

  // Editing state for plans
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  // Patient settings state
  const [patientSettings, setPatientSettings] = useState({
    freeTierActive: true,
    paidTierActive: true,
    paidMonthlyPrice: 9.99,
    paidMonthlyLimit: 50,
    aiSearchEnabled: true
  });

  const [showConfirmModal, setShowConfirmModal] = useState<{ type: 'approve' | 'reject', id: string, name: string } | null>(null);

  const loadData = async () => {
    const [p, u, r] = await Promise.all([
      mockApi.getPlans(),
      mockApi.getUpgradeRequests(),
      mockApi.getRevenueLedger()
    ]);
    setPlans(p);
    setUpgrades(u.filter(req => req.status === 'pending'));
    setRevenue(r);
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    await mockApi.updatePlan(editingPlan.id, editingPlan);
    toast.success(`${editingPlan.name} architecture updated.`);
    setEditingPlan(null);
    loadData();
  };

  const handleUpgradeAction = async () => {
    if (!showConfirmModal) return;
    if (showConfirmModal.type === 'approve') {
      await mockApi.approveUpgrade(showConfirmModal.id);
      toast.success(`Node upgraded to requested tier.`);
    } else {
      await mockApi.rejectUpgrade(showConfirmModal.id);
      toast.error(`Upgrade request dismissed.`);
    }
    setShowConfirmModal(null);
    loadData();
  };

  const renderMonetization = () => (
    <div className="space-y-10 animate-in fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
             <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
               <CreditCard className="text-blue-600" /> Plan Architecture
             </h3>
             <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Network Standard V4.0</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <Card key={plan.id} className="p-8 space-y-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Zap size={64} />
                </div>
                <div>
                   <h4 className="text-lg font-black text-slate-900">{plan.name}</h4>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{plan.limits.inventoryItems === 'unlimited' ? '∞' : plan.limits.inventoryItems} SKU Capacity</p>
                </div>
                <div className="space-y-1">
                   <p className="text-3xl font-black text-slate-900">${plan.pricing.monthly}<span className="text-xs text-slate-400 font-bold tracking-normal">/mo</span></p>
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Annual: ${plan.pricing.yearly} ({plan.pricing.yearlyDiscount}% Discount)</p>
                </div>
                <button onClick={() => setEditingPlan(plan)} className="w-full py-3 bg-slate-50 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                   <Sliders size={14} /> Configure Pricing
                </button>
              </Card>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
             <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                <h4 className="text-lg font-black uppercase tracking-widest">Plan Entitlements Matrix</h4>
                <ShieldCheck size={24} className="text-blue-400" />
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-4">Capability</th>
                        <th className="px-8 py-4 text-center">Basic</th>
                        <th className="px-8 py-4 text-center">Standard</th>
                        <th className="px-8 py-4 text-center">Platinum</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {[
                        { name: 'Inventory Alerts', b: true, s: true, p: true },
                        { name: 'Sales POS Module', b: false, s: true, p: true },
                        { name: 'Staff Management', b: false, s: true, p: true },
                        { name: 'B2B Marketplace', b: false, s: false, p: true },
                        { name: 'AI Demand Forecast', b: false, s: false, p: true },
                        { name: 'Node Analytics Hub', b: false, s: false, p: true },
                      ].map(row => (
                        <tr key={row.name} className="hover:bg-slate-50 transition-all">
                           <td className="px-8 py-5 text-sm font-bold text-slate-700">{row.name}</td>
                           <td className="px-8 py-5 text-center">{row.b ? <CheckCircle2 className="mx-auto text-emerald-500" size={18}/> : <XCircle className="mx-auto text-slate-200" size={18}/>}</td>
                           <td className="px-8 py-5 text-center">{row.s ? <CheckCircle2 className="mx-auto text-emerald-500" size={18}/> : <XCircle className="mx-auto text-slate-200" size={18}/>}</td>
                           <td className="px-8 py-5 text-center">{row.p ? <CheckCircle2 className="mx-auto text-emerald-500" size={18}/> : <XCircle className="mx-auto text-slate-200" size={18}/>}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="p-10 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
             <div className="absolute -bottom-10 -right-10 opacity-10 rotate-12">
                <DollarSign size={200} />
             </div>
             <div className="relative z-10 space-y-8">
                <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                  <Activity className="text-emerald-400" /> Revenue Pulse
                </h3>
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform MRR</p>
                   <h3 className="text-5xl font-black tracking-tighter text-blue-400">${revenue?.aggregateTotal?.toLocaleString()}</h3>
                </div>
                <div className="space-y-4 pt-8 border-t border-white/10">
                   {Object.entries(revenue?.bySource || {}).map(([key, val]: any) => (
                     <div key={key} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">{key.replace('Plans', '')} Inflow</span>
                        <span className="text-white">${val.toLocaleString()}</span>
                     </div>
                   ))}
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderUpgrades = () => (
    <div className="space-y-8 animate-in fade-in">
       <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-indigo-100">
             <Zap size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Provisioning Queue</h1>
            <p className="text-slate-500 font-medium italic">High-priority node scalability requests awaiting root verification.</p>
          </div>
       </div>

       <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                   <th className="px-8 py-5">Node Identity</th>
                   <th className="px-8 py-5">Desired Protocol</th>
                   <th className="px-8 py-5">Entry Timestamp</th>
                   <th className="px-8 py-5 text-right">Directives</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {upgrades.length > 0 ? upgrades.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-all group">
                     <td className="px-8 py-6">
                        <p className="font-black text-slate-900">{req.pharmacyName}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Node: {req.pharmacyId}</p>
                     </td>
                     <td className="px-8 py-6">
                        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                           {req.requestedPlan} Tier
                        </span>
                     </td>
                     <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-600">{new Date(req.createdAt).toLocaleString()}</p>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button onClick={() => setShowConfirmModal({ type: 'approve', id: req.id, name: req.pharmacyName })} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2">
                              <CheckCircle2 size={16}/> Provision
                           </button>
                           <button onClick={() => setShowConfirmModal({ type: 'reject', id: req.id, name: req.pharmacyName })} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                              <XCircle size={20}/>
                           </button>
                        </div>
                     </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-300 font-black italic">Queue Clear. All node requests provisioned.</td></tr>
                )}
             </tbody>
          </table>
       </div>
    </div>
  );

  const renderPatientMonetization = () => (
    <div className="space-y-10 animate-in fade-in">
       <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-600 text-white rounded-[1.5rem] shadow-xl shadow-emerald-100">
             <Users size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Patient Monetization Center</h1>
            <p className="text-slate-500 font-medium italic">Configure access controls and procurement pricing for end-users.</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-10 space-y-10 border-2 border-slate-900 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <EyeOff size={80} />
             </div>
             <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <div>
                   <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Free Access Tier</h4>
                   <p className="text-slate-400 font-medium text-sm">Restricted search-only protocols.</p>
                </div>
                <button 
                  onClick={() => setPatientSettings({...patientSettings, freeTierActive: !patientSettings.freeTierActive})}
                  className={`w-14 h-8 rounded-full p-1 transition-all ${patientSettings.freeTierActive ? 'bg-slate-900' : 'bg-slate-200'}`}
                >
                   <div className={`w-6 h-6 bg-white rounded-full transition-all ${patientSettings.freeTierActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
             </div>
             <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enforced Restrictions</p>
                   <div className="space-y-3">
                      {[
                        { icon: EyeOff, label: 'Blurred Pharmacy Identity' },
                        { icon: MapPin, label: 'Locked Location Nodes' },
                        { icon: Phone, label: 'Blocked Contact Protocols' },
                        { icon: DollarSign, label: 'Procurement Disabled' },
                      ].map(r => (
                        <div key={r.label} className="flex items-center gap-3 text-slate-600">
                           <r.icon size={16} className="text-slate-400"/>
                           <span className="text-xs font-bold">{r.label}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </Card>

          <Card className="p-10 space-y-10 border-2 border-blue-600 shadow-2xl shadow-blue-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles size={80} className="text-blue-600" />
             </div>
             <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <div>
                   <h4 className="text-2xl font-black text-blue-600 uppercase tracking-tighter">Paid Direct Access</h4>
                   <p className="text-slate-400 font-medium text-sm">Full procument and AI intelligence features.</p>
                </div>
                <button 
                  onClick={() => setPatientSettings({...patientSettings, paidTierActive: !patientSettings.paidTierActive})}
                  className={`w-14 h-8 rounded-full p-1 transition-all ${patientSettings.paidTierActive ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                   <div className={`w-6 h-6 bg-white rounded-full transition-all ${patientSettings.paidTierActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
             </div>
             
             <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Subscription ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl text-blue-600" 
                        value={patientSettings.paidMonthlyPrice}
                        onChange={e => setPatientSettings({...patientSettings, paidMonthlyPrice: parseFloat(e.target.value)})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Request Limit</label>
                      <input 
                        type="number" 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl" 
                        value={patientSettings.paidMonthlyLimit}
                        onChange={e => setPatientSettings({...patientSettings, paidMonthlyLimit: parseInt(e.target.value)})}
                      />
                   </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-blue-50 rounded-3xl border border-blue-100">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm"><Sparkles size={20}/></div>
                      <div>
                         <p className="text-xs font-black text-blue-900 uppercase">Fuzzy AI Search</p>
                         <p className="text-[10px] text-blue-600 font-bold">Entitle Gemini-powered matching</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setPatientSettings({...patientSettings, aiSearchEnabled: !patientSettings.aiSearchEnabled})}
                     className={`w-12 h-6 rounded-full p-1 transition-all ${patientSettings.aiSearchEnabled ? 'bg-blue-600' : 'bg-blue-200'}`}
                   >
                      <div className={`w-4 h-4 bg-white rounded-full transition-all ${patientSettings.aiSearchEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </button>
                </div>

                <Button fullWidth onClick={() => toast.success('Patient Monetization Directives Synchronized.')}>Apply Hub Directives</Button>
             </div>
          </Card>
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Plan Control Center</h1>
          <p className="text-slate-500 text-lg font-medium italic">Master management of platform monetization and node scalability.</p>
        </div>
        <div className="flex p-1.5 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex-wrap justify-center">
          {[
            { id: 'monetization', icon: CreditCard, label: 'Plan Config' },
            { id: 'upgrades', icon: Zap, label: 'Upgrade Queue' },
            { id: 'patient_mon', icon: Users, label: 'Patient Directives' },
            { id: 'admin', icon: Settings, label: 'Root System' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === t.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'monetization' && renderMonetization()}
      {activeTab === 'upgrades' && renderUpgrades()}
      {activeTab === 'patient_mon' && renderPatientMonetization()}

      {editingPlan && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black">Configure Protocol</h3>
                    <p className="opacity-80">Edit pricing and limits for {editingPlan.name}</p>
                 </div>
                 <button onClick={() => setEditingPlan(null)}><X size={24}/></button>
              </div>
              <form onSubmit={handleUpdatePlan} className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Rate ($)</label>
                       <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                          <input type="number" required className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl" value={editingPlan.pricing.monthly} onChange={e => setEditingPlan({...editingPlan, pricing: {...editingPlan.pricing, monthly: parseFloat(e.target.value)}})} />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Annual Rate ($)</label>
                       <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                          <input type="number" required className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl" value={editingPlan.pricing.yearly} onChange={e => setEditingPlan({...editingPlan, pricing: {...editingPlan.pricing, yearly: parseFloat(e.target.value)}})} />
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Yearly Discount (%)</label>
                       <div className="relative">
                          <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                          <input type="number" required className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl" value={editingPlan.pricing.yearlyDiscount} onChange={e => setEditingPlan({...editingPlan, pricing: {...editingPlan.pricing, yearlyDiscount: parseFloat(e.target.value)}})} />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU Node Limit</label>
                       <input type="text" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl" value={editingPlan.limits.inventoryItems} onChange={e => setEditingPlan({...editingPlan, limits: {...editingPlan.limits, inventoryItems: e.target.value as any}})} />
                    </div>
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setEditingPlan(null)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Discard</button>
                    <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all">Synchronize Architecture</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 space-y-8 text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${showConfirmModal.type === 'approve' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                 <Zap size={40}/>
              </div>
              <h3 className="text-2xl font-black">Provision Infrastructure?</h3>
              <p className="text-slate-500 font-medium">Are you sure you want to {showConfirmModal.type} the protocol upgrade request for <strong>{showConfirmModal.name}</strong>?</p>
              <div className="flex gap-4">
                 <button onClick={() => setShowConfirmModal(null)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">Cancel</button>
                 <button onClick={handleUpgradeAction} className={`flex-1 py-4 text-white font-black rounded-2xl shadow-xl ${showConfirmModal.type === 'approve' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                    Yes, {showConfirmModal.type === 'approve' ? 'Provision' : 'Dismiss'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PlanControl;
