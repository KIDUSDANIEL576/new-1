
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, Users, Package, 
  Download, Calendar, ArrowUpRight, Activity, Zap, 
  Search, ShieldCheck, MousePointer2, PieChart, Info,
  ShoppingBag, Building2, Star, Award, TrendingDown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart as RePieChart, Pie 
} from 'recharts';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button/Button';
import { mockApi } from '../../services/mockApi';
import { PharmacyPlan, ProductIntelligence, Sale } from '../../types';
import { toast } from '../../components/common/Toast';

const GlobalReports: React.FC = () => {
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [intel, setIntel] = useState<ProductIntelligence | null>(null);
  const [entitiesCount, setEntitiesCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    mockApi.getGlobalSales().then(setSalesData);
    mockApi.getProductIntelligence().then(setIntel);
    mockApi.getPharmacies().then(list => setEntitiesCount(list.length));
  }, []);

  const topSellingMedicine = useMemo(() => {
    if (salesData.length === 0) return null;
    const totals: Record<string, number> = {};
    salesData.forEach(s => {
      totals[s.medicineName] = (totals[s.medicineName] || 0) + s.quantity;
    });
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    return { name: sorted[0][0], qty: sorted[0][1] };
  }, [salesData]);

  const topPerformingPharmacy = useMemo(() => {
    if (salesData.length === 0) return null;
    const totals: Record<string, number> = {};
    salesData.forEach(s => {
      totals[s.pharmacyId] = (totals[s.pharmacyId] || 0) + (s.amount || s.totalPrice);
    });
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    return { name: sorted[0][0], revenue: sorted[0][1] };
  }, [salesData]);

  const filteredSales = salesData.filter(s => 
    s.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.pharmacyId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,ID,Pharmacy,Medicine,Amount,Status\n" + 
      salesData.map(s => `${s.id},${s.pharmacyId},${s.medicineName},${s.totalPrice},${s.isDeleted ? 'Deleted' : 'Success'}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Global_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    toast.success('Auditable Sales Ledger Exported to CSV.');
  };

  const planData = [
    { name: 'Basic', value: 450, color: '#94a3b8' },
    { name: 'Standard', value: 1200, color: '#3b82f6' },
    { name: 'Platinum', value: 2100, color: '#6366f1' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Global Sales Intelligence</h1>
          <p className="text-slate-500 text-lg font-medium italic">Cross-node revenue auditing and product performance matrix.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} icon={<Download size={20} />}>Export Full Report (CSV)</Button>
          <Button variant="primary" icon={<ShieldCheck size={20} />}>Verify All Txs</Button>
        </div>
      </div>

      {/* Performers Cards Section 10.3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-8 border-2 border-indigo-50 bg-indigo-50/10">
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Top Selling Medicine</p>
           <h3 className="text-2xl font-black text-indigo-900 truncate">{topSellingMedicine?.name || '---'}</h3>
           <div className="mt-2 flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
              <ShoppingBag size={12} /> {topSellingMedicine?.qty} Units Dispatched
           </div>
        </Card>
        <Card className="p-8 border-2 border-blue-50 bg-blue-50/10">
           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Top Performing Hub</p>
           <h3 className="text-2xl font-black text-blue-900 truncate">{topPerformingPharmacy?.name || '---'}</h3>
           <div className="mt-2 flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase tracking-widest">
              <Building2 size={12} /> ${topPerformingPharmacy?.revenue?.toLocaleString()} Rev
           </div>
        </Card>
        <Card className="p-8 border-2 border-emerald-50 bg-emerald-50/10">
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Network MRR</p>
           <h3 className="text-2xl font-black text-emerald-900 tracking-tighter">$14,250</h3>
           <div className="mt-2 flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              <TrendingUp size={12} /> Target +18%
           </div>
        </Card>
        <Card className="p-8 border-2 border-slate-50 bg-slate-50/10">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Integrity Score</p>
           <h3 className="text-2xl font-black text-slate-900 tracking-tighter">99.8%</h3>
           <div className="mt-2 flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <ShieldCheck size={12} /> Verified Audit
           </div>
        </Card>
      </div>

      {/* Sales Trajectory Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="text-blue-600" /> Revenue Trajectory
              </h4>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Growth Dynamics across nodes</p>
            </div>
          </div>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={[
                 { name: 'Mon', revenue: 1200 },
                 { name: 'Tue', revenue: 1500 },
                 { name: 'Wed', revenue: 900 },
                 { name: 'Thu', revenue: 2100 },
                 { name: 'Fri', revenue: 1800 },
                 { name: 'Sat', revenue: 2400 },
                 { name: 'Sun', revenue: 2200 },
               ]}>
                 <defs>
                   <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                 <Tooltip />
                 <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorGrowth)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-10 flex flex-col justify-center items-center text-center">
           <h4 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-widest">Protocol Market Share</h4>
           <div className="h-[250px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <RePieChart>
                 <Pie data={planData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                   {planData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip />
               </RePieChart>
             </ResponsiveContainer>
           </div>
           <div className="flex gap-4 mt-6">
              {planData.map(p => (
                <div key={p.name} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                   <span className="text-[10px] font-black text-slate-500 uppercase">{p.name}</span>
                </div>
              ))}
           </div>
        </Card>
      </div>

      {/* Global Sales Ledger Section 10.3 */}
      <Card className="overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg"><Activity size={24}/></div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">Filterable Global Transaction Ledger</h4>
           </div>
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search by medicine, node or amount..." 
               className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Tx ID</th>
                <th className="px-8 py-5">Node Identity</th>
                <th className="px-8 py-5">Medicine Sold</th>
                <th className="px-8 py-5 text-center">Volume</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.map((s) => (
                <tr key={s.id} className={`hover:bg-slate-50/50 transition-all ${s.isDeleted ? 'opacity-50 grayscale' : ''}`}>
                  <td className="px-8 py-6 font-mono text-xs text-slate-400">{s.id}</td>
                  <td className="px-8 py-6 font-black text-slate-700 capitalize">{s.pharmacyId}</td>
                  <td className="px-8 py-6 font-bold text-slate-900">{s.medicineName}</td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg font-black text-xs">{s.quantity}</span>
                  </td>
                  <td className="px-8 py-6 font-black text-blue-600">${s.totalPrice}</td>
                  <td className="px-8 py-6 text-right">
                    {s.isDeleted ? (
                      <span className="flex items-center justify-end gap-2 text-[10px] font-black uppercase text-rose-600">
                        <TrendingDown size={14}/> DELETED
                      </span>
                    ) : (
                      <span className="flex items-center justify-end gap-2 text-[10px] font-black uppercase text-emerald-600">
                        <ShieldCheck size={14}/> VERIFIED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default GlobalReports;
