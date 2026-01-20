import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PharmacyPlan } from '../types';
import { mockApi, mockPlans } from '../services/mockApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button/Button';
import { CheckCircle2, Zap, ShieldCheck, ArrowUpRight, Clock, Building, Package, Users } from 'lucide-react';
import { toast } from '../components/common/Toast';

const Subscription: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const currentPlan = mockPlans.find(p => p.name.includes(user?.plan || 'Basic')) || mockPlans[0];

  const handleUpgradeRequest = async (requestedPlan: PharmacyPlan) => {
    setLoading(true);
    try {
      await mockApi.requestUpgrade(user?.pharmacyId || 'p1', requestedPlan);
      setRequestSent(true);
      toast.success('Upgrade request dispatched to network admin.');
    } catch (error) {
      toast.error('Sync failure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Service Provisioning</h1>
          <p className="text-slate-500 text-lg font-medium italic">Manage your node capacity and intelligence modules.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
           <Zap size={14} /> Next Cycle: {new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 border-blue-100 bg-blue-50/20">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><Package size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Inventory Load</p>
                <h3 className="text-2xl font-black text-blue-900">4 / {currentPlan.limits.inventoryItems === 'unlimited' ? '∞' : currentPlan.limits.inventoryItems}</h3>
              </div>
           </div>
           <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: currentPlan.limits.inventoryItems === 'unlimited' ? '5%' : `${(4 / (currentPlan.limits.inventoryItems as number)) * 100}%` }}></div>
           </div>
        </Card>
        
        <Card className="p-8 border-indigo-100 bg-indigo-50/20">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Users size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Staff Provisioning</p>
                <h3 className="text-2xl font-black text-indigo-900">3 / {currentPlan.limits.staffMembers === 'unlimited' ? '∞' : (currentPlan.limits.staffMembers === 0 ? 'Disabled' : currentPlan.limits.staffMembers)}</h3>
              </div>
           </div>
           <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600" style={{ width: currentPlan.limits.staffMembers === 'unlimited' ? '15%' : '100%' }}></div>
           </div>
        </Card>

        <Card className="p-8 border-emerald-100 bg-emerald-50/20 flex flex-col justify-between">
           <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Identity</p>
           <div className="mt-2">
             <h3 className="text-3xl font-black text-emerald-900 tracking-tighter">{user?.plan} Tier</h3>
             <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mt-1 flex items-center gap-1"><ShieldCheck size={12} /> Network Verified</p>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        {mockPlans.map((plan) => {
          const isCurrent = user?.plan === plan.name.split(' ')[0];
          return (
            <div key={plan.id} className={`bg-white rounded-[3.5rem] p-10 border-2 transition-all relative overflow-hidden flex flex-col ${isCurrent ? 'border-blue-600 shadow-2xl scale-105 z-10' : 'border-slate-50 shadow-sm opacity-90 grayscale-[0.3]'}`}>
               {plan.isPopular && <div className="absolute top-8 right-[-35px] rotate-45 bg-amber-400 text-amber-900 py-1 px-10 text-[10px] font-black uppercase tracking-widest shadow-sm">Popular</div>}
               
               <div className="mb-8">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                 <p className="text-slate-400 text-sm font-medium mt-1 leading-relaxed">{plan.description}</p>
                 <div className="mt-6 flex items-baseline gap-1">
                   <span className="text-5xl font-black text-slate-900 tracking-tighter">${plan.pricing.monthly}</span>
                   <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">/ month</span>
                 </div>
               </div>

               <div className="flex-1 space-y-4 mb-10">
                  {plan.features.map(f => (
                    <div key={f.id} className="flex items-start gap-3">
                       <div className="p-0.5 bg-blue-50 text-blue-600 rounded-full mt-1"><CheckCircle2 size={16} /></div>
                       <div>
                         <p className="text-sm font-black text-slate-700 leading-none">{f.name}</p>
                         <p className="text-[10px] text-slate-400 font-medium mt-1">{f.description}</p>
                       </div>
                    </div>
                  ))}
                  {plan.name.includes('Basic') && (
                    <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest pt-2">No Sales/Staff Access</p>
                  )}
               </div>

               <Button 
                 variant={isCurrent ? "outline" : "primary"} 
                 fullWidth 
                 disabled={isCurrent || loading || requestSent}
                 onClick={() => handleUpgradeRequest(plan.name.split(' ')[0] as any)}
                 icon={isCurrent ? <CheckCircle2 size={20} /> : <ArrowUpRight size={20} />}
               >
                 {isCurrent ? 'Current Plan' : (requestSent ? 'Request Pending' : `Select ${plan.name.split(' ')[0]}`)}
               </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Subscription;