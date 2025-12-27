
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  role: string;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, role, onLogout }) => {
  const adminItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'residents', label: 'Residents', icon: 'fa-users' },
    { id: 'billing', label: 'Financial Ledger', icon: 'fa-wallet' },
    { id: 'security', label: 'Security & Gate', icon: 'fa-shield-halved' },
    { id: 'mess', label: 'Mess Management', icon: 'fa-utensils' },
    { id: 'complaints', label: 'Maintenance', icon: 'fa-circle-exclamation' },
    { id: 'reports', label: 'Reports (AI)', icon: 'fa-wand-magic-sparkles' },
    { id: 'settings', label: 'Settings', icon: 'fa-sliders' },
  ];

  const residentItems = [
    { id: 'my_portal', label: 'Resident Hub', icon: 'fa-house-user' },
    { id: 'my_bills', label: 'Dues & Fees', icon: 'fa-receipt' },
    { id: 'my_complaints', label: 'Maintenance', icon: 'fa-wrench' },
    { id: 'my_gate_pass', label: 'Gate Passes', icon: 'fa-door-open' },
    { id: 'my_mess', label: 'Meal Plan', icon: 'fa-bowl-food' },
  ];

  const menuItems = role === UserRole.RESIDENT ? residentItems : adminItems;

  return (
    <div className="w-64 bg-slate-900 h-screen text-white flex flex-col fixed left-0 top-0 z-20 shadow-2xl border-r border-slate-800">
      <div className="p-8 border-b border-slate-800">
        <h1 className="text-xl font-black flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-900 text-lg shadow-lg shadow-emerald-500/20">
             <i className="fa-solid fa-hotel"></i>
          </div>
          <span className="tracking-tighter">PESH HMS</span>
        </h1>
        <p className="text-[9px] text-slate-500 mt-4 uppercase font-black tracking-[0.3em]">{role.replace('_', ' ')} PRIVILEGES</p>
      </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              currentView === item.id
                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40 translate-x-1' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <div className={`w-8 flex justify-center text-sm ${currentView === item.id ? 'text-white' : 'text-slate-500'}`}>
                <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <span className="font-bold text-sm tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Prominent Sign Out Area */}
      <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white px-5 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border border-red-500/30 group active:scale-95 shadow-lg shadow-red-900/10"
        >
          <i className="fa-solid fa-power-off text-sm group-hover:animate-pulse"></i>
          <span>Secure Sign Out</span>
        </button>
        <p className="text-[8px] text-slate-600 font-black text-center mt-4 uppercase tracking-[0.2em]">Peshawar HMS v3.1 PRO</p>
      </div>
    </div>
  );
};

export default Sidebar;
