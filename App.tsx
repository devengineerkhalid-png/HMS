
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import DashboardView from './views/DashboardView.tsx';
import ResidentsView from './views/ResidentsView.tsx';
import ReportsView from './views/ReportsView.tsx';
import BillingView from './views/BillingView.tsx';
import SecurityView from './views/SecurityView.tsx';
import MessView from './views/MessView.tsx';
import ComplaintsView from './views/ComplaintsView.tsx';
import ResidentPortal from './views/ResidentPortal.tsx';
import SettingsView from './views/SettingsView.tsx';
import GuestView from './views/GuestView.tsx';
import { UserRole } from './types.ts';
import { dataStore } from './services/dataStore.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<{ role: UserRole; name: string; id?: string } | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await dataStore.init();
        setIsOffline(dataStore.isOffline());
        
        const savedUser = localStorage.getItem('pesh_hms_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setCurrentView(parsedUser.role === UserRole.RESIDENT ? 'my_portal' : 'dashboard');
        }
      } catch (e) {
        console.error("App initialization failed:", e);
        setIsOffline(true);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setCurrentView(userData.role === UserRole.RESIDENT ? 'my_portal' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('pesh_hms_user');
    setUser(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-2xl shadow-emerald-500/20"></div>
          <p className="text-emerald-500 font-black tracking-widest text-[10px] uppercase mt-4">Peshawar Cloud Node Syncing...</p>
          <p className="text-slate-500 text-[8px] font-bold uppercase">Connecting to Supabase Cloud Engine</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <GuestView onLogin={handleLoginSuccess} />;
  }

  const renderView = () => {
    const rid = user.id || '1';

    if (user.role === UserRole.RESIDENT) {
      switch (currentView) {
        case 'my_portal': return <ResidentPortal residentId={rid} />;
        case 'my_bills': return <BillingView residentMode residentId={rid} />;
        case 'my_complaints': return <ComplaintsView residentMode residentId={rid} />;
        case 'my_gate_pass': return <SecurityView residentMode residentId={rid} />;
        case 'my_mess': return <MessView residentMode />;
        default: return <ResidentPortal residentId={rid} />;
      }
    }

    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'residents': return <ResidentsView />;
      case 'billing': return <BillingView />;
      case 'security': return <SecurityView />;
      case 'mess': return <MessView />;
      case 'complaints': return <ComplaintsView />;
      case 'reports': return <ReportsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        role={user.role} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 ml-64 p-8 md:p-12 relative overflow-x-hidden min-h-screen">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl -z-10 -mr-32 -mt-32"></div>

        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-slate-200"></span>
              {user.role === UserRole.RESIDENT ? 'Resident Portal' : 'Administrative Center'}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-slate-900 tracking-tighter">
                {user.role === UserRole.RESIDENT ? `Assalam-o-Alaikum, ${user.name.split(' ')[0]}` : user.name}
              </span>
              <div className="flex items-center gap-2">
                 <span className="bg-emerald-100 text-emerald-700 text-[10px] px-3 py-1 rounded-full font-black border border-emerald-200 uppercase tracking-widest">
                  Active Session
                 </span>
                 <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-tighter ${!isOffline ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${!isOffline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                    {isOffline ? 'LOCAL STORAGE' : 'SUPABASE CLOUD'}
                 </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-2 rounded-2xl shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 font-black shadow-lg shadow-slate-200 uppercase overflow-hidden">
                   {user.role === UserRole.RESIDENT ? <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="" /> : user.name.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                   <p className="text-xs font-black text-slate-900 leading-none">{user.name}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">{user.role.replace('_', ' ')}</p>
                </div>
             </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {renderView()}
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-30 flex gap-2">
        {['English', 'اردو', 'پښتو'].map((lang) => (
          <button 
            key={lang} 
            className={`px-4 py-2 rounded-xl border text-[10px] font-black transition-all shadow-sm ${lang === 'English' ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}`}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
