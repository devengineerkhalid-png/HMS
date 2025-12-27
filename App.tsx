
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import ResidentsView from './views/ResidentsView';
import ReportsView from './views/ReportsView';
import BillingView from './views/BillingView';
import SecurityView from './views/SecurityView';
import MessView from './views/MessView';
import ComplaintsView from './views/ComplaintsView';
import ResidentPortal from './views/ResidentPortal';
import SettingsView from './views/SettingsView';
import GuestView from './views/GuestView';
import { UserRole } from './types';

// Mock specific views for residents that were previously "not working"
import { MOCK_BILLING, MOCK_COMPLAINTS, MOCK_MEAL_PLAN, MOCK_GATE_PASSES } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<{ role: UserRole; name: string; id?: string } | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('pesh_hms_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role === UserRole.RESIDENT) {
        setCurrentView('my_portal');
      }
    }
    setIsInitializing(false);
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    if (userData.role === UserRole.RESIDENT) {
      setCurrentView('my_portal');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pesh_hms_user');
    setUser(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-500 font-black tracking-widest text-xs uppercase">Initializing System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <GuestView onLogin={handleLoginSuccess} />;
  }

  const renderView = () => {
    // Handling Resident-Specific Views based on Sidebar 'currentView'
    if (user.role === UserRole.RESIDENT) {
      switch (currentView) {
        case 'my_portal': return <ResidentPortal residentId={user.id || '1'} />;
        case 'my_bills': return <BillingView residentMode />; // Re-using with a mode prop
        case 'my_complaints': return <ComplaintsView residentMode residentId={user.id || '1'} />;
        case 'my_gate_pass': return <SecurityView residentMode residentId={user.id || '1'} />;
        case 'my_mess': return <MessView residentMode />;
        default: return <ResidentPortal residentId={user.id || '1'} />;
      }
    }

    // Admin/Warden Views
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
      
      <main className="flex-1 ml-64 p-8 md:p-12 relative overflow-x-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl -z-10 -mr-32 -mt-32"></div>

        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-slate-200"></span>
              Management System
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-slate-900 tracking-tighter">
                {user.role === UserRole.RESIDENT ? `Assalaam-o-Alaikum, ${user.name.split(' ')[0]}` : 'Hayatabad Branch'}
              </span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-3 py-1 rounded-full font-black border border-emerald-200 uppercase tracking-widest">
                Active
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-2 rounded-[20px] shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 font-black shadow-lg shadow-slate-200">
                   {user.name.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                   <p className="text-xs font-black text-slate-900 leading-none">{user.name}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">{user.role.replace('_', ' ')}</p>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="ml-4 w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                  title="Sign Out"
                >
                   <i className="fa-solid fa-power-off text-xs"></i>
                </button>
             </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {renderView()}
        </div>
      </main>

      <div className="fixed bottom-10 left-10 z-30 flex gap-2">
        {['EN', 'اردو', 'پښتو'].map((lang) => (
          <button 
            key={lang} 
            className={`px-4 py-2 rounded-2xl border text-xs font-black transition-all shadow-sm ${lang === 'EN' ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50 hover:border-emerald-200'}`}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
