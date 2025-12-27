
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
    { id: 'billing', label: 'Finance & Billing', icon: 'fa-wallet' },
    { id: 'security', label: 'Security & Gate', icon: 'fa-shield-halved' },
    { id: 'mess', label: 'Mess Management', icon: 'fa-utensils' },
    { id: 'complaints', label: 'Complaints', icon: 'fa-circle-exclamation' },
    { id: 'reports', label: 'Reports (AI)', icon: 'fa-wand-magic-sparkles' },
    { id: 'settings', label: 'Settings', icon: 'fa-sliders' },
  ];

  const residentItems = [
    { id: 'my_portal', label: 'My Dashboard', icon: 'fa-house-user' },
    { id: 'my_bills', label: 'Dues & Fees', icon: 'fa-receipt' },
    { id: 'my_complaints', label: 'My Tickets', icon: 'fa-wrench' },
    { id: 'my_gate_pass', label: 'Gate Passes', icon: 'fa-door-open' },
    { id: 'my_mess', label: 'Meal Plan', icon: 'fa-bowl-food' },
  ];

  const menuItems = role === UserRole.RESIDENT ? residentItems : adminItems;

  return (
    <div className="w-64 bg-slate-900 h-screen text-white flex flex-col fixed left-0 top-0 z-20 shadow-2xl">
      <div className="p-8 border-b border-slate-800">
        <h1 className="text-xl font-black flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900 text-sm">
             <i className="fa-solid fa-hotel"></i>
          </div>
          <span>PESH HMS</span>
        </h1>
        <p className="text-[10px] text-slate-500 mt-3 uppercase font-black tracking-widest">{role.replace('_', ' ')} MODE</p>
      </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === item.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 translate-x-1' 
                : 'text-slate-500 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-sm`}></i>
            <span className="font-bold text-sm tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="bg-slate-800/80 p-4 rounded-2xl mb-4 border border-slate-700">
           <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Support Hotline</p>
           <p className="text-xs font-bold text-emerald-400">0345-1234567</p>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-red-500/20 shadow-lg shadow-red-500/5"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>Secure Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
