
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, PharmacyPlan, RevenueLedger, B2BTransaction } from '../types';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Users, Package, ShoppingBag, 
  Calendar, CheckCircle, Clock, DollarSign, ArrowRight,
  AlertTriangle, History, Zap, Activity, Search, ShieldCheck,
  ShoppingCart, Filter, BarChart3, CreditCard, Truck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { Card } from '../components/common/Card';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ledger, setLedger] = useState<RevenueLedger | null>(null);
  const [myTxs, setMyTxs] = useState<B2BTransaction[]>([]);

  useEffect(() => {
    if (user?.role === UserRole.SUPER_ADMIN) {
      mockApi.getRevenueLedger().then(setLedger);
    }
    if (user?.organizationId) {
      mockApi.listMyTransactions(user.organizationId).then(setMyTxs);
    }
  }, [user]);

  const renderSuperAdmin = () => (
    <div className="space-y-10 animate-in fade-in">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-8 space-y-4 hover:shadow-xl transition-all">
             <div className="flex justify-between items-center">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Activity size={24}/></div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12.5%</span>
             </div>
             <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate MRR</p><h3 className="text-3xl font-black text-slate-900">${ledger?.aggregateTotal?.toLocaleString() || '0'}</h3></div>
          </Card>
          <Card className="p-8 space-y-4 hover:shadow-xl transition-all">
             <div className="flex justify-between items-center">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Users size={24}/></div>
                <span className="text-[10px] font-black text-slate-400 uppercase">NRR: {ledger?.nrr || 0}%</span>
             </div>
             <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Nodes</p><h3 className="text-3xl font-black text-slate-900">{ledger?.activeNodes || 0} Nodes</h3></div>
          </Card>
          <Card className="p-8 space-y-4 hover:shadow-xl transition-all bg-slate-900 text-white border-none shadow-2xl">
             <div className="flex justify-between items-center"><div className="p-3 bg-white/10 text-emerald-400 rounded-2xl"><ShieldCheck size={24}/></div></div>
             <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Integrity</p><h3 className="text-3xl font-black">Verified</h3></div>
          </Card>
          <Card className="p-8 space-y-4 hover:shadow-xl transition-all">
             <div className="flex justify-between items-center"><div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><AlertTriangle size={24}/></div></div>
             <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Churn Rate</p><h3 className="text-3xl font-black text-slate-900">{ledger?.churnRate || 0}%</h3></div>
          </Card>
       </div>
    </div>
  );

  const renderSupplier = () => (
    <div className="space-y-10 animate-in fade-in">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 space-y-4 bg-indigo-600 text-white border-none shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10"><Zap size={80}/></div>
             <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">B2B Deal Volume</p>
             <h3 className="text-4xl font-black">{myTxs.length} Active Deals</h3>
             <button onClick={() => navigate('/marketplace')} className="text-indigo-200 font-bold text-xs hover:underline flex items-center gap-1">Open Stealth Hub <ArrowRight size={12}/></button>
          </Card>
          <Card className="p-8 space-y-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit"><History size={24}/></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acceptance Rate</p>
             <h3 className="text-3xl font-black text-slate-900">84%</h3>
             <p className="text-[10px] font-bold text-emerald-600 uppercase">Tier 1 Reliability</p>
          </Card>
          <Card className="p-8 space-y-4">
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit"><Truck size={24}/></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fulfillment SLA</p>
             <h3 className="text-3xl font-black text-slate-900">2.4 Days</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Delivery Node</p>
          </Card>
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hub Node: <span className="text-blue-600">Online</span></h1>
          <p className="text-slate-500 text-lg mt-1 font-medium italic">Authorized System Entry: {user?.name}</p>
        </div>
        <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-bold text-slate-600 flex items-center gap-2">
           <Calendar size={18} /> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {user?.role === UserRole.SUPER_ADMIN && renderSuperAdmin()}
      {user?.role === UserRole.SUPPLIER && renderSupplier()}
      {[UserRole.PHARMACY_ADMIN, UserRole.PHARMACIST, UserRole.SALES_PERSON].includes(user?.role as any) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Card className="p-10 space-y-8 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><ShoppingCart size={80}/></div>
              <h3 className="text-3xl font-black tracking-tight">Procurement Hub</h3>
              <p className="text-slate-400 font-medium italic leading-relaxed">"You have {myTxs.filter(t => t.status !== 'completed').length} active shipments in the stealth layer."</p>
              <button onClick={() => navigate('/marketplace')} className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all uppercase text-[10px] tracking-widest shadow-xl">Track Fulfillment</button>
           </Card>
           <Card className="p-10 space-y-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Inventory Health</h3>
              <div className="space-y-4">
                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Critical Shortages</span>
                    <span className="text-2xl font-black text-rose-600">4 SKUs</span>
                 </div>
                 <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">AI Restock Value</span>
                    <span className="text-2xl font-black text-blue-900">$1,240</span>
                 </div>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
