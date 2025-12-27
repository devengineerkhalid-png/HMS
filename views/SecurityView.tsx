
import React, { useState } from 'react';
import { MOCK_GATE_PASSES, MOCK_VISITORS, MOCK_RESIDENTS } from '../constants';

interface SecurityViewProps {
  residentMode?: boolean;
  residentId?: string;
}

const SecurityView: React.FC<SecurityViewProps> = ({ residentMode, residentId }) => {
  const [activeTab, setActiveTab] = useState<'LOGS' | 'GATE_KEEPER'>('LOGS');
  const [passes, setPasses] = useState(MOCK_GATE_PASSES);
  
  const handleStatusUpdate = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setPasses(passes.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Frontier Security</h2>
          <p className="text-sm text-slate-500 font-medium">Monitoring entrance protocols and district compliance.</p>
        </div>
        {!residentMode && (
          <div className="flex bg-slate-900 text-white p-1 rounded-2xl shadow-xl">
             <button onClick={() => setActiveTab('LOGS')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'LOGS' ? 'bg-emerald-600' : 'text-slate-400'}`}>Security Logs</button>
             <button onClick={() => setActiveTab('GATE_KEEPER')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'GATE_KEEPER' ? 'bg-emerald-600' : 'text-slate-400'}`}>Live Gatekeeper</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Clearances</h3>
              <div className="flex gap-2">
                 <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                 <span className="text-[10px] font-black text-slate-900 uppercase">Live Stream</span>
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50/20 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                 <tr>
                   <th className="px-8 py-5">Resident</th>
                   <th className="px-8 py-5">Log Type</th>
                   <th className="px-8 py-5">Dest/Purpose</th>
                   <th className="px-8 py-5">Status</th>
                   <th className="px-8 py-5 text-right">Approval</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {passes.map(pass => (
                   <tr key={pass.id} className="hover:bg-slate-50 transition-all">
                     <td className="px-8 py-5">
                        <p className="font-black text-slate-900">{MOCK_RESIDENTS.find(r => r.id === pass.residentId)?.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Room {MOCK_RESIDENTS.find(r => r.id === pass.residentId)?.roomNumber}</p>
                     </td>
                     <td className="px-8 py-5 font-bold text-indigo-500 text-xs">{pass.requestType.replace('_', ' ')}</td>
                     <td className="px-8 py-5 text-xs text-slate-600 font-medium">{pass.destination}</td>
                     <td className="px-8 py-5">
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${pass.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : pass.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                           {pass.status}
                        </span>
                     </td>
                     <td className="px-8 py-5 text-right">
                        {pass.status === 'PENDING' && (
                          <div className="flex justify-end gap-2">
                             <button onClick={() => handleStatusUpdate(pass.id, 'REJECTED')} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fa-solid fa-xmark"></i></button>
                             <button onClick={() => handleStatusUpdate(pass.id, 'APPROVED')} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"><i className="fa-solid fa-check"></i></button>
                          </div>
                        )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl">
              <h3 className="text-sm font-black mb-6">Visitor Compliance</h3>
              <div className="space-y-4">
                 <input placeholder="Visitor Name" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-black outline-none focus:border-emerald-500" />
                 <input placeholder="Visitor CNIC" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-black outline-none focus:border-emerald-500" />
                 <select className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-black outline-none appearance-none">
                    <option>Select Host Resident</option>
                    {MOCK_RESIDENTS.map(r => <option key={r.id}>{r.name}</option>)}
                 </select>
                 <button className="w-full bg-emerald-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/50">Log Entrance</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityView;
