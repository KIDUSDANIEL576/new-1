
import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, Filter, MoreVertical, 
  Trash2, Edit, CheckCircle, XCircle, Shield, Award 
} from 'lucide-react';
import { StaffMember } from '../types';

const StaffManagement: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: '1', name: 'Dr. Sarah Wilson', role: 'Pharmacist', email: 'sarah@pharm.com', sales: 142, rating: 4.8, status: 'Active' },
    { id: '2', name: 'James Carter', role: 'Sales Person', email: 'james@pharm.com', sales: 98, rating: 4.5, status: 'Active' },
    { id: '3', name: 'Emily Rose', role: 'Pharmacist', email: 'emily@pharm.com', sales: 110, rating: 4.9, status: 'Inactive' },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Staff Management</h1>
          <p className="text-slate-500">Manage your pharmacists and sales team permissions.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2">
          <UserPlus size={20} />
          Add Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <Users size={32} />
           </div>
           <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Total Staff</p>
              <h3 className="text-2xl font-black text-slate-900">{staff.length}</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Award size={32} />
           </div>
           <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Avg Rating</p>
              <h3 className="text-2xl font-black text-slate-900">4.73</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Shield size={32} />
           </div>
           <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Permissions</p>
              <h3 className="text-2xl font-black text-slate-900">Role-Based</h3>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Search by name or role..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-all">
            <Filter size={18} /> Filter Team
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">Staff Member</th>
                <th className="px-8 py-4">Role</th>
                <th className="px-8 py-4 text-center">Sales Performance</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                        {s.name[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-tighter">
                      {s.role}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-center">
                      <p className="font-black text-slate-900">{s.sales} Orders</p>
                      <p className="text-xs text-amber-500 font-bold">★ {s.rating} Rating</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
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
             <div className="p-8 bg-blue-600 text-white">
                <h3 className="text-2xl font-black">Add New Staff</h3>
                <p className="opacity-80">Invite a pharmacist or salesperson to your team.</p>
             </div>
             <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Abebe Kebede" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Role Permission</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Pharmacist</option>
                    <option>Sales Person</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="staff@pharmacy.com" />
                </div>
                <div className="flex gap-4 pt-4">
                   <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Discard</button>
                   <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 transition-all">Send Invitation</button>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
