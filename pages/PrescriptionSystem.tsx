
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, Prescription } from '../types';
import { 
  FileText, Search, Plus, Filter, User, Calendar, 
  ExternalLink, CheckCircle, AlertCircle, Clock, X, Save, Printer, Smartphone, History,
  Stethoscope, Zap, ShieldAlert, PenTool
} from 'lucide-react';
import { toast } from '../components/common/Toast';

const PrescriptionSystem: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'void'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [issuedPrescription, setIssuedPrescription] = useState<Prescription | null>(null);

  const mockPrescriptions = [
    { id: '1', patient: 'John Doe', age: 45, code: 'RX-772819', doctor: 'Dr. Sarah Wilson', clinic: 'City Health', status: 'Active', drugs: 'Amoxicillin 500mg, Paracetamol 1g', date: '2023-10-25' },
    { id: '2', patient: 'Jane Roe', age: 32, code: 'RX-129384', doctor: 'Dr. Sarah Wilson', clinic: 'City Health', status: 'Fulfilled', drugs: 'Ibuprofen 400mg', date: '2023-10-24' },
  ];

  const canIssue = user?.e_signature_url !== undefined && user?.e_signature_url !== "";

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canIssue) {
       toast.error("EFDA Compliance Error: Verified e-signature is mandatory to issue prescriptions.");
       return;
    }
    const newRx: any = {
      id: Date.now().toString(),
      doctorName: user?.name,
      clinicName: user?.clinicName || 'Central Clinic',
      patientName: 'New Patient',
      prescriptionCode: 'RX-' + Math.random().toString(36).substr(2, 7).toUpperCase(),
      details: 'Prescription details issued successfully.',
      createdAt: new Date().toISOString(),
      status: 'Active'
    };
    setIssuedPrescription(newRx);
    toast.success("Prescription signed and issued.");
  };

  if (issuedPrescription) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-20 animate-in zoom-in duration-300">
        <div className="flex items-center justify-between">
           <button onClick={() => setIssuedPrescription(null)} className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-500 hover:text-slate-900 transition-all">
             <X size={24} />
           </button>
           <h2 className="text-xl font-black text-slate-900">Issue Successful</h2>
           <div className="flex gap-2">
              <button className="p-3 bg-white rounded-2xl border border-slate-200 text-blue-600 hover:bg-blue-50 transition-all"><Printer size={20} /></button>
              <button className="p-3 bg-white rounded-2xl border border-slate-200 text-blue-600 hover:bg-blue-50 transition-all"><Smartphone size={20} /></button>
           </div>
        </div>

        <div className="bg-white p-12 rounded-[4rem] border-2 border-slate-100 shadow-2xl shadow-blue-100/50 space-y-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8">
              <div className="w-24 h-24 border-4 border-slate-100 rounded-3xl flex items-center justify-center opacity-20 rotate-12">
                 <CheckCircle size={64} />
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                 <FileText size={32} />
              </div>
              <div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight">Prescription</h3>
                 <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">{issuedPrescription.clinicName}</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-10 py-10 border-y-2 border-slate-50 border-dashed">
              <div className="space-y-4">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</p>
                    <p className="text-lg font-black text-slate-900">{issuedPrescription.patientName}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</p>
                    <p className="text-lg font-black text-slate-900">{new Date(issuedPrescription.createdAt).toLocaleDateString()}</p>
                 </div>
              </div>
              <div className="text-right space-y-4">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Code</p>
                    <p className="text-2xl font-black text-blue-600 tracking-widest">{issuedPrescription.prescriptionCode}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Signature</p>
                    <img src={user?.e_signature_url} className="h-12 w-32 object-contain ml-auto opacity-80" alt="E-Sig" />
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Directives</p>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-slate-700 font-medium leading-relaxed italic">
                 {issuedPrescription.details}
              </div>
           </div>

           <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">EFDA Certified Electronic Record • Security Verified</p>
        </div>
        
        <button onClick={() => setIssuedPrescription(null)} className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl shadow-xl hover:bg-slate-800 transition-all">Done & Close</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {!canIssue && user?.role === UserRole.DOCTOR && (
        <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-[2rem] flex items-center gap-6 animate-in slide-in-from-top-4">
           <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-lg"><ShieldAlert size={32}/></div>
           <div className="flex-1">
              <h4 className="text-lg font-black text-rose-900">EFDA Compliance Lock</h4>
              <p className="text-rose-700 font-medium italic">Your account is missing a verified e-signature. Prescription issuance is restricted until a legal signature is uploaded in Settings.</p>
           </div>
           <button onClick={() => toast.success('Upload interface initiated.')} className="px-6 py-3 bg-white text-rose-600 font-black rounded-xl border border-rose-200 shadow-sm hover:bg-rose-50 transition-all flex items-center gap-2">
              <PenTool size={18}/> Upload Signature
           </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-100">
             <Stethoscope size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Digital Directives</h1>
            <p className="text-slate-500 font-medium italic">EFDA-compliant clinical authorizations fulfillment system.</p>
          </div>
        </div>
        {user?.role === UserRole.DOCTOR && !showCreateForm && (
          <button 
            onClick={() => {
              if(!canIssue) { toast.error("Signature required."); return; }
              setShowCreateForm(true);
            }}
            disabled={!canIssue}
            className={`font-black px-8 py-4 rounded-[2rem] shadow-2xl transition-all flex items-center gap-2 group ${canIssue ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <Plus size={24} className="group-hover:rotate-90 transition-transform" />
            Issue New Rx
          </button>
        )}
      </div>

      {showCreateForm ? (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-500">
           <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900">Issue Patient Directive</h3>
              <button onClick={() => setShowCreateForm(false)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"><X size={24} /></button>
           </div>
           <form onSubmit={handleIssue} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                 <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Patient Profile</h4>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
                        <input type="text" required placeholder="Abebe Kebede" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                      </div>
                    </div>
                 </div>
              </div>
              <div className="space-y-8">
                 <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Directives</h4>
                    <div className="space-y-4">
                      <textarea required rows={6} placeholder="Medications & instructions..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium text-sm"></textarea>
                      <div className="flex gap-4 pt-4">
                         <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">Discard</button>
                         <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                           <PenTool size={20} /> Sign & Issue Rx
                         </button>
                      </div>
                    </div>
                 </div>
              </div>
           </form>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-8 border-b bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm">
              {['all', 'active', 'void'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-8 py-2.5 rounded-xl text-xs font-black capitalize transition-all tracking-widest ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Verify Authorization Code..." className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {mockPrescriptions.map(rx => (
              <div key={rx.id} className="p-8 flex flex-col md:flex-row md:items-center gap-8 hover:bg-slate-50 transition-all group">
                <div className="flex-1 flex items-start gap-6">
                  <div className="w-16 h-16 bg-white border-2 border-slate-50 text-slate-300 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-sm group-hover:border-blue-100 group-hover:text-blue-600 transition-all">
                    <User size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">{rx.patient} <span className="text-slate-400 font-medium text-base ml-2">({rx.age} yrs)</span></h4>
                    <p className="text-slate-500 text-sm mt-2 font-medium italic">"{rx.drugs}"</p>
                    <div className="flex items-center gap-6 mt-5">
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg"><Calendar size={14}/> {rx.date}</span>
                      <span className="flex items-center gap-2 text-sm font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-100"><Zap size={14}/> {rx.code}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end gap-6 md:gap-3">
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${rx.status === 'Fulfilled' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                    {rx.status}
                  </span>
                  <div className="hidden md:flex mt-2 gap-2">
                    <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-2xl shadow-sm transition-all"><Printer size={18} /></button>
                    <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-2xl shadow-sm transition-all"><ExternalLink size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionSystem;
