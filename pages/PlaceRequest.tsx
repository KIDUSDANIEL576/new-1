
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, CreditCard, ChevronRight, CheckCircle2, Banknote, Smartphone, X, Zap, ArrowLeft } from 'lucide-react';

const PlaceRequest: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { medicine, pharmacy } = location.state || {};

  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'Telebirr' | 'Bank'>('Telebirr');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!medicine || !pharmacy) {
    return <div className="p-10 text-center text-slate-400">Invalid Request Details. <button onClick={() => navigate('/search')} className="text-blue-600 font-bold">Return to Search</button></div>;
  }

  const total = pharmacy.price * quantity;

  const handleProcess = () => {
    setIsProcessing(true);
    // Simulate payment flow
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="h-full flex items-center justify-center animate-in zoom-in duration-300 p-6">
        <div className="bg-white p-16 rounded-[4rem] border border-slate-100 shadow-2xl text-center space-y-8 max-w-xl w-full">
           <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-lg shadow-emerald-50">
              <CheckCircle2 size={48} />
           </div>
           <div>
              <h2 className="text-4xl font-black text-slate-900">Request Sent!</h2>
              <p className="text-slate-500 mt-2 font-medium">Tracking ID: REQ-{Date.now()}</p>
           </div>
           <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 text-left space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Pharmacy</span>
                 <span className="text-sm font-black text-emerald-900">{pharmacy.name}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Medicine</span>
                 <span className="text-sm font-black text-emerald-900">{medicine} × {quantity}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-emerald-100">
                 <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Estimated Ready</span>
                 <span className="text-sm font-black text-emerald-900">4-12 hours</span>
              </div>
           </div>
           <div className="space-y-4 pt-4">
              <button onClick={() => navigate('/search')} className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl hover:bg-slate-800 transition-all">Track in My History</button>
              <button onClick={() => navigate('/search')} className="w-full py-5 text-slate-500 font-bold hover:bg-slate-50 rounded-3xl transition-all">Return to Search</button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-all">
         <ArrowLeft size={16} /> Back to Results
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center shrink-0">
                   <ShoppingBag size={32} />
                </div>
                <div>
                   <h1 className="text-3xl font-black text-slate-900">{medicine}</h1>
                   <p className="text-slate-500 font-medium">{pharmacy.name} • <span className="text-blue-600 font-bold">{pharmacy.distance}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-10 border-y border-slate-50">
                 <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Quantity Requested</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-3xl border border-slate-100 w-fit">
                       <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-xl shadow-sm hover:text-blue-600 transition-all">−</button>
                       <span className="text-2xl font-black w-10 text-center">{quantity}</span>
                       <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-xl shadow-sm hover:text-blue-600 transition-all">+</button>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Total Amount</p>
                    <p className="text-5xl font-black text-blue-600 tracking-tighter">${total.toFixed(2)}</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <h3 className="text-lg font-black text-slate-900">Select Payment Method</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setPaymentMethod('Telebirr')}
                      className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 ${
                        paymentMethod === 'Telebirr' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xl shadow-indigo-100' : 'bg-slate-50 border-transparent text-slate-400 opacity-60'
                      }`}
                    >
                       <Smartphone size={32} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Telebirr Checkout</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('Bank')}
                      className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 ${
                        paymentMethod === 'Bank' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xl shadow-blue-100' : 'bg-slate-50 border-transparent text-slate-400 opacity-60'
                      }`}
                    >
                       <Banknote size={32} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Bank Transfer</span>
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="w-full lg:w-96 space-y-6">
           <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl space-y-8 sticky top-8">
              <h3 className="text-xl font-black">Order Summary</h3>
              <div className="space-y-4">
                 <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    <span>Subtotal</span>
                    <span className="text-white text-sm">${total.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    <span>SaaS Fee</span>
                    <span className="text-white text-sm">$0.00</span>
                 </div>
                 <div className="flex justify-between items-center pt-6 border-t border-white/10">
                    <span className="text-lg font-black tracking-tight">Total Due</span>
                    <span className="text-3xl font-black text-blue-400 tracking-tighter">${total.toFixed(2)}</span>
                 </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex gap-3">
                 <Zap size={18} className="text-amber-400 shrink-0 mt-0.5" />
                 <p className="text-[10px] font-bold text-white/60 leading-relaxed uppercase tracking-widest">Paid Plan Benefit: Your request gets Priority Queue status (Ready in &lt; 4hrs).</p>
              </div>

              <button 
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black rounded-3xl shadow-2xl shadow-blue-900 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {isProcessing ? (
                   <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                   <>
                     <CreditCard size={24} />
                     Pay via {paymentMethod}
                   </>
                )}
              </button>
              <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Healthcare Transaction Layer</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceRequest;
