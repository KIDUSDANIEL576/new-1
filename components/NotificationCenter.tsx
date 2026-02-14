
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockApi } from '../services/mockApi';
import { Notification } from '../types';
import { Bell, Check, Clock, Zap, ShoppingBag, UserCheck, ShieldAlert, X } from 'lucide-react';

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifs = async () => {
    const data = await mockApi.getNotifications(user?.organizationId);
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markRead = async (id: string) => {
    await mockApi.markNotificationRead(id);
    fetchNotifs();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'NEW_REQUEST': return <ShoppingBag size={14} className="text-blue-500"/>;
      case 'NEW_BID': return <Zap size={14} className="text-amber-500"/>;
      case 'BID_ACCEPTED': return <UserCheck size={14} className="text-emerald-500"/>;
      case 'SYSTEM_ALERT': return <ShieldAlert size={14} className="text-rose-500"/>;
      default: return <Bell size={14} className="text-slate-400"/>;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Hub Intelligence Feed</h4>
            
            <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
              {notifications.length > 0 ? notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-3 rounded-2xl transition-all group relative ${n.isRead ? 'opacity-60' : 'bg-slate-50 border border-slate-100/50'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white shadow-sm shrink-0">
                       {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 leading-tight">{n.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 italic">{n.message}</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                         <Clock size={8} /> {new Date(n.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {!n.isRead && (
                      <button 
                        onClick={() => markRead(n.id)}
                        className="p-1 hover:bg-white rounded-lg text-slate-300 hover:text-emerald-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                         <Check size={14}/>
                      </button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-300 font-bold italic">Inbox synchronized and clear.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
