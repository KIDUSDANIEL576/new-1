
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { mockApi } from '../services/mockApi';
import { Package, ChevronRight, AlertCircle, CheckCircle2, ShieldPlus, Clock, ArrowLeft } from 'lucide-react';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: UserRole.PHARMACY_ADMIN,
    purpose: '',
    agreeToTerms: false
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!formData.phone.match(/^09\d{8}$/)) {
      setError("Identity phone must be 09xxxxxxxx.");
      setIsSubmitting(false);
      return;
    }

    const result = await register(formData);
    
    if (result.success) {
      setSuccess(result.message);
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-xl w-full text-center space-y-8 animate-in zoom-in duration-500">
           <div className="inline-flex items-center justify-center p-8 bg-amber-100 text-amber-600 rounded-[3rem] shadow-xl relative overflow-hidden">
             <Clock size={64} className="relative z-10" />
             <div className="absolute inset-0 bg-amber-50 animate-pulse"></div>
           </div>
           <div className="space-y-4">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Account Under Review</h1>
              <p className="text-slate-500 text-lg leading-relaxed font-medium italic">"Node identity established. Root Admin verification and payment authentication in progress. You will receive access credentials via email once authorized."</p>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-amber-200 text-left space-y-4">
              <div className="flex items-center gap-3 text-amber-600">
                 <AlertCircle size={20}/>
                 <p className="text-[10px] font-black uppercase tracking-widest">Next Verification Steps</p>
              </div>
              <ul className="space-y-2 text-xs font-bold text-slate-600 list-disc pl-5 uppercase tracking-wide">
                 <li>Confirm Identity Documents (EFDA/ID)</li>
                 <li>Verify Offline Subscription Payment</li>
                 <li>Admin Credential Dispatch (Welcome Email)</li>
              </ul>
           </div>
           <button onClick={() => navigate('/login')} className="w-full py-5 bg-slate-900 text-white font-black rounded-[2rem] shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
              Return to Entrance Hub <ArrowLeft size={16}/>
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 py-20">
      <div className="max-w-2xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl text-white mb-4 shadow-xl">
            <ShieldPlus size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Node Enrollment</h1>
          <p className="text-slate-500 font-medium">Provision your intent at the MedIntelliCare Core.</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="flex items-center gap-3 p-5 bg-rose-50 text-rose-600 rounded-2xl text-sm border border-rose-100 font-bold">
                <AlertCircle size={20} />
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity/Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  placeholder="Abbebe Kebede"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Node Identity (Email)</label>
                <input
                  type="email"
                  required
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact (09xxxxxxxx)</label>
                <input
                  type="text"
                  required
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  placeholder="0911223344"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enrollment Purpose</label>
                <select
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-black"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                >
                   <option value={UserRole.PHARMACY_ADMIN}>Pharmacy Provider</option>
                   <option value={UserRole.DOCTOR}>Medical Professional</option>
                   <option value={UserRole.SUPPLIER}>Pharma Supplier</option>
                   <option value={UserRole.PATIENT}>Patient Access</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Enrollment / Notes</label>
              <textarea
                required
                rows={3}
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium italic resize-none"
                placeholder="Describe your facility or medical practice..."
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              ></textarea>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input 
                type="checkbox" 
                required 
                className="w-5 h-5 text-blue-600 rounded-lg border-slate-200" 
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
              />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">I acknowledge the Review Protocol & Terms</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-blue-100 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95"
            >
              {isSubmitting ? 'Deploying Intent...' : 'Initialize Enrollment'}
              <ChevronRight size={24} />
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-50 text-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Already registered? <Link to="/login" className="text-blue-600 hover:underline">Verify Identity</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
