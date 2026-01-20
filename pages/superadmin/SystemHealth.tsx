
import React, { useState, useEffect } from 'react';
import { 
  Server, Zap, ShieldCheck, Activity, Cpu, HardDrive, 
  Globe, RefreshCw, AlertCircle, CheckCircle2, X, ShieldAlert,
  Search, Lock, Info, Eye, Trash2, AlertTriangle, Fingerprint,
  Package
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { mockApi } from '../../services/mockApi';
import { UpgradeRequest, SecurityLog, IntegrityAlert } from '../../types';
import { toast } from '../../components/common/Toast';

const SystemHealth: React.FC = () => {
  const [upgrades, setUpgrades] = useState<UpgradeRequest[]>([]);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [integrityAlerts, setIntegrityAlerts] = useState<IntegrityAlert[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    mockApi.getUpgradeRequests().then(setUpgrades);
    mockApi.getSecurityLogs().then(setLogs);
    mockApi.getIntegrityAlerts().then(setIntegrityAlerts);
  }, []);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success('Integrity Mirror Sync Successful.');
    }, 2000);
  };

  const integrityStats = [
    { label: 'Credential Conflicts', value: '0', icon: <Fingerprint size={16}/>, color: 'text-emerald-500' },
    { label: 'Deleted Transactions', value: '14', icon: <Trash2 size={16}/>, color: 'text-rose-500' },
    { label: 'Stock Deviations', value: '42', icon: <Package size={16}/>, color: 'text-amber-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <div className="p-5 bg-slate-900 text-white rounded-[2rem] shadow-2xl">
              <ShieldAlert size={40} />
           </div>
           <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">System Integrity Audit</h1>
            <p className="text-slate-500 text-lg font-medium italic">Root infrastructure auditing and anomaly detection protocols.</p>
           </div>
        </div>
        <button onClick={handleSync} disabled={syncing} className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center gap-3">
           <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Syncing Integrity Hub...' : 'Force Global Audit'}
        </button>
      </div>

      {/* Integrity Metrics Section 10.4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {integrityStats.map((stat, idx) => (
          <Card key={idx} className="p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-slate-100">
             <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-slate-50 ${stat.color}`}>
                   {stat.icon}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Scan</span>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
             <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Active Integrity Alerts 10.4 */}
          <Card className="p-10 space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
                 <AlertTriangle size={24} className="text-rose-600" /> High-Severity Alerts
               </h3>
               <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">Mark all resolved</button>
            </div>
            <div className="divide-y divide-slate-50">
               {integrityAlerts.map(alert => (
                 <div key={alert.id} className="py-6 flex justify-between items-center group">
                    <div className="flex items-start gap-4">
                       <div className={`mt-1 p-2 rounded-xl ${alert.impact === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                          <ShieldAlert size={18}/>
                       </div>
                       <div>
                          <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{alert.description}</p>
                          <div className="flex items-center gap-4 mt-1">
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(alert.timestamp).toLocaleString()}</p>
                             <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${alert.impact === 'critical' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'}`}>
                               Impact: {alert.impact}
                             </span>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={16}/></button>
                       <button className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg"><CheckCircle2 size={16}/></button>
                    </div>
                 </div>
               ))}
            </div>
          </Card>

          {/* Pending Infrastructure Upgrades */}
          <Card className="p-10 space-y-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
               <Zap size={24} className="text-indigo-600" /> Pending Scaling Requests
            </h3>
            <div className="divide-y divide-slate-50">
              {upgrades.filter(u => u.status === 'pending').map(u => (
                <div key={u.id} className="py-6 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                       {u.pharmacyName[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{u.pharmacyName}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Requested: <span className="text-blue-600">{u.requestedPlan} Tier</span></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">Provision Tier</button>
                    <button className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100"><X size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
           {/* Live System Health */}
           <Card className="p-10 space-y-10 bg-white shadow-sm border-2 border-transparent hover:border-blue-50 transition-all">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                <Activity size={20} className="text-blue-600" /> Live Telemetry
              </h3>
              <div className="space-y-8">
                 {[
                   { label: 'Engine Uptime', value: '99.99%', icon: <Zap size={16}/>, color: 'text-emerald-500' },
                   { label: 'Network Latency', value: '14ms', icon: <Cpu size={16}/>, color: 'text-blue-500' },
                   { label: 'Mirror Sync Delay', value: '0.4s', icon: <RefreshCw size={16}/>, color: 'text-indigo-500' },
                   { label: 'Active Clusters', value: 'Regional', icon: <HardDrive size={16}/>, color: 'text-slate-500' },
                 ].map((t, idx) => (
                   <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                         <div className="flex items-center gap-2">{t.icon} {t.label}</div>
                         <span className="text-slate-900">{t.value}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                         <div className={`h-full ${t.color.replace('text-', 'bg-')} animate-pulse`} style={{ width: '85%' }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           {/* Relationship Integrity Status */}
           <Card className="p-10 bg-slate-900 text-white border-none shadow-2xl">
              <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-widest mb-8">
                <Lock size={20} className="text-blue-400" /> Table Relationships
              </h3>
              <div className="space-y-6">
                 {[
                   { label: 'Users -> Pharmacies', status: 'Optimal' },
                   { label: 'Sales -> Inventory', status: 'Optimal' },
                   { label: 'Prescriptions -> Doctors', status: 'Optimal' },
                 ].map(r => (
                   <div key={r.label} className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-[10px] font-bold text-white/60 uppercase">{r.label}</span>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{r.status}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
