
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, PharmacyPlan } from '../types';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Users, Package, ShoppingBag, 
  Calendar, CheckCircle, Clock, DollarSign, ArrowRight,
  AlertTriangle, History, Zap, Activity, Search, ShieldCheck,
  ShoppingCart, Filter, BarChart3, CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { Card } from '../components/common/Card';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [revenueTimeRange, setRevenueTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [ledger, setLedger] = useState<any>(null);

  useEffect(() => {
    if (user?.role === UserRole.SUPER_ADMIN) {
      mockApi.getRevenueLedger().then(setLedger);
    }
  }, [user]);

  const salesTrend = [
    { name: 'Mon', sales: 1200 },
    { name: 'Tue', sales: 1500 },
    { name: 'Wed', sales: 1100 },
    { name: 'Thu', sales: 1800 },
    { name: 'Fri', sales: 1600 },
    { name: 'Sat', sales: 2400 },
    { name: 'Sun', sales: 2100 },
  ];

  const renderSuperAdmin = () => (
    <div className="space-y-10 animate-in fade-in">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-8 space-y-4 hover:shadow-xl transition-all">
             <div className="flex justify-between items-center">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Activity size={24}/></div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12.5%</span>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate MRR</p>
                <h3 className="text-3xl font-black text-slate-900">${ledger?.totalMrr?.toLocaleString() || '0'}</h3>
             </div>
          </Card>
          <Card className="p-8 space-y-4 hover:shadow-xl transition-all">
             <div className="flex justify-between items-center">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Users size={24}/></div>
                <span className="text-[10px] font-black text-slate-400 uppercase">NRR: {ledger?.nrr || 0}%</span>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Nodes</p>
                <h3 className="text-3xl font-black text-slate-900">42 Nodes</h3>
             </div>
          </Card>
          <Card className="p-8 space-y-4 hover:shadow-xl transition-all">
             <div className="flex justify-between items-center">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><AlertTriangle size={24}/></div>
                <span className="text-[10px] font-black text-rose-600 uppercase">CHURN: {ledger?.churnRate || 0}%</span>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retention</p>
                <h3 className="text-3xl font-black text-slate-900">98.8%</h3>
             </div>
          </Card>
          <Card className="p-8 space-y-4 hover:shadow-xl transition-all bg-slate-900 text-white border-none">
             <div className="flex justify-between items-center">
                <div className="p-3 bg-white/10 text-emerald-400 rounded-2xl"><ShieldCheck size={24}/></div>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Integrity</p>
                <h3 className="text-3xl font-black">Verified</h3>
             </div>
          </Card>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-10">
             <div className="flex justify-between items-center mb-10">
                <div>
                   <h4 className="text-xl font-black text-slate-900">Revenue Ledger Trends</h4>
                   <p className="text-xs font-medium text-slate-400 italic">Financial dynamics across entire client base.</p>
                </div>
                <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-xl">
                   {['weekly', 'monthly', 'yearly'].map(t => (
                     <button key={t} onClick={() => setRevenueTimeRange(t as any)} 
                             className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${revenueTimeRange === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                        {t}
                     </button>
                   ))}
                </div>
             </div>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={salesTrend}>
                      <defs><linearGradient id="cRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                      <Tooltip />
                      <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fill="url(#cRev)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </Card>

          <Card className="p-10 space-y-8 bg-slate-50 border-slate-100">
             <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">Revenue Attribution</h4>
             <div className="space-y-6">
                {[
                  { label: 'Basic Pharmacies', value: ledger?.breakdown?.basic, color: 'bg-slate-400' },
                  { label: 'Standard Pharmacies', value: ledger?.breakdown?.standard, color: 'bg-blue-400' },
                  { label: 'Platinum Pharmacies', value: ledger?.breakdown?.platinum, color: 'bg-indigo-400' },
                  { label: 'Doctor Node Subscriptions', value: ledger?.breakdown?.doctors, color: 'bg-emerald-400' },
                  { label: 'Patient Paid Access', value: ledger?.breakdown?.patients, color: 'bg-rose-400' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="text-slate-900">${item.value?.toLocaleString() || '0'}</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${((item.value || 0) / (ledger?.totalMrr || 1)) * 100}%` }}></div>
                     </div>
                  </div>
                ))}
             </div>
          </Card>
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Status: <span className="text-blue-600">Online</span></h1>
          <p className="text-slate-500 text-lg mt-1 font-medium italic">Welcome back, {user?.name}. Here's your intelligence summary.</p>
        </div>
        <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-bold text-slate-600 flex items-center gap-2">
           <Calendar size={18} /> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {user?.role === UserRole.SUPER_ADMIN ? renderSuperAdmin() : (
        <div className="p-10 text-center text-slate-400 font-bold">Standard Dashboard Interface Active.</div>
      )}
    </div>
  );
};

export default Dashboard;
