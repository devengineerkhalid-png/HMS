
import React, { useState, useRef } from 'react';
import { UserRole } from '../types';
import { dataStore } from '../services/dataStore';

const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'STAFF' | 'MAINTENANCE'>('GENERAL');
  const [hostel, setHostel] = useState({
    name: 'Hayatabad Smart Hostel',
    branch: 'Phase 3, Sector D',
    city: 'Peshawar',
    address: 'Near Tatara Park, Peshawar',
    contact: '091-5821102'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [staff, setStaff] = useState(dataStore.getUsers().filter((u: any) => u.role !== UserRole.RESIDENT));

  const handleExport = () => {
    const data = dataStore.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hms_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (window.confirm("This will overwrite ALL current data. Proceed?")) {
          dataStore.importAllData(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleWipe = () => {
    if (window.confirm("DANGER: This will delete ALL residents, rooms, and logs. Only the admin account will remain. Continue?")) {
      dataStore.wipeAllData();
    }
  };

  const handleReset = () => {
    if (window.confirm("This will reset the system to default mock data. Continue?")) {
      dataStore.resetToDefaults();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h2>
          <p className="text-sm text-slate-500 font-medium">Global control over infrastructure, data, and personnel.</p>
        </div>
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
           <button onClick={() => setActiveTab('GENERAL')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'GENERAL' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Branch Info</button>
           <button onClick={() => setActiveTab('STAFF')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'STAFF' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Staff</button>
           <button onClick={() => setActiveTab('MAINTENANCE')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MAINTENANCE' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400'}`}>Maintenance</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-slate-100 p-10">
           {activeTab === 'GENERAL' && (
             <div className="space-y-8 animate-in slide-in-from-left-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hostel Branding Name</label>
                      <input className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-sm font-bold outline-none focus:border-slate-900" value={hostel.name} onChange={e => setHostel({...hostel, name: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Location</label>
                      <input className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-sm font-bold outline-none focus:border-slate-900" value={hostel.branch} onChange={e => setHostel({...hostel, branch: e.target.value})} />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Verification Address</label>
                   <textarea className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-sm font-bold min-h-[100px] outline-none focus:border-slate-900" value={hostel.address} onChange={e => setHostel({...hostel, address: e.target.value})}></textarea>
                </div>
                <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all">Commit Global Changes</button>
             </div>
           )}

           {activeTab === 'STAFF' && (
             <div className="space-y-6 animate-in slide-in-from-left-4">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-black text-lg text-slate-900">Administrative Access</h3>
                   <button className="text-emerald-600 font-black text-[10px] uppercase border-b-2 border-emerald-500 tracking-widest pb-1">Hire New Member</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {staff.map(s => (
                    <div key={s.id || s.identifier} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-emerald-200 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center text-lg font-black shadow-lg shadow-slate-200">{s.name.charAt(0)}</div>
                          <div>
                             <p className="font-black text-slate-900 leading-none">{s.name}</p>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Role: {s.role} • ID: {s.identifier}</p>
                          </div>
                       </div>
                       <button className="text-slate-300 hover:text-red-500 transition-all p-2"><i className="fa-solid fa-user-minus"></i></button>
                    </div>
                  ))}
                </div>
             </div>
           )}

           {activeTab === 'MAINTENANCE' && (
             <div className="space-y-10 animate-in slide-in-from-left-4">
                <section>
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><i className="fa-solid fa-database"></i></div>
                      <h3 className="text-lg font-black text-slate-900">Data Management</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={handleExport} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 text-left group hover:bg-slate-900 transition-all">
                         <i className="fa-solid fa-download text-blue-500 mb-4 text-2xl group-hover:text-white transition-colors"></i>
                         <h4 className="font-black text-slate-900 group-hover:text-white transition-colors">Export Backup</h4>
                         <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors mt-1 font-medium">Download entire system state as JSON.</p>
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 text-left group hover:bg-slate-900 transition-all">
                         <i className="fa-solid fa-upload text-emerald-500 mb-4 text-2xl group-hover:text-white transition-colors"></i>
                         <h4 className="font-black text-slate-900 group-hover:text-white transition-colors">Import Restore</h4>
                         <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors mt-1 font-medium">Overwrite system with a previous backup.</p>
                         <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
                      </button>
                   </div>
                </section>

                <section>
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><i className="fa-solid fa-triangle-exclamation"></i></div>
                      <h3 className="text-lg font-black text-slate-900">Destructive Actions</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={handleReset} className="p-8 bg-red-50 rounded-[32px] border border-red-100 text-left group hover:bg-red-600 transition-all">
                         <h4 className="font-black text-red-900 group-hover:text-white transition-colors">Reset to Demo</h4>
                         <p className="text-xs text-red-700/60 group-hover:text-white/80 transition-colors mt-1 font-medium">Reload all default residents and rooms.</p>
                      </button>
                      <button onClick={handleWipe} className="p-8 bg-red-900 rounded-[32px] border border-red-950 text-left group hover:bg-black transition-all">
                         <h4 className="font-black text-white">Wipe Database</h4>
                         <p className="text-xs text-red-100/40 mt-1 font-medium">Clear everything and start with empty branch.</p>
                      </button>
                   </div>
                </section>
             </div>
           )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700"><i className="fa-solid fa-server text-9xl"></i></div>
             <h3 className="font-black text-sm mb-6 uppercase tracking-widest flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                System Integrity
             </h3>
             <div className="space-y-4 relative z-10">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Database Size</p>
                   <p className="text-xl font-black">~{Math.round(JSON.stringify(localStorage).length / 1024)} KB</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Local Latency</p>
                   <p className="text-xl font-black">1.2ms</p>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
             <h3 className="font-black text-sm text-slate-900 mb-6 uppercase tracking-widest">Policy Engine</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-slate-500">Allow Resident Signups</span>
                   <div className="w-10 h-5 bg-emerald-500 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div></div>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-slate-500">Auto-Generate Invoices</span>
                   <div className="w-10 h-5 bg-emerald-500 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div></div>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-slate-500">Public Verification Link</span>
                   <div className="w-10 h-5 bg-slate-200 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1"></div></div>
                </div>
             </div>
          </div>
          <p className="text-[9px] text-slate-400 font-black text-center uppercase tracking-[0.4em] mt-8">Frontier HMS Core v3.1 PRO</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
