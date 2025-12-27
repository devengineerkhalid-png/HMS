
import React, { useState } from 'react';

const SettingsView: React.FC = () => {
  const [hostel, setHostel] = useState({
    name: 'Smart Hostel Pro',
    branch: 'Hayatabad Phase 3',
    city: 'Peshawar',
    address: 'Near Tatara Park, Hayatabad',
    contact: '091-1234567',
    primaryColor: '#10b981'
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-slate-800">System Customization</h2>
      <p className="text-slate-500 -mt-4">Tailor the Peshawar HMS to your specific hostel brand.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-50 pb-2">General Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hostel Name</label>
                  <input type="text" className="w-full border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" value={hostel.name} onChange={e => setHostel({...hostel, name: e.target.value})} />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Branch Name</label>
                  <input type="text" className="w-full border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" value={hostel.branch} onChange={e => setHostel({...hostel, branch: e.target.value})} />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">City Location</label>
                  <input type="text" className="w-full border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" value={hostel.city} onChange={e => setHostel({...hostel, city: e.target.value})} />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Brand Color</label>
                  <div className="flex gap-2">
                    <input type="color" className="h-10 w-10 border-none bg-transparent cursor-pointer" value={hostel.primaryColor} onChange={e => setHostel({...hostel, primaryColor: e.target.value})} />
                    <input type="text" className="flex-1 border p-2.5 rounded-xl text-sm" value={hostel.primaryColor} readOnly />
                  </div>
               </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Physical Address</label>
              <textarea className="w-full border p-2.5 rounded-xl text-sm min-h-[80px]" value={hostel.address} onChange={e => setHostel({...hostel, address: e.target.value})}></textarea>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-50 pb-2">Multi-Hostel Control (SaaS)</h3>
            <p className="text-xs text-slate-500">Enable this if you manage multiple buildings across University Road or Namak Mandi.</p>
            <div className="space-y-2">
               {['Hostel A (Boys)', 'Hostel B (Girls)', 'Executive Branch'].map(branch => (
                 <div key={branch} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">{branch}</span>
                    <div className="flex gap-2">
                       <button className="text-slate-400 hover:text-blue-500"><i className="fa-solid fa-pen text-xs"></i></button>
                       <button className="text-slate-400 hover:text-red-500"><i className="fa-solid fa-trash text-xs"></i></button>
                    </div>
                 </div>
               ))}
               <button className="w-full border-2 border-dashed border-slate-200 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50 hover:text-emerald-500 hover:border-emerald-200 transition-all">
                  + Add New Branch Building
               </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
              <h3 className="font-bold mb-4">System Preview</h3>
              <div className="border border-slate-700 rounded-xl p-4 bg-slate-800/50">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full" style={{backgroundColor: hostel.primaryColor}}></div>
                    <span className="font-black text-sm">{hostel.name}</span>
                 </div>
                 <p className="text-[10px] text-slate-400">{hostel.branch}, {hostel.city}</p>
                 <div className="mt-4 h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full" style={{width: '60%', backgroundColor: hostel.primaryColor}}></div>
                 </div>
              </div>
              <p className="text-[10px] mt-4 text-slate-400 italic">This is how your login screens and receipts will look to residents.</p>
              <button className="w-full mt-6 bg-white text-slate-900 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-emerald-50 transition-colors">
                 Save Config
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
