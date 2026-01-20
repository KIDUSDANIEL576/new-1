
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingBag, Search, Filter, Truck, CheckCircle2, 
  Package, DollarSign, Brain, Plus, ChevronRight, AlertCircle
} from 'lucide-react';

const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const suppliers = [
    { id: 's1', name: 'Global Pharma Logistics', rating: 4.8, reliability: '99%', category: 'Wholesale' },
    { id: 's2', name: 'Elite Medical Supplies', rating: 4.5, reliability: '96%', category: 'Supplies' },
    { id: 's3', name: 'Modern Drug Distro', rating: 4.9, reliability: '100%', category: 'Specialty' },
  ];

  const products = [
    { id: 'm1', name: 'Amoxicillin Capsules 500mg', supplier: 'Global Pharma', price: 4.50, moq: 100, category: 'Antibiotic' },
    { id: 'm2', name: 'Digital BP Monitor', supplier: 'Elite Medical', price: 28.00, moq: 10, category: 'Equipment' },
    { id: 'm3', name: 'N95 Respirators (Box 50)', supplier: 'Elite Medical', price: 35.00, moq: 5, category: 'Supplies' },
    { id: 'm4', name: 'Metformin XR 1000mg', supplier: 'Modern Drug', price: 12.00, moq: 50, category: 'Diabetes' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="relative h-64 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 overflow-hidden shadow-2xl shadow-blue-200">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="relative h-full flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
               <ShoppingBag size={32} />
             </div>
             <span className="px-3 py-1 bg-amber-400 text-amber-900 rounded-full text-xs font-black uppercase">Platinum B2B</span>
          </div>
          <h1 className="text-4xl font-black mb-2">B2B Supplier Marketplace</h1>
          <p className="text-indigo-100 max-w-lg">Order inventory directly from verified suppliers at wholesale rates with AI-powered demand forecasting.</p>
        </div>
        <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden lg:block">
           <div className="bg-white/10 backdrop-blur-lg p-6 rounded-[2rem] border border-white/20 w-80">
              <div className="flex items-center gap-2 mb-4 text-amber-300 font-bold">
                <Brain size={20} /> AI Stock Alert
              </div>
              <p className="text-sm text-white/80 leading-relaxed mb-4">You are running low on Amoxicillin. Global Pharma has a 15% discount on bulk orders today.</p>
              <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all">Order Now</button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Filter size={20} className="text-blue-600" />
              Supplier Filters
            </h4>
            <div className="space-y-4">
               <div>
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Categories</label>
                 {['Antibiotics', 'Diabetes', 'Cardiac', 'Vitamins', 'Medical Equipment'].map(c => (
                   <label key={c} className="flex items-center gap-3 mb-2 cursor-pointer group">
                     <div className="w-5 h-5 border-2 border-slate-200 rounded group-hover:border-blue-500 transition-colors"></div>
                     <span className="text-sm text-slate-600 group-hover:text-blue-600 font-medium transition-colors">{c}</span>
                   </label>
                 ))}
               </div>
               <div className="pt-4 border-t border-slate-50">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Suppliers</label>
                 {suppliers.map(s => (
                   <button key={s.id} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-600 transition-all">
                     {s.name}
                   </button>
                 ))}
               </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
             <div className="flex items-center gap-2 text-indigo-700 font-bold mb-3">
               <AlertCircle size={18} /> Reliability Stats
             </div>
             <p className="text-xs text-indigo-600/80 leading-relaxed">Suppliers on our platform undergo quarterly audits to ensure stock accuracy and delivery timelines.</p>
          </div>
        </div>

        {/* Main Product Feed */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder="Search wholesale catalog..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
              <Truck size={20} /> View Cart
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-all group-hover:bg-blue-50"></div>
                
                <div className="relative">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-black uppercase tracking-widest">{p.category}</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <p className="text-xs text-slate-500 font-medium">Verified Supplier: <span className="text-slate-900 font-bold">{p.supplier}</span></p>
                  </div>
                  
                  <div className="flex items-end justify-between mt-8">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-tighter font-bold">Wholesale Price</p>
                      <p className="text-3xl font-black text-slate-900">${p.price.toFixed(2)}</p>
                      <p className="text-xs text-slate-500 mt-1">Min. Order: <span className="font-bold">{p.moq} units</span></p>
                    </div>
                    <button className="p-4 bg-slate-900 text-white rounded-[1.5rem] hover:bg-blue-600 hover:scale-105 transition-all shadow-lg group-hover:rotate-6">
                      <Plus size={24} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
