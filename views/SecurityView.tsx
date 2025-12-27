
import React, { useState, useEffect } from 'react';
import { MOCK_VISITORS, MOCK_RESIDENTS } from '../constants.tsx';
import { GatePass, Resident } from '../types.ts';
import { dataStore } from '../services/dataStore.ts';

interface SecurityViewProps {
  residentMode?: boolean;
  residentId?: string;
}

const SecurityView: React.FC<SecurityViewProps> = ({ residentMode, residentId }) => {
  const [activeTab, setActiveTab] = useState<'LOGS' | 'GATE_KEEPER'>('LOGS');
  const [passes, setPasses] = useState<GatePass[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newPass, setNewPass] = useState<Partial<GatePass>>({
    requestType: 'DAY_OUT',
    destination: '',
    departureDate: new Date().toISOString().split('T')[0],
    returnDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    setPasses(dataStore.getGatePasses());
    setResidents(dataStore.getResidents());
  }, []);

  const handleStatusUpdate = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    const updatedPasses = passes.map(p => p.id === id ? { ...p, status: newStatus } : p);
    setPasses(updatedPasses);
    dataStore.setGatePasses(updatedPasses);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentId) return;

    const pass: GatePass = {
      id: `gp_${Date.now()}`,
      residentId,
      requestType: newPass.requestType as any,
      destination: newPass.destination || 'N/A',
      departureDate: newPass.departureDate || '',
      returnDate: newPass.returnDate || '',
      status: 'PENDING'
    };

    const updatedPasses = [pass, ...passes];
    setPasses(updatedPasses);
    dataStore.setGatePasses(updatedPasses);
    setShowRequestModal(false);
    setNewPass({
      requestType: 'DAY_OUT',
      destination: '',
      departureDate: new Date().toISOString().split('T')[0],
      returnDate: new Date().toISOString().split('T')[0]
    });
  };

  const filteredPasses = residentMode 
    ? passes.filter(p => p.residentId === residentId)
    : passes;

  const getResidentInfo = (id: string) => {
    return residents.find(r => r.id === id);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {residentMode ? 'Exit & Gate Passes' : 'Frontier Security Control'}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {residentMode 
              ? 'Manage your leave requests and digital gate clearance.' 
              : 'Monitoring entrance protocols and district compliance.'}
          </p>
        </div>
        
        <div className="flex gap-3">
          {residentMode && (
            <button 
              onClick={() => setShowRequestModal(true)}
              className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i> Request New Pass
            </button>
          )}
          {!residentMode && (
            <div className="flex bg-slate-900 text-white p-1 rounded-2xl shadow-xl">
               <button onClick={() => setActiveTab('LOGS')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'LOGS' ? 'bg-emerald-600 shadow-lg' : 'text-slate-400'}`}>Pass Logs</button>
               <button onClick={() => setActiveTab('GATE_KEEPER')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'GATE_KEEPER' ? 'bg-emerald-600 shadow-lg' : 'text-slate-400'}`}>Visitors</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className={`${residentMode ? 'lg:col-span-4' : 'lg:col-span-3'} bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden`}>
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {residentMode ? 'My Request History' : 'Digital Gate Clearance'}
              </h3>
              {!residentMode && (
                <div className="flex gap-2">
                   <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                   <span className="text-[10px] font-black text-slate-900 uppercase">System Active</span>
                </div>
              )}
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50/20 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                 <tr>
                   {!residentMode && <th className="px-8 py-5">Resident</th>}
                   <th className="px-8 py-5">Log Type</th>
                   <th className="px-8 py-5">Destination</th>
                   <th className="px-8 py-5">Dates</th>
                   <th className="px-8 py-5">Status</th>
                   {!residentMode && <th className="px-8 py-5 text-right">Approval</th>}
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {filteredPasses.length > 0 ? filteredPasses.map(pass => {
                   const resInfo = getResidentInfo(pass.residentId);
                   return (
                     <tr key={pass.id} className="hover:bg-slate-50 transition-all group">
                       {!residentMode && (
                         <td className="px-8 py-5">
                            <p className="font-black text-slate-900">{resInfo?.name || 'Unknown'}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Room {resInfo?.roomNumber || 'N/A'}</p>
                         </td>
                       )}
                       <td className="px-8 py-5">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                            pass.requestType === 'NIGHT_STAY' ? 'bg-indigo-50 text-indigo-600' :
                            pass.requestType === 'DAY_OUT' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {pass.requestType.replace('_', ' ')}
                          </span>
                       </td>
                       <td className="px-8 py-5 text-xs text-slate-600 font-bold">{pass.destination}</td>
                       <td className="px-8 py-5">
                          <p className="text-[10px] font-black text-slate-900">{pass.departureDate}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">To: {pass.returnDate}</p>
                       </td>
                       <td className="px-8 py-5">
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${
                            pass.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                            pass.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            'bg-red-50 text-red-600 border-red-100'
                          }`}>
                             {pass.status}
                          </span>
                       </td>
                       {!residentMode && (
                         <td className="px-8 py-5 text-right">
                            {pass.status === 'PENDING' && (
                              <div className="flex justify-end gap-2">
                                 <button onClick={() => handleStatusUpdate(pass.id, 'REJECTED')} className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
                                 <button onClick={() => handleStatusUpdate(pass.id, 'APPROVED')} className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-100 flex items-center justify-center"><i className="fa-solid fa-check"></i></button>
                              </div>
                            )}
                         </td>
                       )}
                     </tr>
                   );
                 }) : (
                   <tr>
                     <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-black text-xs uppercase">No gate passes recorded.</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>

        {!residentMode && (
          <div className="space-y-6">
             <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><i className="fa-solid fa-id-card text-8xl"></i></div>
                <h3 className="text-sm font-black mb-6 flex items-center gap-3">
                  <i className="fa-solid fa-user-plus text-emerald-400"></i>
                  Quick Visitor Entry
                </h3>
                <div className="space-y-4 relative z-10">
                   <input placeholder="Visitor Name" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-black outline-none focus:border-emerald-500" />
                   <input placeholder="Visitor CNIC (17301-...)" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-black outline-none focus:border-emerald-500" />
                   <select className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-black outline-none appearance-none">
                      <option value="">Select Host Resident</option>
                      {residents.map(r => <option key={r.id} value={r.id}>{r.name} ({r.roomNumber})</option>)}
                   </select>
                   <button className="w-full bg-emerald-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/50 hover:bg-emerald-500 transition-all">Log Entrance</button>
                </div>
             </div>

             <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 mb-4 uppercase tracking-widest">Compliance Rule</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  As per Peshawar District Administration guidelines, all residents must submit night stay requests at least 4 hours before departure for police log verification.
                </p>
             </div>
          </div>
        )}
      </div>

      {/* Resident Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
           <form onSubmit={handleSubmitRequest} className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl p-10 animate-in zoom-in">
              <div className="flex justify-between items-start mb-8">
                <div>
                   <h3 className="text-2xl font-black text-slate-900">Request Exit Pass</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-widest">Official Authorization Form</p>
                </div>
                <button type="button" onClick={() => setShowRequestModal(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type of Exit</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['DAY_OUT', 'NIGHT_STAY', 'LEAVE'].map(type => (
                         <button 
                           key={type}
                           type="button"
                           onClick={() => setNewPass({...newPass, requestType: type as any})}
                           className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter border-2 transition-all ${newPass.requestType === type ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-500 border-slate-50 hover:border-slate-200'}`}
                         >
                           {type.replace('_', ' ')}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination Address</label>
                    <input 
                      required 
                      placeholder="e.g. Home, Mardan, University Lib" 
                      className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold transition-all" 
                      value={newPass.destination}
                      onChange={e => setNewPass({...newPass, destination: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departure</label>
                       <input 
                         required 
                         type="date" 
                         className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" 
                         value={newPass.departureDate}
                         onChange={e => setNewPass({...newPass, departureDate: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Return</label>
                       <input 
                         required 
                         type="date" 
                         className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" 
                         value={newPass.returnDate}
                         onChange={e => setNewPass({...newPass, returnDate: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                      <i className="fa-solid fa-circle-info mr-2"></i>
                      Note: False information in gate passes is a violation of hostel policy and may result in disciplinary action.
                    </p>
                 </div>

                 <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-300 hover:bg-slate-800 transition-all">
                    Submit Clearance Request
                 </button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default SecurityView;
