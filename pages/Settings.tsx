
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, SystemSafety } from '../types';
import { mockApi } from '../services/mockApi';
import { 
  User, Building, Shield, Bell, CreditCard, 
  ChevronRight, Camera, Globe, Lock, Snowflake,
  Image as ImageIcon, Save, RefreshCw, Key, Monitor,
  Eye, CheckCircle2, ShieldAlert,
  ShieldCheck, Stethoscope, Users, Activity
} from 'lucide-react';
import { toast } from '../components/common/Toast';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'branding' | 'notifications'>('profile');
  const [loading, setLoading] = useState(false);
  const [safety, setSafety] = useState<SystemSafety | null>(null);

  // Form States
  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [brandingData, setBrandingData] = useState({ logo_url: '', bg_url: '', primary_color: '#007E85' });
  const [notifSettings, setNotifSettings] = useState({
    pharmacyActivity: true,
    doctorActions: true,
    patientSignups: true,
    systemAlerts: true
  });

  const [holidayMode, setHolidayMode] = useState(() => localStorage.getItem('medintelli_holiday') === 'true');

  useEffect(() => {
    if (user?.role === UserRole.SUPER_ADMIN) {
      mockApi.getSystemSafety().then(res => {
        setSafety(res);
        setBrandingData({
          logo_url: res.logo_url || '',
          bg_url: res.bg_url || '',
          primary_color: res.primary_color
        });
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Identity profile synchronized.');
    setLoading(false);
  };

  const handleSaveBranding = async () => {
    setLoading(true);
    const updated = await mockApi.updateSafety(brandingData);
    setSafety(updated);
    toast.success('System branding deployed globally.');
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error('Protocol mismatch: New passwords do not match.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Security credentials rotated successfully.');
    setPasswordData({ current: '', new: '', confirm: '' });
    setLoading(false);
  };

  const toggleHoliday = () => {
    const newVal = !holidayMode;
    setHolidayMode(newVal);
    localStorage.setItem('medintelli_holiday', String(newVal));
    window.dispatchEvent(new Event('storage'));
    toast.success(`Holiday Mode ${newVal ? 'Active' : 'Deactivated'}`);
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'branding', icon: ImageIcon, label: 'System Hub Branding', roles: [UserRole.SUPER_ADMIN] },
    { id: 'notifications', icon: Bell, label: 'Preferences' },
  ].filter(t => !t.roles || t.roles.includes(user?.role!));

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Intelligence Config</h1>
          <p className="text-slate-500 font-medium italic">Adjust hub protocols and personal authorization details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <aside className="lg:col-span-1 space-y-2">
          <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm space-y-1">
            {tabs.map(t => (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id as any)}
                className={`w-full flex items-center gap-4 px-5 py-4 text-sm font-black rounded-2xl transition-all uppercase tracking-widest ${
                  activeTab === t.id 
                  ? 'bg-slate-900 text-white shadow-xl' 
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <t.icon size={20} />
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl space-y-4">
             <div className="flex items-center gap-3">
               <ShieldCheck size={24} />
               <p className="text-[10px] font-black uppercase tracking-widest">Access Level</p>
             </div>
             <h4 className="text-xl font-black">{user?.role}</h4>
             <p className="text-xs text-blue-100 font-medium italic opacity-80">Encryption: AES-256 Activated</p>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-8">
           {activeTab === 'profile' && (
             <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                   <div className="flex items-center gap-8 border-b border-slate-50 pb-8">
                     <div className="relative group">
                        <div className="w-24 h-24 rounded-[2rem] bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-300 text-3xl font-black group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                          {user?.name?.[0].toUpperCase()}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 shadow-lg transition-all">
                           <Camera size={18} />
                        </button>
                     </div>
                     <div>
                       <h3 className="text-2xl font-black text-slate-900">{profileData.name}</h3>
                       <p className="text-slate-500 font-medium">{profileData.email}</p>
                       <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Authorized since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Label (Name)</label>
                        <input 
                          type="text" 
                          value={profileData.name} 
                          onChange={e => setProfileData({...profileData, name: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correspondence Mail</label>
                        <input 
                          type="email" 
                          value={profileData.email} 
                          onChange={e => setProfileData({...profileData, email: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                        />
                      </div>
                   </div>
                </div>
                <div className="flex justify-end">
                   <button 
                     onClick={handleSaveProfile}
                     disabled={loading}
                     className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 shadow-2xl transition-all flex items-center gap-3"
                   >
                     {loading ? <RefreshCw className="animate-spin" size={20}/> : <Save size={20}/>}
                     Sync Identity
                   </button>
                </div>
             </div>
           )}

           {activeTab === 'security' && (
             <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <form onSubmit={handleUpdatePassword} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                   <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Key size={24}/></div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Credential Rotation</h3>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                        <input 
                          type="password" 
                          required
                          value={passwordData.current}
                          onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Hub Access Code</label>
                          <input 
                            type="password" 
                            required
                            value={passwordData.new}
                            onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Code</label>
                          <input 
                            type="password" 
                            required
                            value={passwordData.confirm}
                            onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                          />
                        </div>
                      </div>
                   </div>
                   <div className="flex justify-end pt-4">
                      <button 
                        type="submit"
                        disabled={loading}
                        className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 shadow-2xl transition-all flex items-center gap-3"
                      >
                        {loading ? <RefreshCw className="animate-spin" size={20}/> : <Lock size={20}/>}
                        Rotate Credentials
                      </button>
                   </div>
                </form>

                <div className="bg-rose-50 p-8 rounded-[3rem] border border-rose-100 flex items-center gap-6">
                   <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-lg"><ShieldAlert size={32}/></div>
                   <div className="flex-1">
                      <h4 className="text-lg font-black text-rose-900">Advanced Lockdown</h4>
                      <p className="text-rose-700 font-medium italic">Instantly invalidate all active sessions across all nodes and devices.</p>
                   </div>
                   <button className="px-6 py-3 bg-white text-rose-600 font-black rounded-xl border border-rose-200 hover:bg-rose-600 hover:text-white transition-all">Force Logout All</button>
                </div>
             </div>
           )}

           {activeTab === 'branding' && user?.role === UserRole.SUPER_ADMIN && (
             <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                   <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Monitor size={24}/></div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">System Visual Directives</h3>
                   </div>
                   
                   <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Logo URL (Global Deployment)</label>
                        <div className="flex gap-4">
                           <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                              {brandingData.logo_url ? <img src={brandingData.logo_url} className="w-full h-full object-contain" /> : <ImageIcon size={24} className="text-slate-300"/>}
                           </div>
                           <input 
                             type="text" 
                             placeholder="https://cloud.medintelli.com/logo.png"
                             value={brandingData.logo_url}
                             onChange={e => setBrandingData({...brandingData, logo_url: e.target.value})}
                             className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                           />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ambient Background Asset (Global)</label>
                        <div className="flex gap-4">
                           <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                              {brandingData.bg_url ? <img src={brandingData.bg_url} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-slate-300"/>}
                           </div>
                           <input 
                             type="text" 
                             placeholder="https://assets.medintelli.com/dashboard-bg.jpg"
                             value={brandingData.bg_url}
                             onChange={e => setBrandingData({...brandingData, bg_url: e.target.value})}
                             className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                           />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Color Identity</label>
                        <div className="flex gap-4 items-center">
                           <input 
                             type="color" 
                             value={brandingData.primary_color}
                             onChange={e => setBrandingData({...brandingData, primary_color: e.target.value})}
                             className="w-16 h-16 p-1 bg-white border border-slate-200 rounded-2xl cursor-pointer" 
                           />
                           <input 
                             type="text" 
                             value={brandingData.primary_color}
                             onChange={e => setBrandingData({...brandingData, primary_color: e.target.value})}
                             className="w-32 px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs font-black uppercase" 
                           />
                        </div>
                      </div>
                   </div>
                   
                   <div className="flex justify-end pt-4">
                      <button 
                        onClick={handleSaveBranding}
                        disabled={loading}
                        className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-2xl transition-all flex items-center gap-3"
                      >
                        {loading ? <RefreshCw className="animate-spin" size={20}/> : <Save size={20}/>}
                        Deploy Branding
                      </button>
                   </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white/10 text-rose-400 rounded-2xl"><Snowflake size={24}/></div>
                         <div>
                            <p className="text-xl font-black tracking-tight">Holiday Protocol</p>
                            <p className="text-xs text-slate-400 font-medium">Activate decorative seasonal overlays globally.</p>
                         </div>
                      </div>
                      <button 
                        onClick={toggleHoliday}
                        className={`w-14 h-8 rounded-full p-1 transition-all ${holidayMode ? 'bg-rose-600' : 'bg-white/20'}`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full transition-all ${holidayMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'notifications' && (
             <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                   <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Bell size={24}/></div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Event Awareness Preferences</h3>
                   </div>

                   <div className="space-y-6">
                      {[
                        { key: 'pharmacyActivity', label: 'Pharmacy Node Activity', desc: 'Notify me first for stock adjustments and local sales.', icon: Building },
                        { key: 'doctorActions', label: 'Doctor Clinical Directives', desc: 'Alert when prescriptions are issued or verified.', icon: Stethoscope },
                        { key: 'patientSignups', label: 'Patient Access Requests', desc: 'Notify on new enrollment and access payments.', icon: Users },
                        { key: 'systemAlerts', label: 'Infrastructure Integrity Alerts', desc: 'Critical alerts regarding hub performance and security.', icon: Activity },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                                 <item.icon size={20}/>
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 text-sm tracking-tight">{item.label}</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.desc}</p>
                              </div>
                           </div>
                           <button 
                             onClick={() => setNotifSettings({...notifSettings, [item.key]: !(notifSettings as any)[item.key]})}
                             className={`w-12 h-6 rounded-full p-1 transition-all ${(notifSettings as any)[item.key] ? 'bg-blue-600' : 'bg-slate-200'}`}
                           >
                              <div className={`w-4 h-4 bg-white rounded-full transition-all ${(notifSettings as any)[item.key] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
                
                <div className="flex justify-end">
                   <button 
                     onClick={() => toast.success('Event notification directives updated.')}
                     className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 shadow-2xl transition-all flex items-center gap-3"
                   >
                     <Save size={20}/>
                     Update Preferences
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
