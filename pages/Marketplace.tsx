
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, B2BRequest, B2BBid, B2BTransaction } from '../types';
import { mockApi } from '../services/mockApi';
import { 
  ShoppingBag, Search, Filter, Truck, CheckCircle2, 
  Package, DollarSign, Brain, Plus, ChevronRight, AlertCircle,
  ShieldCheck, Clock, UserCheck, X, EyeOff, Activity
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { toast } from '../components/common/Toast';

const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'market' | 'fulfillment' | 'history'>('market');
  const [requests, setRequests] = useState<B2BRequest[]>([]);
  const [txs, setTxs] = useState<B2BTransaction[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState<B2BRequest | null>(null);
  const [revealedDeal, setRevealedDeal] = useState<any>(null);

  const [newReq, setNewReq] = useState({ medicineName: '', quantity: 100, requiredByDate: '' });
  const [newBid, setNewBid] = useState({ pricePerUnit: 0, deliveryDays: 2 });

  const isSupplier = user?.role === UserRole.SUPPLIER;
  const isPharmacy = user?.role === UserRole.PHARMACY_ADMIN;

  const loadData = async () => {
    const [marketReqs, myTxs] = await Promise.all([
      mockApi.listAnonymousRequests(),
      mockApi.listMyTransactions(user?.organizationId || '')
    ]);
    setRequests(marketReqs);
    setTxs(myTxs);
  };

  useEffect(() => { loadData(); }, [user]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    await mockApi.createB2BRequest(user?.organizationId || '', newReq);
    toast.success('Stealth request deployed.');
    setShowRequestModal(false);
    loadData();
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBidModal) return;
    await mockApi.submitB2BBid(user?.organizationId || '', { requestId: showBidModal.id, ...newBid });
    toast.success('Anonymous bid submitted.');
    setShowBidModal(null);
    loadData();
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      const result = await mockApi.acceptB2BBid(bidId, user?.organizationId || '');
      setRevealedDeal(result);
      toast.success("Identity Revealed! Deal authenticated.");
      loadData();
    } catch (e) {
      toast.error("Operation failed.");
    }
  };

  const handleStatusUpdate = async (txId: string, status: any) => {
    await mockApi.updateTransactionStatus(txId, status);
    toast.success(`Order ${status}`);
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10"><ShoppingBag size={140} /></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
               <EyeOff size={12}/> Stealth B2B Layer Active
            </div>
            <h1 className="text-5xl font-black tracking-tighter">B2B Marketplace</h1>
            <p className="text-slate-400 text-lg max-w-xl italic">Partner identities are masked until a contract is binding.</p>
          </div>
          {isPharmacy && (
            <button onClick={() => setShowRequestModal(true)} className="px-8 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-500 transition-all flex items-center gap-3">
              <Plus size={24} /> Post Stealth Request
            </button>
          )}
        </div>
      </div>

      <div className="flex p-1.5 bg-white border border-slate-200 rounded-[2rem] w-fit shadow-sm">
        {['market', 'fulfillment', 'history'].map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t as any)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'market' && (
            requests.length > 0 ? requests.map(req => (
              <Card key={req.id} className="p-8 border-2 border-transparent hover:border-blue-50 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase tracking-tighter">{req.anonymousPharmacyId}</span>
                    <h3 className="text-2xl font-black text-slate-900">{req.medicineName}</h3>
                    <div className="flex items-center gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><Package size={14}/> {req.quantity} Units</span>
                       <span className="flex items-center gap-1.5"><Clock size={14}/> Due {new Date(req.requiredByDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 min-w-[160px]">
                    {isSupplier ? (
                      <button onClick={() => setShowBidModal(req)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">Submit Stealth Bid</button>
                    ) : (
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                         <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{req.status}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )) : <div className="p-20 text-center text-slate-300 font-bold italic border-2 border-dashed rounded-[4rem]">No active market requests.</div>
          )}

          {activeTab === 'fulfillment' && (
            txs.length > 0 ? txs.map(t => (
              <Card key={t.id} className="p-8 hover:border-blue-100 transition-all">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl"><Truck size={32}/></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{t.medicineName}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Batch ID: {t.id} • Status: <span className="text-blue-600">{t.status}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isSupplier && t.status === 'pending' && <button onClick={() => handleStatusUpdate(t.id, 'shipped')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">Dispatch</button>}
                    {isPharmacy && t.status === 'shipped' && <button onClick={() => handleStatusUpdate(t.id, 'completed')} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase">Delivered</button>}
                  </div>
                </div>
              </Card>
            )) : <div className="p-20 text-center text-slate-300 font-bold italic border-2 border-dashed rounded-[4rem]">No active logistics.</div>
          )}
        </div>

        <div className="space-y-8">
           <Card className="p-10 space-y-6 bg-white border-2 border-slate-900 shadow-2xl">
              <h4 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                <ShieldCheck size={28} className="text-blue-600" /> Protocol Guard
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium italic">"Anonymity prevents price manipulation. Reveal protocol v4.2 enforces identity sharing only after bid acceptance."</p>
              <div className="space-y-4 pt-4 border-t border-slate-50">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>Verified Suppliers</span><span className="text-slate-900">142</span></div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>Active Handshakes</span><span className="text-blue-600">{txs.length}</span></div>
              </div>
           </Card>
        </div>
      </div>

      {/* Identity Reveal Success UI */}
      {revealedDeal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in zoom-in">
           <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden relative p-12 text-center space-y-8">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl"><CheckCircle2 size={48}/></div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Identity Revealed!</h2>
              <div className="grid grid-cols-2 gap-8 py-10 border-y border-slate-50 text-left">
                 <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Supplier Node</p>
                    <p className="font-black text-blue-900 text-lg">{revealedDeal.supplierDetails.name}</p>
                    <p className="text-xs font-bold text-blue-700 mt-1">{revealedDeal.supplierDetails.phone}</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location Hub</p>
                    <p className="font-black text-slate-900 text-lg truncate">{revealedDeal.supplierDetails.address}</p>
                 </div>
              </div>
              <button onClick={() => setRevealedDeal(null)} className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl shadow-xl hover:bg-slate-800 transition-all uppercase text-[10px] tracking-[0.2em]">Synchronize Logistics</button>
           </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden">
             <div className="p-8 border-b border-slate-50 bg-blue-600 text-white flex items-center justify-between">
                <div><h3 className="text-2xl font-black">Post Stealth Request</h3><p className="opacity-80">Masked identity marketplace listing.</p></div>
                <button onClick={() => setShowRequestModal(false)}><X size={24} /></button>
             </div>
             <form onSubmit={handleCreateRequest} className="p-10 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medicine Required</label><input type="text" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={newReq.medicineName} onChange={e => setNewReq({...newReq, medicineName: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label><input type="number" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={newReq.quantity} onChange={e => setNewReq({...newReq, quantity: parseInt(e.target.value)})} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline</label><input type="date" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={newReq.requiredByDate} onChange={e => setNewReq({...newReq, requiredByDate: e.target.value})} /></div>
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase text-[10px] tracking-widest">Deploy Anonymous Directive</button>
             </form>
          </div>
        </div>
      )}

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden">
             <div className="p-8 border-b border-slate-50 bg-slate-900 text-white flex items-center justify-between">
                <div><h3 className="text-2xl font-black">Submit Stealth Bid</h3><p className="opacity-80 uppercase text-[10px] font-black tracking-widest mt-1">Bidding on {showBidModal.medicineName}</p></div>
                <button onClick={() => setShowBidModal(null)}><X size={24} /></button>
             </div>
             <form onSubmit={handleSubmitBid} className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price Per Unit ($)</label><input type="number" step="0.01" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-2xl text-blue-600" value={newBid.pricePerUnit} onChange={e => setNewBid({...newBid, pricePerUnit: parseFloat(e.target.value)})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery SLA (Days)</label><input type="number" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-2xl" value={newBid.deliveryDays} onChange={e => setNewBid({...newBid, deliveryDays: parseInt(e.target.value)})} /></div>
                </div>
                <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-blue-600 transition-all uppercase text-[10px] tracking-widest">Submit Anonymous Proposal</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
