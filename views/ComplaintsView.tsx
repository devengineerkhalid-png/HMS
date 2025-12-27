
import React, { useState } from 'react';
import { MOCK_COMPLAINTS, MOCK_RESIDENTS } from '../constants';

interface ComplaintsViewProps {
  residentMode?: boolean;
  residentId?: string;
}

const ComplaintsView: React.FC<ComplaintsViewProps> = ({ residentMode, residentId }) => {
  const [showModal, setShowModal] = useState(false);
  const myComplaints = residentMode ? MOCK_COMPLAINTS.filter(c => c.residentId === residentId) : MOCK_COMPLAINTS;

  const getResidentName = (id: string) => MOCK_RESIDENTS.find(r => r.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{residentMode ? 'My Maintenance Tickets' : 'Maintenance & Complaints'}</h2>
          <p className="text-sm text-slate-500 font-medium">Report issues or check status of existing requests.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
        >
           <i className="fa-solid fa-plus"></i> {residentMode ? 'New Ticket' : 'Internal Log'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
           {myComplaints.length > 0 ? myComplaints.map(complaint => (
             <div key={complaint.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-start justify-between hover:border-emerald-200 transition-all hover:shadow-xl hover:shadow-emerald-500/5 group">
                <div className="flex gap-6">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${
                      complaint.category === 'ELECTRICAL' ? 'bg-amber-100 text-amber-600' :
                      complaint.category === 'PLUMBING' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                   }`}>
                      <i className={`fa-solid ${
                        complaint.category === 'ELECTRICAL' ? 'fa-bolt' :
                        complaint.category === 'PLUMBING' ? 'fa-faucet' : 'fa-wrench'
                      }`}></i>
                   </div>
                   <div>
                      <h4 className="font-black text-slate-900 text-lg leading-tight">{complaint.title}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {!residentMode && `${getResidentName(complaint.residentId)} • `} Room 102A • {complaint.category}
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                         <span className="text-[10px] uppercase font-black text-slate-300 tracking-[0.2em]">{complaint.createdAt}</span>
                         <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                         <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full border ${
                           complaint.status === 'OPEN' ? 'bg-red-50 text-red-600 border-red-100' : 
                           complaint.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                           'bg-emerald-50 text-emerald-600 border-emerald-100'
                         }`}>{complaint.status.replace('_', ' ')}</span>
                      </div>
                   </div>
                </div>
                {!residentMode && (
                  <div className="flex flex-col gap-2">
                     <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Assign</button>
                  </div>
                )}
             </div>
           )) : (
             <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-3xl mb-4">
                  <i className="fa-solid fa-envelope-open"></i>
                </div>
                <p className="text-slate-400 font-bold">No active maintenance tickets found.</p>
             </div>
           )}
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 text-white/5 text-8xl">
                <i className="fa-solid fa-toolbox"></i>
              </div>
              <h3 className="font-black text-lg mb-6 flex items-center gap-3">
                <i className="fa-solid fa-circle-info text-emerald-400"></i>
                SLA Status
              </h3>
              <div className="space-y-5 relative z-10">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Response Time</span>
                      <span className="text-emerald-400">&lt; 2 Hours</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full">
                       <div className="bg-emerald-500 h-full w-[85%]"></div>
                    </div>
                 </div>
                 <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                   Our maintenance team (Gul & Irfan) are available from 9:00 AM to 6:00 PM for routine fixes. Emergency support available 24/7.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg p-10 rounded-[48px] shadow-2xl relative animate-in slide-in-from-top-4 duration-300">
              <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><i className="fa-solid fa-xmark text-xl"></i></button>
              <h3 className="text-2xl font-black text-slate-900 mb-2">New Support Ticket</h3>
              <p className="text-sm text-slate-500 mb-8">Describe the issue in detail for faster resolution.</p>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold">
                       <option>Electrical (Light/Fan)</option>
                       <option>Plumbing (Leakage/Tap)</option>
                       <option>WiFi & Internet</option>
                       <option>Cleaning Request</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Description</label>
                    <textarea placeholder="e.g. My room fan is making a clicking noise..." className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-medium min-h-[120px]"></textarea>
                 </div>
                 <button onClick={() => setShowModal(false)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all">
                    Lodge Request
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsView;
