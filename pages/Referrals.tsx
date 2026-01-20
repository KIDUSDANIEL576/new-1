
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Share2, Copy, Users, DollarSign, TrendingUp, Gift, ArrowRight } from 'lucide-react';

const Referrals: React.FC = () => {
  const { user } = useAuth();
  const referralCode = user?.referralCode || "MED-INT-721";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://medintellicare.com/register?ref=${referralCode}`);
    alert("Referral link copied!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full -mr-24 -mt-24 opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest">
               <Gift size={16} /> Partner Program
             </div>
             <h1 className="text-5xl font-black text-slate-900 leading-tight">Grow Together, <br/><span className="text-blue-600">Earn Together.</span></h1>
             <p className="text-lg text-slate-500 max-w-md">Refer other pharmacies or doctors and earn 15% commission on their subscription for the first year.</p>
             
             <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <div className="flex-1 w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-slate-700 flex items-center justify-between">
                   <span>{referralCode}</span>
                   <button onClick={copyToClipboard} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                     <Copy size={20} />
                   </button>
                </div>
                <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2">
                   Share Now <ArrowRight size={20} />
                </button>
             </div>
          </div>
          <div className="shrink-0">
             <div className="w-72 h-72 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[3rem] shadow-2xl flex items-center justify-center relative rotate-3">
                <Share2 size={120} className="text-white opacity-20 absolute" />
                <div className="text-center text-white relative z-10">
                   <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Total Earnings</p>
                   <p className="text-5xl font-black">$1,450</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Users, label: 'Total Referrals', value: '12', sub: '3 Pending' },
          { icon: DollarSign, label: 'Paid Commission', value: '$820', sub: 'Last 30 days' },
          { icon: TrendingUp, label: 'Conversion Rate', value: '24%', sub: '+2% this month' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
               <stat.icon size={32} />
            </div>
            <p className="text-slate-500 font-medium mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            <p className="text-xs text-slate-400 mt-2 font-bold uppercase">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Referral History</h3>
          <button className="text-sm font-bold text-blue-600 hover:underline">Download CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] text-slate-400 font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Referred Entity</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Your Earning</th>
                <th className="px-8 py-4 text-right">Date Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: 'Unity Pharmacy', status: 'Active', earning: '$45.00', date: '2023-09-12' },
                { name: 'Dr. Mike Ross', status: 'Active', earning: '$12.00', date: '2023-09-28' },
                { name: 'Green Cross Clinic', status: 'Pending', earning: '$0.00', date: '2023-10-05' },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-900">{r.name}</td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${r.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900">{r.earning}</td>
                  <td className="px-8 py-5 text-right text-slate-400 text-sm">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
