
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PatientPlan } from '../types';
import { geminiService } from '../services/geminiService';
import { Card } from '../components/common/Card';
import { Search, Brain, MapPin, Navigation, ShoppingBag, Clock, Sparkles, Phone, ArrowRight, Filter, ChevronRight, Lock, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientSearch: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);

  const isFree = user?.plan === PatientPlan.FREE;

  const mockPharmacies = [
    { id: 'p1', name: 'Abbebe Pharmacy', distance: '2.3 km', stock: 'Available', price: 10.50, address: 'Bole, Addis Ababa', rating: 4.8 },
    { id: 'p2', name: 'Kidus Pharmacy', distance: '3.1 km', stock: 'Low Stock (< 10 units)', price: 9.99, address: 'Piassa, Addis Ababa', rating: 4.5 },
    { id: 'p3', name: 'HealthFirst Hub', distance: '4.2 km', stock: 'Available', price: 11.20, address: 'Mexico, Addis Ababa', rating: 4.2 },
  ];

  const allAvailableMedicines = [
    "Amoxicillin", "Paracetamol", "Ibuprofen", "Metformin", "Lisinopril", 
    "Atorvastatin", "Amlodipine", "Omeprazole", "Losartan", "Albuterol"
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setSearching(true);
    setAiSuggestions([]);
    setTimeout(async () => {
      setResults(mockPharmacies);
      setSearching(false);
      if (!isFree) {
        const suggestions = await geminiService.fuzzySearchMedicines(query, allAvailableMedicines);
        setAiSuggestions(suggestions);
      }
    }, 800);
  };

  const handlePlaceRequest = (item: any) => {
    if (isFree) { navigate('/subscription'); return; }
    navigate('/place-request', { state: { medicine: query || 'Medicine', pharmacy: item } });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Find Your Medicine <span className="text-blue-600">Instantly</span></h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto">Cross-compare inventory across thousands of nodes in Addis Ababa.</p>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl p-10 border border-slate-100 relative group">
        <form onSubmit={handleSearch} className="relative z-10 space-y-6">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={32} />
            <input type="text" placeholder="Medicine name..." className="w-full pl-16 pr-4 py-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] text-2xl font-black focus:ring-4 focus:ring-blue-100 outline-none" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-5 rounded-[2rem] shadow-xl flex items-center gap-2 text-lg transition-all">{searching ? 'SCANNING...' : 'SEARCH'}</button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {results.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {results.map(p => (
              <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group hover:shadow-2xl transition-all">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[1.75rem] flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all"><ShoppingBag size={36} /></div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className={`text-2xl font-black text-slate-900 transition-all ${isFree ? 'blur-md select-none' : ''}`}>{p.name}</h4>
                    {!isFree && <div className="px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-black">★ {p.rating}</div>}
                  </div>
                  <div className={`flex items-center gap-4 text-slate-500 font-bold text-sm ${isFree ? 'blur-sm select-none' : ''}`}>
                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-blue-500" /> {p.distance} away</span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">{p.stock}</span>
                  </div>
                  <p className={`text-slate-400 text-sm font-medium ${isFree ? 'blur-sm select-none' : ''}`}>{p.address}</p>
                </div>
                <div className="flex flex-col items-center md:items-end gap-6 md:border-l border-slate-50 md:pl-10 min-w-[200px]">
                  <div className="text-center md:text-right">
                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Local Best Price</p>
                    <p className={`text-4xl font-black text-slate-900 tracking-tighter ${isFree ? 'blur-lg' : ''}`}>${p.price.toFixed(2)}</p>
                  </div>
                  {isFree ? (
                    <button onClick={() => navigate('/subscription')} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                       <Lock size={18}/> Unlock Info
                    </button>
                  ) : (
                    <button onClick={() => handlePlaceRequest(p)} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2">Request <ArrowRight size={18}/></button>
                  )}
                </div>
                {isFree && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                     <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-lg">Subscription Required for Full Access</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isFree && (
        <Card className="bg-indigo-600 p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 text-center lg:text-left">
            <h3 className="text-3xl font-black">Enable Health Monetization</h3>
            <p className="text-indigo-100 text-lg max-w-xl">Upgrade to see pharmacy names, live locations, and unlock direct medicine procurement.</p>
          </div>
          <button onClick={() => navigate('/subscription')} className="bg-white text-indigo-600 px-12 py-6 rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-2xl">Go Premium $9.99/mo</button>
        </Card>
      )}
    </div>
  );
};

export default PatientSearch;
