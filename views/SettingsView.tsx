
import React, { useState } from 'react';
import { UserRole } from '../types';

const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'STAFF' | 'POLICIES'>('GENERAL');
  const [hostel, setHostel] = useState({
    name: 'Hayatabad Smart Hostel',
    branch: 'Phase 3, Sector D',
    city: 'Peshawar',
    address: 'Near Tatara Park, Peshawar',
    contact: '091-5821102'
  });

  const [staff, setStaff] = useState([
    { id: 's1', name: 'Warden Ali', role: UserRole.WARDEN, contact: '0345-XXXXXXX' },
    { id: 's2', name: 'Accountant Kamran', role: UserRole.ACCOUNTANT, contact: '0300-XXXXXXX' },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Branch Configuration</h2>
          <p className="text-sm text-slate-500 font-medium">Control institutional identities and administrative staff.</p>
        </div>
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
           <button onClick={() => setActiveTab('GENERAL')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase ${activeTab === 'GENERAL' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Hostel Info</button>
           <button onClick={() => setActiveTab('STAFF')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase ${activeTab === 'STAFF' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Staff Team</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-slate-100 p-10">
           {activeTab === 'GENERAL' ? (
             <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hostel Branding Name</label>
                      <input className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-sm font-bold" value={hostel.name} onChange={e => setHostel({...hostel, name: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Location</label>
                      <input className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-sm font-bold" value={hostel.branch} onChange={e => setHostel({...hostel, branch: e.target.value})} />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Verification Address</label>
                   <textarea className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl text-sm font-bold min-h-[100px]" value={hostel.address} onChange={e => setHostel({...hostel, address: e.target.value})}></textarea>
                </div>
                <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200">Commit Global Changes</button>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-black text-lg text-slate-900">Administrative Staff</h3>
                   <button className="text-emerald-600 font-black text-[10px] uppercase border-b-2 border-emerald-500">Hire New Member</button>
                </div>
                {staff.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center text-lg font-black">{s.name.charAt(0)}</div>
                        <div>
                           <p className="font-black text-slate-900 leading-none">{s.name}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.role} • {s.contact}</p>
                        </div>
                     </div>
                     <button className="text-slate-300 hover:text-red-500 transition-all"><i className="fa-solid fa-user-minus"></i></button>
                  </div>
                ))}
             </div>
           )}
        </div>

        <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl">
           <h3 className="font-black text-sm mb-6">Subscription v3.1 PRO</h3>
           <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-xs text-slate-400 font-bold">Billing Cycle</span>
                 <span className="text-xs font-black text-emerald-400">Monthly</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-xs text-slate-400 font-bold">Next Payment</span>
                 <span className="text-xs font-black text-white">01 June 2024</span>
              </div>
              <button className="w-full bg-emerald-600 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-900/50">Manage Payment Method</button>
           </div>
           <p className="text-[9px] text-slate-500 mt-6 text-center leading-relaxed font-bold uppercase tracking-widest italic">Encrypted by Hayatabad Tech Hub</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
