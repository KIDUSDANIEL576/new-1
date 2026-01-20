
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Building2, Stethoscope, Users, ShoppingBag, 
  BarChart3, DollarSign, ShieldCheck, Zap, TrendingUp,
  ChevronRight, Filter, Search, Calendar, CreditCard,
  Target, ShieldAlert, LogOut, Package, ArrowUpRight,
  Download, Plus, Edit, Trash2, Key, X, CheckCircle2, AlertTriangle,
  Mail, Phone, MapPin, MoreVertical, FileText, PenTool, Image as ImageIcon,
  Flame, PauseCircle, Gauge, UserX, Clock, ShieldX, RefreshCw,
  MousePointer2, PieChart, Info, Banknote, HardDrive, Cpu, Fingerprint
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart as RePieChart, Pie,
  LineChart, Line
} from 'recharts';
import { RevenueLedger, UserRole, Pharmacy, PharmacyPlan, User, SystemSafety, SecurityLog, ProductIntelligence, PatientPlan, IntegrityAlert } from '../types';
import { mockApi } from '../services/mockApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button/Button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/common/Toast';

const SuperAdmin: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Navigation & UI State
  const [activeModule, setActiveModule] = useState<'overview' | 'pharmacies' | 'doctors' | 'patients' | 'pharmaceuticals' | 'safety'>('overview');
  const [revenueRange, setRevenueRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  
  // Data State
  const [ledger, setLedger] = useState<RevenueLedger | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [safety, setSafety] = useState<SystemSafety | null>(null);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [intel, setIntel] = useState<ProductIntelligence | null>(null);
  const [pulse, setPulse] = useState<any>(null);
  const [integrityAlerts, setIntegrityAlerts] = useState<IntegrityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [pharmacyFilters, setPharmacyFilters] = useState({ search: '', plan: 'All' });
  const [doctorFilters, setDoctorFilters] = useState({ search: '', status: 'All' });
  const [patientFilters, setPatientFilters] = useState({ search: '' });

  // Modals
  const [showPharmacyModal, setShowPharmacyModal] = useState<{ type: 'add' | 'edit', data?: Pharmacy } | null>(null);
  const [showDoctorModal, setShowDoctorModal] = useState<{ type: 'add' | 'edit', data?: User } | null>(null);
  const [showKeyModal, setShowKeyModal] = useState<{ id: string, name: string, email: string, type: 'pharmacy' | 'doctor' } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: string, name: string, type: 'pharmacy' | 'doctor' | 'patient' } | null>(null);
  const [showPatientApprovalModal, setShowPatientApprovalModal] = useState<{ id: string, name: string, action: 'approve' | 'reject' } | null>(null);
  
  const [paymentAmount, setPaymentAmount] = useState('9.99');

  // Form States
  const [pharmacyForm, setPharmacyForm] = useState<Partial<Pharmacy>>({ name: '', email: '', phone: '', address: '', plan: PharmacyPlan.BASIC, createdAt: new Date().toISOString().split('T')[0], planStartDate: new Date().toISOString().split('T')[0], expiryDate: '' });
  const [doctorForm, setDoctorForm] = useState<Partial<User>>({ name: '', email: '', phone: '', clinicName: '', licenseNumber: '', e_signature_url: '' });
  const [keyForm, setKeyForm] = useState({ username: '', password: '' });

  const fetchData = async () => {
    setLoading(true);
    const [ledgerData, pharmacyData, doctorData, patientData, safetyData, logsData, intelData, pulseData, alertsData] = await Promise.all([
      mockApi.getRevenueLedger(),
      mockApi.getPharmacies(),
      mockApi.getDoctors(),
      mockApi.getPatients(),
      mockApi.getSystemSafety(),
      mockApi.getSecurityLogs(),
      mockApi.getProductIntelligence(),
      mockApi.getInfrastructurePulse(),
      mockApi.getIntegrityAlerts()
    ]);
    setLedger(ledgerData);
    setPharmacies(pharmacyData);
    setDoctors(doctorData);
    setPatients(patientData);
    setSafety(safetyData);
    setSecurityLogs(logsData);
    setIntel(intelData);
    setPulse(pulseData);
    setIntegrityAlerts(alertsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = useMemo(() => {
    if (!ledger) return [];
    return ledger.history[revenueRange];
  }, [ledger, revenueRange]);

  const filteredPharmacies = useMemo(() => pharmacies.filter(p => p.name.toLowerCase().includes(pharmacyFilters.search.toLowerCase()) || p.email.toLowerCase().includes(pharmacyFilters.search.toLowerCase())), [pharmacies, pharmacyFilters]);
  const filteredDoctors = useMemo(() => doctors.filter(d => d.name.toLowerCase().includes(doctorFilters.search.toLowerCase()) || d.email.toLowerCase().includes(doctorFilters.search.toLowerCase())), [doctors, doctorFilters]);
  const pendingPatients = useMemo(() => patients.filter(p => p.patientStatus === 'pending_approval' && p.name.toLowerCase().includes(patientFilters.search.toLowerCase())), [patients, patientFilters]);

  // Handlers
  const handleSafetyToggle = async (key: keyof SystemSafety, value: boolean | number) => {
    if (!safety) return;
    const updated = await mockApi.updateSafety({ [key]: value });
    setSafety(updated);
    toast.success(`System directive updated: ${key} = ${value}`);
  };

  const handlePatientAction = async () => {
    if (!showPatientApprovalModal) return;
    if (showPatientApprovalModal.action === 'approve') {
      const amount = parseFloat(paymentAmount);
      await mockApi.approvePatient(showPatientApprovalModal.id, amount);
      toast.success('Patient Paid Access activated. Revenue recorded.');
    } else {
      await mockApi.rejectPatient(showPatientApprovalModal.id);
      toast.error('Patient node rejected.');
    }
    setShowPatientApprovalModal(null);
    setPaymentAmount('9.99');
    fetchData();
  };

  const handleSavePharmacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPharmacyModal) return;
    if (showPharmacyModal.type === 'add') {
      await mockApi.addPharmacy(pharmacyForm);
      toast.success('Pharmacy node initialized.');
    } else if (showPharmacyModal.data?.id) {
      await mockApi.updatePharmacy(showPharmacyModal.data.id, pharmacyForm);
      toast.success('Pharmacy node modified.');
    }
    setShowPharmacyModal(null);
    fetchData();
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDoctorModal) return;
    if (showDoctorModal.type === 'add') {
      await mockApi.addDoctor(doctorForm);
      toast.success('Doctor authorized.');
    } else if (showDoctorModal.data?.id) {
      await mockApi.updateDoctor(showDoctorModal.data.id, doctorForm);
      toast.success('Doctor identity modified.');
    }
    setShowDoctorModal(null);
    fetchData();
  };

  const handleSetKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showKeyModal) return;
    if (showKeyModal.type === 'pharmacy') {
      await mockApi.setPharmacyCredentials(showKeyModal.id, keyForm);
    } else {
      await mockApi.setDoctorCredentials(showKeyModal.id, keyForm);
    }
    toast.success('Access credentials dispatched.');
    setShowKeyModal(null);
  };

  const handleDeleteEntry = async () => {
    if (!showDeleteModal) return;
    if (showDeleteModal.type === 'pharmacy') {
      await mockApi.deletePharmacy(showDeleteModal.id);
    } else if (showDeleteModal.type === 'doctor') {
      await mockApi.deleteDoctor(showDeleteModal.id);
    } else if (showDeleteModal.type === 'patient') {
      await mockApi.deletePatient(showDeleteModal.id);
    }
    toast.error('Node decommissioned.');
    setShowDeleteModal(null);
    fetchData();
  };

  const renderOverview = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Infrastructure Pulse Section 10.7 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="p-10 space-y-8 border-2 border-slate-900 bg-white">
            <div className="flex items-center justify-between">
               <h4 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
                  <Zap className="text-blue-600" /> Infrastructure Pulse
               </h4>
               <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Live Network Telemetry
               </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Active Users (DAU)</p>
                    <h3 className="text-3xl font-black text-slate-900">1,842</h3>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">+14% vs. avg</p>
                  </div>
                  <div className="h-24 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pulse?.dau}>
                           <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
               <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenant Node Growth</p>
                    <h3 className="text-3xl font-black text-slate-900">+12 Nodes</h3>
                    <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">Expansion Cycle Active</p>
                  </div>
                  <div className="h-24 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={pulse?.tenantGrowth}>
                           <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={false} />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>
         </Card>

         {/* Real-time Integrity Alerts Section 10.7 */}
         <Card className="p-10 space-y-8 bg-slate-900 text-white border-none shadow-2xl">
            <div className="flex items-center justify-between">
               <h4 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter text-rose-400">
                  <ShieldAlert size={32} className="animate-pulse" /> Integrity Monitoring
               </h4>
               <button onClick={fetchData} className="p-2 hover:bg-white/10 rounded-lg transition-all"><RefreshCw size={20}/></button>
            </div>
            <div className="space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
               {integrityAlerts.map(alert => (
                 <div key={alert.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-all cursor-default">
                    <div className={`p-2 rounded-xl shrink-0 ${alert.impact === 'high' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-900'}`}>
                       {alert.description.includes('Email') ? <Fingerprint size={16}/> : alert.description.includes('Traffic') ? <Activity size={16}/> : <Package size={16}/>}
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-bold text-white leading-tight">{alert.description}</p>
                       <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${alert.impact === 'high' ? 'bg-rose-900 text-rose-100' : 'bg-amber-900 text-amber-100'}`}>
                       {alert.impact}
                    </span>
                 </div>
               ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Scan Protocol v4.2</span>
               <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300">Run Global Audit →</button>
            </div>
         </Card>
      </div>

      {/* Legacy Stats (MRR, Nodes, Integrity, Status) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-50">
           <div className="flex justify-between items-center mb-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Activity size={28}/></div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12.5%</span>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aggregate MRR</p>
           <h3 className="text-3xl font-black text-slate-900">${ledger?.aggregateTotal?.toLocaleString() || '0'}</h3>
        </Card>
        <Card className="p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-50">
           <div className="flex justify-between items-center mb-4">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Target size={28}/></div>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">NRR: {ledger?.nrr}%</span>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Client Nodes</p>
           <h3 className="text-3xl font-black text-slate-900">{ledger?.activeNodes} Nodes</h3>
        </Card>
        <Card className="p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-emerald-50">
           <div className="flex justify-between items-center mb-4">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><ShieldCheck size={28}/></div>
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">Churn: {ledger?.churnRate}%</span>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Integrity</p>
           <h3 className="text-3xl font-black text-slate-900">Verified</h3>
        </Card>
        <Card className="p-8 hover:shadow-xl transition-all bg-slate-900 text-white border-none shadow-2xl">
           <div className="flex justify-between items-center mb-4">
              <div className="p-4 bg-white/10 text-blue-400 rounded-2xl"><Zap size={28}/></div>
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Platform Status</p>
           <h3 className="text-3xl font-black">Live Pegasus</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="text-blue-600" /> Growth vs. Churned Protocol
              </h4>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Expansion dynamics and node retention</p>
            </div>
            <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner">
              {(['weekly', 'monthly', 'yearly'] as const).map(range => (
                <button key={range} onClick={() => setRevenueRange(range)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${revenueRange === range ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{range}</button>
              ))}
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '1rem', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} name="Growth/Expansion" />
                <Area type="monotone" dataKey="churned" stroke="#f43f5e" fillOpacity={1} fill="url(#colorChurn)" strokeWidth={2} strokeDasharray="5 5" name="Churn Inflow" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-10 bg-white border-slate-100 shadow-xl space-y-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5"><DollarSign size={120} className="text-slate-900" /></div>
           <div className="relative z-10">
              <h4 className="text-xl font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-6">Revenue Attribution Matrix</h4>
              <div className="space-y-6 pt-6">
                {[
                  { label: 'Basic Plans', val: ledger?.bySource?.basicPlans, color: 'bg-slate-400' },
                  { label: 'Standard Plans', val: ledger?.bySource?.standardPlans, color: 'bg-blue-400' },
                  { label: 'Platinum Plans', val: ledger?.bySource?.platinumPlans, color: 'bg-indigo-600' },
                  { label: 'Doctor Node Subscriptions', val: ledger?.bySource?.doctors, color: 'bg-emerald-500' },
                  { label: 'Patient Direct Access', val: ledger?.bySource?.patients, color: 'bg-rose-500' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">${item.val?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden"><div className={`h-full ${item.color} transition-all duration-1000`} style={{ width: `${((item.val || 0) / (ledger?.aggregateTotal || 1)) * 100}%` }}></div></div>
                  </div>
                ))}
              </div>
           </div>
        </Card>
      </div>

      {/* Product Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-10 space-y-8">
           <h4 className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
             <Zap className="text-amber-500" /> Speed-to-Value (S2V)
           </h4>
           <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">T.T.F Inventory</p>
                   <h3 className="text-2xl font-black text-slate-900">{intel?.avgTimeToFirstInventory}h</h3>
                 </div>
                 <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Package size={24}/></div>
              </div>
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">T.T.F First Sale</p>
                   <h3 className="text-2xl font-black text-slate-900">{intel?.avgTimeToFirstSale}h</h3>
                 </div>
                 <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><DollarSign size={24}/></div>
              </div>
           </div>
        </Card>

        <Card className="p-10 lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between">
              <h4 className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
                <MousePointer2 className="text-indigo-600" /> Plan Feature Adoption Matrix
              </h4>
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 uppercase">
                   Paywall Hits: {intel?.paywallHits.toLocaleString()}
                 </span>
                 <button className="p-2 text-slate-300 hover:text-blue-600 transition-all"><Info size={16}/></button>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {intel?.featureAdoption.map(f => (
                <div key={f.feature} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>{f.feature}</span>
                    <span className="text-slate-900">{f.adoptionRate}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div className="h-full bg-indigo-600 transition-all duration-1000 shadow-sm" style={{ width: `${f.adoptionRate}%` }}></div>
                  </div>
                </div>
              ))}
           </div>
        </Card>
      </div>
    </div>
  );

  const renderPharmacies = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search nodes..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold shadow-sm" value={pharmacyFilters.search} onChange={e => setPharmacyFilters({...pharmacyFilters, search: e.target.value})} />
        </div>
        <Button variant="primary" className="rounded-2xl" onClick={() => { setPharmacyForm({ name: '', email: '', phone: '', address: '', plan: PharmacyPlan.BASIC, createdAt: new Date().toISOString().split('T')[0], planStartDate: new Date().toISOString().split('T')[0], expiryDate: '' }); setShowPharmacyModal({ type: 'add' }); }} icon={<Plus size={18}/>}>Initialize Node</Button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Node Identity</th>
                <th className="px-8 py-5">Service Tier</th>
                <th className="px-8 py-5">Integrity Status</th>
                <th className="px-8 py-5 text-center">Staff Count</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPharmacies.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">{p.name[0]}</div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${p.plan === PharmacyPlan.PLATINUM ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : p.plan === PharmacyPlan.STANDARD ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{p.plan}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${p.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full bg-current ${p.status === 'Active' ? 'animate-pulse' : ''}`}></div>{p.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center"><p className="font-black text-slate-700">{p.staffCount}</p><p className="text-[10px] text-slate-400 uppercase font-bold">Authorized</p></td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setPharmacyForm(p); setShowPharmacyModal({ type: 'edit', data: p }); }} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-xl shadow-sm transition-all"><Edit size={18}/></button>
                      <button onClick={() => { setKeyForm({ username: '', password: '' }); setShowKeyModal({ id: p.id, name: p.name, email: p.email, type: 'pharmacy' }); }} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 rounded-xl shadow-sm transition-all"><Key size={18}/></button>
                      <button onClick={() => setShowDeleteModal({ id: p.id, name: p.name, type: 'pharmacy' })} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 rounded-xl shadow-sm transition-all"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDoctors = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search doctors..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold shadow-sm" value={doctorFilters.search} onChange={e => setDoctorFilters({...doctorFilters, search: e.target.value})} />
        </div>
        <Button variant="primary" className="rounded-2xl" onClick={() => { setDoctorForm({ name: '', email: '', phone: '', clinicName: '', licenseNumber: '', e_signature_url: '' }); setShowDoctorModal({ type: 'add' }); }} icon={<Plus size={18}/>}>Authorize Doctor</Button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Medical Professional</th>
                <th className="px-8 py-5">EFDA Compliance</th>
                <th className="px-8 py-5 text-center">Rx Volume</th>
                <th className="px-8 py-5">Linked Clinic</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDoctors.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all"><Stethoscope size={24} /></div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight">{d.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Lic: {d.licenseNumber || 'PENDING'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {d.e_signature_url ? (
                      <div className="flex items-center gap-2 text-emerald-600"><ShieldCheck size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Verified E-Sig</span></div>
                    ) : (
                      <div className="flex items-center gap-2 text-rose-500"><AlertTriangle size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Blocked (No Sig)</span></div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center"><p className="font-black text-slate-700">{d.total_prescriptions || 0}</p><p className="text-[10px] text-slate-400 uppercase font-bold">Issued</p></td>
                  <td className="px-8 py-6"><p className="text-sm font-black text-slate-700">{d.clinicName || 'N/A'}</p></td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setDoctorForm(d); setShowDoctorModal({ type: 'edit', data: d }); }} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-xl shadow-sm transition-all"><Edit size={18}/></button>
                      <button onClick={() => { setKeyForm({ username: '', password: '' }); setShowKeyModal({ id: d.id, name: d.name, email: d.email, type: 'doctor' }); }} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 rounded-xl shadow-sm transition-all"><Key size={18}/></button>
                      <button onClick={() => setShowDeleteModal({ id: d.id, name: d.name, type: 'doctor' })} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 rounded-xl shadow-sm transition-all"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><Users size={24}/></div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Patient Approval Queue</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verify credentials and payments</p>
                  </div>
               </div>
               <div className="relative w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input type="text" placeholder="Search queue..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold" value={patientFilters.search} onChange={e => setPatientFilters({...patientFilters, search: e.target.value})} />
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Full Identity</th>
                    <th className="px-8 py-4">Signed Up</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pendingPatients.length > 0 ? pendingPatients.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-8 py-5">
                         <p className="font-black text-slate-900 leading-none">{p.name}</p>
                         <p className="text-xs text-slate-400 mt-1 font-medium">{p.email} • {p.phone || 'No Phone'}</p>
                      </td>
                      <td className="px-8 py-5">
                         <p className="text-xs font-bold text-slate-700">{new Date(p.createdAt || '').toLocaleDateString()}</p>
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Awaiting Verification</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <button onClick={() => setShowPatientApprovalModal({ id: p.id, name: p.name, action: 'approve' })} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">Approve</button>
                           <button onClick={() => setShowPatientApprovalModal({ id: p.id, name: p.name, action: 'reject' })} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Reject</button>
                         </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="px-8 py-10 text-center text-slate-400 font-bold italic">Queue currently cleared. No pending signups.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="overflow-hidden">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 text-rose-400 rounded-2xl"><ShieldAlert size={24}/></div>
                  <h4 className="text-xl font-black tracking-tight">Security & Abuse Protocol</h4>
                </div>
                <button onClick={fetchData} className="p-2 hover:bg-white/10 rounded-lg transition-all"><RefreshCw size={20}/></button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-4">Timestamp</th>
                        <th className="px-8 py-4">Event Identity</th>
                        <th className="px-8 py-4">Directives / Details</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800 bg-slate-900 text-slate-300">
                      {securityLogs.map(log => (
                        <tr key={log.id} className="hover:bg-white/5 transition-all">
                           <td className="px-8 py-5 text-xs font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                           <td className="px-8 py-5">
                              <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter ${
                                log.severity === 'high' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-900'
                              }`}>{log.type}</span>
                           </td>
                           <td className="px-8 py-5 text-xs font-medium italic opacity-70">"{log.message}"</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="p-8 space-y-10 border-2 border-slate-900 bg-white shadow-2xl">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                 <div className="p-3 bg-slate-900 text-white rounded-2xl"><Activity size={24}/></div>
                 <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">System Pulse</h4>
              </div>

              <div className="space-y-8">
                 <div className="flex items-center justify-between p-6 bg-rose-50 rounded-[2rem] border border-rose-100 group transition-all hover:bg-rose-600 hover:border-rose-700">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-rose-600 text-white rounded-2xl group-hover:bg-white group-hover:text-rose-600 transition-all"><Flame size={24}/></div>
                       <div>
                          <p className="font-black text-rose-900 group-hover:text-white transition-all uppercase text-xs tracking-widest">Master Kill Switch</p>
                          <p className="text-[10px] text-rose-700 group-hover:text-rose-100 font-bold uppercase">Disable all patient access</p>
                       </div>
                    </div>
                    <button onClick={() => handleSafetyToggle('kill_switch_active', !safety?.kill_switch_active)} className={`w-14 h-8 rounded-full p-1 transition-all ${safety?.kill_switch_active ? 'bg-white' : 'bg-rose-200'}`}>
                       <div className={`w-6 h-6 rounded-full transition-all ${safety?.kill_switch_active ? 'translate-x-6 bg-rose-600' : 'translate-x-0 bg-white shadow-md'}`}></div>
                    </button>
                 </div>

                 <div className="flex items-center justify-between p-6 bg-blue-50 rounded-[2rem] border border-blue-100 group transition-all hover:bg-blue-600">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-blue-600 text-white rounded-2xl group-hover:bg-white group-hover:text-blue-600 transition-all"><PauseCircle size={24}/></div>
                       <div>
                          <p className="font-black text-blue-900 group-hover:text-white transition-all uppercase text-xs tracking-widest">Pause Requests</p>
                          <p className="text-[10px] text-blue-700 group-hover:text-blue-100 font-bold uppercase">Block medicine fulfillment</p>
                       </div>
                    </div>
                    <button onClick={() => handleSafetyToggle('pause_requests', !safety?.pause_requests)} className={`w-14 h-8 rounded-full p-1 transition-all ${safety?.pause_requests ? 'bg-white' : 'bg-blue-200'}`}>
                       <div className={`w-6 h-6 rounded-full transition-all ${safety?.pause_requests ? 'translate-x-6 bg-blue-600' : 'translate-x-0 bg-white shadow-md'}`}></div>
                    </button>
                 </div>

                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-slate-900 text-white rounded-2xl"><Gauge size={24}/></div>
                       <div>
                          <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Rate Limit Protocol</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Requests per patient / day</p>
                       </div>
                    </div>
                    <div className="flex gap-4 items-center">
                       <input type="number" className="flex-1 px-5 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xl text-center shadow-inner" value={safety?.rate_limit_per_day || 0} onChange={e => handleSafetyToggle('rate_limit_per_day', parseInt(e.target.value))} />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Limit Set</span>
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );

  const renderModulePlaceholder = (name: string) => (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 space-y-6 animate-in zoom-in duration-300">
       <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center"><Activity size={48} /></div>
       <div>
          <h2 className="text-3xl font-black text-slate-900 capitalize">{name} Module Protocol</h2>
          <p className="text-slate-500 max-w-md mx-auto mt-2">The core management interface for {name} is being provisioned in the next operation cycle.</p>
       </div>
       <Button variant="outline" onClick={() => setActiveModule('overview')}>Return to Hub</Button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">Sovereign Control</span>
              <span className="text-slate-400 text-xs font-bold">V4.0 Pegasus Node</span>
           </div>
           <h1 className="text-5xl font-black text-slate-900 tracking-tight">Intelligence Hub</h1>
           <p className="text-slate-500 text-lg font-medium italic mt-2">Auditable analytics and platform trajectory metrics.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-2">
              {[
                { id: 'overview', icon: Activity, label: 'Analytics' },
                { id: 'pharmacies', icon: Building2, label: 'Pharmacies' },
                { id: 'doctors', icon: Stethoscope, label: 'Doctors' },
                { id: 'patients', icon: Users, label: 'Patients' },
                { id: 'pharmaceuticals', icon: ShoppingBag, label: 'Pharma' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveModule(tab.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeModule === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                  <tab.icon size={18} /><span className="hidden lg:inline">{tab.label}</span>
                </button>
              ))}
              <div className="w-[2px] h-8 bg-slate-100 mx-2"></div>
              <button onClick={() => setActiveModule('safety')} className={`p-3 rounded-full transition-all ${activeModule === 'safety' ? 'bg-rose-600 text-white shadow-xl shadow-rose-200' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`} title="System Safety Pulse"><ShieldAlert size={22} /></button>
           </div>
           <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
              <div className="text-right hidden sm:block">
                 <p className="text-sm font-black text-slate-900">{user?.name || 'Super Admin'}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Root Authority</p>
              </div>
              <button onClick={() => { logout(); navigate('/login'); }} className="p-3 bg-white border border-slate-100 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all shadow-sm"><LogOut size={20} /></button>
           </div>
        </div>
      </div>

      {activeModule === 'overview' && renderOverview()}
      {activeModule === 'pharmacies' && renderPharmacies()}
      {activeModule === 'doctors' && renderDoctors()}
      {activeModule === 'patients' && renderPatients()}
      {!['overview', 'pharmacies', 'doctors', 'patients'].includes(activeModule) && renderModulePlaceholder(activeModule)}

      {/* Patient Approval Modal + Offline Payment Gateway Section 10.6 */}
      {showPatientApprovalModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden">
              <div className={`p-8 border-b border-slate-50 flex items-center justify-between text-white ${showPatientApprovalModal.action === 'approve' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                 <div>
                    <h3 className="text-2xl font-black">{showPatientApprovalModal.action === 'approve' ? 'Authorize Access' : 'Reject Enrollment'}</h3>
                    <p className="opacity-80">Final verification of {showPatientApprovalModal.name}</p>
                 </div>
                 <button onClick={() => setShowPatientApprovalModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                    <X size={24}/>
                 </button>
              </div>
              
              <div className="p-10 space-y-8">
                 {showPatientApprovalModal.action === 'approve' ? (
                   <div className="space-y-6">
                      <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                         <div className="flex items-center gap-3 text-blue-600">
                            <Banknote size={24}/>
                            <h4 className="font-black text-sm uppercase tracking-widest">Offline Payment Gateway</h4>
                         </div>
                         <p className="text-xs text-slate-500 font-medium">Post the exact payment amount received via Telebirr or Bank for auditing.</p>
                         <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                            <input 
                              type="number" 
                              step="0.01"
                              autoFocus
                              className="w-full pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-black text-2xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                            />
                         </div>
                      </div>
                      <div className="flex gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                         <Info size={18} className="text-amber-600 shrink-0"/>
                         <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider leading-relaxed">Confirm this patient paid correctly. Upon approval, their information will be unblurred and procurement will be unlocked.</p>
                      </div>
                   </div>
                 ) : (
                   <div className="text-center space-y-4 py-6">
                      <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                         <UserX size={32}/>
                      </div>
                      <p className="text-slate-500 font-medium italic">Are you sure you want to reject the enrollment request for this node?</p>
                   </div>
                 )}

                 <div className="flex gap-4">
                    <button onClick={() => setShowPatientApprovalModal(null)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                    <button onClick={handlePatientAction} className={`flex-[2] py-4 text-white font-black rounded-2xl shadow-xl transition-all ${showPatientApprovalModal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                       {showPatientApprovalModal.action === 'approve' ? 'Confirm Payment & Activate' : 'Reject Node'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Legacy Pharmacy/Doctor Modals */}
      {showPharmacyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden">
             <div className="p-8 border-b border-slate-50 bg-blue-600 text-white flex items-center justify-between">
                <div><h3 className="text-2xl font-black">{showPharmacyModal.type === 'add' ? 'Initialize New Pharmacy' : 'Modify Pharmacy Node'}</h3><p className="opacity-80">Configure platform access and identity.</p></div>
                <button onClick={() => setShowPharmacyModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
             </div>
             <form onSubmit={handleSavePharmacy} className="p-10 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Name</label><input type="text" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={pharmacyForm.name} onChange={e => setPharmacyForm({...pharmacyForm, name: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label><input type="email" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={pharmacyForm.email} onChange={e => setPharmacyForm({...pharmacyForm, email: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label><input type="text" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={pharmacyForm.phone} onChange={e => setPharmacyForm({...pharmacyForm, phone: e.target.value})} /></div>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label><input type="text" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={pharmacyForm.address} onChange={e => setPharmacyForm({...pharmacyForm, address: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subscription Plan</label><select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={pharmacyForm.plan} onChange={e => setPharmacyForm({...pharmacyForm, plan: e.target.value as PharmacyPlan})}>{Object.values(PharmacyPlan).map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                </div>
                <div className="flex gap-4 pt-4"><button type="button" onClick={() => setShowPharmacyModal(null)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button><button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700">{showPharmacyModal.type === 'add' ? 'Add Pharmacy' : 'Save Changes'}</button></div>
             </form>
          </div>
        </div>
      )}

      {showDoctorModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden">
             <div className="p-8 border-b border-slate-50 bg-indigo-600 text-white flex items-center justify-between">
                <div><h3 className="text-2xl font-black">{showDoctorModal.type === 'add' ? 'Authorize New Doctor' : 'Modify Doctor Identity'}</h3><p className="opacity-80">Enforce EFDA compliance and clinical signing.</p></div>
                <button onClick={() => setShowDoctorModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
             </div>
             <form onSubmit={handleSaveDoctor} className="p-10 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Doctor Full Name</label><input type="text" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={doctorForm.name} onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label><input type="email" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={doctorForm.email} onChange={e => setDoctorForm({...doctorForm, email: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label><input type="text" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={doctorForm.phone} onChange={e => setDoctorForm({...doctorForm, phone: e.target.value})} /></div>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Signature</label><div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-[2rem] bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer relative overflow-hidden group">{doctorForm.e_signature_url ? (<div className="text-center"><img src={doctorForm.e_signature_url} className="h-16 mx-auto mb-2 rounded" alt="Signature preview" /><button type="button" onClick={() => setDoctorForm({...doctorForm, e_signature_url: ''})} className="absolute top-2 right-2 p-1 bg-rose-100 text-rose-600 rounded-full"><X size={12}/></button></div>) : (<div className="space-y-1 text-center"><ImageIcon className="mx-auto h-12 w-12 text-slate-300" /><div className="flex text-sm text-slate-600 font-bold justify-center"><span>Upload E-Signature</span></div><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={() => setDoctorForm({...doctorForm, e_signature_url: 'https://placehold.co/200x100?text=Mock+Signature'})} /></div>)}</div></div>
                </div>
                <div className="flex gap-4 pt-4"><button type="button" onClick={() => setShowDoctorModal(null)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Discard</button><button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700">Finalize Doctor Node</button></div>
             </form>
          </div>
        </div>
      )}

      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 space-y-8">
              <div className="text-center"><div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><Key size={40}/></div><h3 className="text-2xl font-black">Set Credentials</h3><p className="text-slate-500 font-medium mt-2">Set access for <strong>{showKeyModal.name}</strong>.</p></div>
              <form onSubmit={handleSetKey} className="space-y-4">
                 <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label><input type="text" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={keyForm.username} onChange={e => setKeyForm({...keyForm, username: e.target.value})} /></div>
                 <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label><input type="password" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={keyForm.password} onChange={e => setKeyForm({...keyForm, password: e.target.value})} /></div>
                 <div className="flex gap-4 pt-4"><button type="button" onClick={() => setShowKeyModal(null)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button><button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700">Dispatch Access</button></div>
              </form>
           </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 space-y-8 text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto"><AlertTriangle size={40}/></div>
              <h3 className="text-2xl font-black">Decommission Node</h3>
              <p className="text-slate-500 font-medium">Are you sure you want to terminate platform access for <strong>{showDeleteModal.name}</strong>?</p>
              <div className="flex gap-4"><button onClick={() => setShowDeleteModal(null)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">No, Cancel</button><button onClick={handleDeleteEntry} className="flex-1 py-4 bg-rose-600 text-white font-black rounded-2xl shadow-xl hover:bg-rose-700">Yes, Terminate</button></div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
