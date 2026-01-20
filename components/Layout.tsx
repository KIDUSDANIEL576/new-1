
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, PharmacyPlan, SystemAnnouncement, AuditLog, SystemSafety } from '../types';
import { mockApi } from '../services/mockApi';
import { 
  LayoutDashboard, Package, ShoppingCart, Stethoscope, Search, LogOut,
  Bell, Settings as SettingsIcon, ShieldCheck, Store, Share2, Users,
  RotateCcw, History, Building2, Database, BarChart3, Server, Zap,
  Snowflake, CreditCard, Target, Megaphone, X, Activity
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [safety, setSafety] = useState<SystemSafety | null>(null);
  const [isHolidayMode, setIsHolidayMode] = useState(() => localStorage.getItem('medintelli_holiday') === 'true');

  useEffect(() => {
    const fetchData = async () => {
      const [annData, auditData, safetyData] = await Promise.all([
        mockApi.getAnnouncements(),
        mockApi.getAuditLogs(),
        mockApi.getSystemSafety()
      ]);
      setAnnouncements(annData.filter(a => a.active));
      setActivities(auditData.slice(0, 10)); // Show latest 10 activities
      setSafety(safetyData);
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000);
    
    const checkHoliday = () => setIsHolidayMode(localStorage.getItem('medintelli_holiday') === 'true');
    window.addEventListener('storage', checkHoliday);
    
    return () => {
      window.removeEventListener('storage', checkHoliday);
      clearInterval(interval);
    };
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: Object.values(UserRole) },
    { icon: ShieldCheck, label: 'Command Center', path: '/super-admin', roles: [UserRole.SUPER_ADMIN] },
    { icon: Building2, label: 'Manage Nodes', path: '/super-admin/pharmacies', roles: [UserRole.SUPER_ADMIN] },
    { icon: Database, label: 'Global Stock', path: '/super-admin/inventory', roles: [UserRole.SUPER_ADMIN] },
    { icon: Target, label: 'Plan Control', path: '/super-admin/plans', roles: [UserRole.SUPER_ADMIN] },
    { icon: Store, label: 'Supplier Queue', path: '/super-admin/marketplace-approvals', roles: [UserRole.SUPER_ADMIN] },
    { icon: BarChart3, label: 'Market Metrics', path: '/super-admin/reports', roles: [UserRole.SUPER_ADMIN] },
    { icon: Server, label: 'System Health', path: '/super-admin/health', roles: [UserRole.SUPER_ADMIN] },
    { icon: Search, label: 'Medicine Search', path: '/search', roles: [UserRole.PATIENT, UserRole.SUPER_ADMIN] },
    { icon: Package, label: 'Inventory', path: '/inventory', roles: [UserRole.PHARMACY_ADMIN, UserRole.PHARMACIST] },
    { icon: RotateCcw, label: 'Correction', path: '/stock-adjustment', roles: [UserRole.PHARMACIST, UserRole.PHARMACY_ADMIN] },
    { icon: ShoppingCart, label: 'POS Terminal', path: '/sales', roles: [UserRole.PHARMACY_ADMIN, UserRole.PHARMACIST, UserRole.SALES_PERSON], planRequired: PharmacyPlan.STANDARD },
    { icon: History, label: 'My Sales', path: '/my-sales', roles: [UserRole.SALES_PERSON, UserRole.PHARMACIST], planRequired: PharmacyPlan.STANDARD },
    { icon: Stethoscope, label: 'Prescriptions', path: '/prescriptions', roles: [UserRole.DOCTOR, UserRole.PHARMACIST, UserRole.PHARMACY_ADMIN] },
    { icon: Users, label: 'Staff Control', path: '/staff', roles: [UserRole.PHARMACY_ADMIN], planRequired: PharmacyPlan.STANDARD },
    { icon: Store, label: 'Marketplace', path: '/marketplace', roles: [UserRole.PHARMACY_ADMIN, UserRole.SUPER_ADMIN], planRequired: PharmacyPlan.PLATINUM },
    { icon: Share2, label: 'Referrals', path: '/referrals', roles: [UserRole.PHARMACY_ADMIN, UserRole.SUPER_ADMIN] },
    { icon: CreditCard, label: 'Subscription', path: '/subscription', roles: [UserRole.PHARMACY_ADMIN] },
    { icon: SettingsIcon, label: 'Settings', path: '/settings', roles: Object.values(UserRole) },
  ];

  const filteredMenu = menuItems.filter(item => {
    if (!user) return false;
    if (!item.roles.includes(user.role)) return false;
    if (user.role === UserRole.PHARMACY_ADMIN || user.role === UserRole.PHARMACIST || user.role === UserRole.SALES_PERSON) {
      if (item.planRequired === PharmacyPlan.STANDARD && user.plan === PharmacyPlan.BASIC) return false;
      if (item.planRequired === PharmacyPlan.PLATINUM && user.plan !== PharmacyPlan.PLATINUM) return false;
    }
    return true;
  });

  const appStyle = safety?.bg_url 
    ? { backgroundImage: `url(${safety.bg_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <div className={`flex h-screen overflow-hidden ${isHolidayMode ? 'holiday-theme' : 'bg-slate-50'}`} style={appStyle}>
      {isHolidayMode && <div className="snow-overlay"></div>}
      
      <aside className="w-64 bg-white/95 backdrop-blur-md border-r border-slate-200 flex flex-col shrink-0 relative z-20">
        <div className="p-6">
          <h1 className={`text-2xl font-bold flex items-center gap-2 ${isHolidayMode ? 'text-rose-600' : 'text-blue-600'}`}>
            <span className={`p-1 rounded text-white shadow-lg ${isHolidayMode ? 'bg-emerald-600' : 'bg-blue-600'}`}>
              {safety?.logo_url ? <img src={safety.logo_url} className="w-5 h-5 object-contain" alt="Logo" /> : <Package size={20} />}
            </span>
            MedIntelli
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredMenu.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                ? `${isHolidayMode ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'} font-black shadow-sm` 
                : 'text-slate-400 hover:text-slate-600 font-semibold hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} className={location.pathname === item.path ? (isHolidayMode ? 'text-rose-600' : 'text-blue-600') : ''} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest"
          >
            <LogOut size={18} />
            Logout Hub
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative bg-white/40 backdrop-blur-[2px]">
        {announcements.length > 0 && (
          <div className="bg-slate-900 text-white px-8 py-2 flex items-center justify-between gap-4 overflow-hidden shrink-0">
             <div className="flex items-center gap-3">
               <Megaphone size={14} className="text-blue-400 animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-widest truncate max-w-2xl">{announcements[0].title}: {announcements[0].message}</p>
             </div>
             <button onClick={() => setAnnouncements(a => a.slice(1))} className="p-1 hover:bg-white/10 rounded"><X size={12}/></button>
          </div>
        )}
        
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-30 shrink-0">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
            {menuItems.find(i => i.path === location.pathname)?.label || 'System Entry'}
          </h2>
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative"
            >
              <Bell size={20} />
              {activities.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Live Activity Stream</h4>
                  <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                    {activities.map(act => (
                      <div key={act.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-all">
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                           <Activity size={16}/>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">{act.action}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{act.details}</p>
                          <p className="text-[9px] text-slate-300 mt-1 font-black uppercase">{act.user} • {new Date(act.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && (
                      <div className="p-8 text-center text-slate-300 font-bold italic">No recent activity detected.</div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black shadow-sm">
              {user?.name?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
