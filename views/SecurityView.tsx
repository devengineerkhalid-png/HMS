
import React, { useState } from 'react';
import { MOCK_GATE_PASSES, MOCK_VISITORS, MOCK_RESIDENTS } from '../constants';

interface SecurityViewProps {
  residentMode?: boolean;
  residentId?: string;
}

const SecurityView: React.FC<SecurityViewProps> = ({ residentMode, residentId }) => {
  const [activeTab, setActiveTab] = useState<'GATE_PASS' | 'VISITORS'>('GATE_PASS');
  const [showRequestModal, setShowRequestModal] = useState(false);

  const myPasses = residentMode ? MOCK_GATE_PASSES.filter(p => p.residentId === residentId) : MOCK_GATE_PASSES;
  const getResidentInfo = (id: string) => MOCK_RESIDENTS.find(r => r.id === id);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{residentMode ? 'Gate Passes' : 'Security & Gate Management'}</h2>
          <p className="text-sm text-slate-500 font-medium">{residentMode ? 'Request permissions for leaves and overnight stays.' : 'Monitor visitor logs and approve exit requests.'}</p>
        </div>
        <div className="flex items-center gap-3">
          {residentMode && (
             <button 
               onClick={() => setShowRequestModal(true)}
               className="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
             >
                <i className="fa-solid fa-paper-plane mr-2"></i> New Request
             </button>
          )}
          {!residentMode && (
            <div className="flex bg-white rounded-lg p-1 border border-slate-200">
              <button 
                onClick={() => setActiveTab('GATE_PASS')}
                className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-md transition-all ${activeTab === 'GATE_PASS' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500'}`}
              >
                Gate Passes
              </button>
              <button 
                onClick={() => setActiveTab('VISITORS')}
                className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-md transition-all ${activeTab === 'VISITORS' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500'}`}
              >
                Visitors
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Requests & Logs</h3>
            </div>
            {activeTab === 'GATE_PASS' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 text-slate-500 font-black uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-6 py-4">{residentMode ? 'Request ID' : 'Resident'}</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Destination</th>
                      <th className="px-6 py-4">Return Date</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myPasses.map((pass) => {
                      const res = getResidentInfo(pass.residentId);
                      return (
                        <tr key={pass.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 font-black text-slate-900">
                            {residentMode ? `#${pass.id.toUpperCase()}` : res?.name}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest">{pass.requestType.replace('_', ' ')}</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-600">{pass.destination}</td>
                          <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{pass.returnDate}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${pass.status === 'PENDING' ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}>
                              {pass.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 text-slate-500 font-black uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Visitor</th>
                      <th className="px-6 py-4">Host</th>
                      <th className="px-6 py-4">Check-In</th>
                      <th className="px-6 py-4">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_VISITORS.map((v) => {
                      const res = getResidentInfo(v.residentId);
                      return (
                        <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-black text-slate-900 leading-none">{v.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tight">{v.cnic}</p>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-700">{res?.name}</td>
                          <td className="px-6 py-4 text-xs font-black text-slate-400 uppercase">{v.checkInTime}</td>
                          <td className="px-6 py-4 italic text-slate-500 text-xs">"{v.purpose}"</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {myPasses.length === 0 && (
               <div className="p-20 text-center">
                  <i className="fa-solid fa-door-open text-4xl text-slate-100 mb-4"></i>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No gate pass records found</p>
               </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 text-white/5 text-[180px] group-hover:rotate-12 transition-transform duration-700">
              <i className="fa-solid fa-qrcode"></i>
            </div>
            <h3 className="font-black text-lg mb-6 flex items-center gap-3">
              <i className="fa-solid fa-fingerprint text-emerald-400"></i>
              Digital Identity
            </h3>
            <div className="bg-white p-6 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
               <div className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-200 text-4xl">
                  <i className="fa-solid fa-qrcode"></i>
               </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center mb-6 leading-relaxed font-bold uppercase tracking-widest">
              Show this QR at the gate for touchless check-in.
            </p>
            <button className="w-full bg-emerald-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
              Refresh Identity
            </button>
          </div>
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg p-10 rounded-[48px] shadow-2xl relative animate-in zoom-in duration-200">
              <button onClick={() => setShowRequestModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Gate Pass Request</h3>
              <p className="text-sm text-slate-500 mb-8">Request permission for outing or leave from the warden.</p>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type of Request</label>
                    <select className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold">
                       <option>Day Out (Return by 10PM)</option>
                       <option>Night Stay (Outstation)</option>
                       <option>Weekend Leave</option>
                       <option>Emergency Leave</option>
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departure</label>
                      <input type="date" className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none text-sm font-bold" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Return</label>
                      <input type="date" className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none text-sm font-bold" />
                   </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination Address</label>
                    <input type="text" placeholder="e.g. Home, Hayatabad Phase 1, Peshawar" className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-medium" />
                 </div>
                 <button onClick={() => setShowRequestModal(false)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all">
                    Submit to Warden
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SecurityView;
