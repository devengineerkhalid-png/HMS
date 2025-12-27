
import React, { useState, useEffect } from 'react';
import { Complaint, Resident, BillingRecord } from '../types.ts';
import { dataStore } from '../services/dataStore.ts';

const ResidentPortal: React.FC<{ residentId: string }> = ({ residentId }) => {
  const [resident, setResident] = useState<Resident | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [myBills, setMyBills] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const allResidents = await dataStore.getResidents();
      const currentRes = allResidents.find(r => r.id === residentId);
      setResident(currentRes || null);

      const allComplaints = await dataStore.getComplaints();
      setComplaints(allComplaints.filter(c => c.residentId === residentId));

      const allBills = await dataStore.getBilling();
      setMyBills(allBills.filter(b => b.residentId === residentId));
      setLoading(false);
    };
    loadData();
  }, [residentId]);

  if (loading || !resident) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Cloud Profile...</p>
    </div>
  );

  // FIXED: Sum total dues from the resident profile property, which is what the admin assigns.
  const totalDues = resident.dues;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      
      {/* High-End Profile Header */}
      <div className="bg-white rounded-[60px] shadow-sm border border-slate-100 overflow-hidden">
         <div className="h-48 bg-slate-900 relative">
            <div className="absolute inset-0 bg-emerald-500/5 blur-[100px]"></div>
            <div className="absolute top-6 right-10 text-[10px] font-black text-emerald-500/30 uppercase tracking-[0.5em]">Digital Quarter ID</div>
         </div>
         <div className="px-16 pb-16 -mt-20 flex flex-col md:flex-row gap-12 items-start md:items-end relative z-10">
            <div className="w-48 h-48 rounded-[56px] border-[12px] border-white shadow-2xl overflow-hidden bg-slate-50 flex items-center justify-center">
              {resident.profileImage ? (
                <img src={resident.profileImage} className="w-full h-full object-cover" />
              ) : (
                <i className="fa-solid fa-user-graduate text-6xl text-slate-200"></i>
              )}
            </div>
            <div className="flex-1">
               <div className="flex items-center gap-3 mb-2">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${resident.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                     {resident.status} Session
                  </span>
                  <span className="text-slate-300 font-bold text-sm tracking-tight italic">Member since {resident.admissionDate}</span>
               </div>
               <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{resident.name}</h2>
               <p className="text-lg text-slate-400 font-bold mt-4 tracking-tight">{resident.institutionOrOffice}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-[40px] border border-slate-100 text-center min-w-[180px]">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Room Assignment</p>
               <p className="text-3xl font-black text-slate-900">{resident.roomNumber || 'Waiting'}</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            {/* Detailed Info Card */}
            <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-sm">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center"><i className="fa-solid fa-id-card-clip"></i></div>
                  <h3 className="text-lg font-black text-slate-900">Biographical Records</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Number (CNIC)</p>
                     <p className="text-sm font-bold text-slate-800">{resident.cnic}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered Contact</p>
                     <p className="text-sm font-bold text-slate-800">{resident.phone}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permanent Residence</p>
                     <p className="text-sm font-bold text-slate-800 leading-relaxed">{resident.permanentAddress || 'Not Provided'}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Address</p>
                     <p className="text-sm font-bold text-slate-800 leading-relaxed">{resident.currentAddress || 'Same as Permanent'}</p>
                  </div>
               </div>

               <div className="mt-12 pt-10 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Contact (Name)</p>
                     <p className="text-sm font-bold text-slate-800">{resident.parentName} <span className="text-[9px] text-slate-400 uppercase ml-2">(Parent/Guardian)</span></p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Helpline</p>
                     <p className="text-sm font-bold text-emerald-600">{resident.parentPhone}</p>
                  </div>
               </div>
            </div>

            {/* Billing Timeline */}
            <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                  <h3 className="font-black text-[10px] text-slate-900 uppercase tracking-widest">Financial Ledger</h3>
                  <div className="flex gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span className="text-[9px] font-black text-slate-400 uppercase">Live Account</span>
                  </div>
               </div>
               <div className="divide-y divide-slate-50">
                  {myBills.map(b => (
                     <div key={b.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-6">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${b.status === 'PAID' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-red-50 border-red-100 text-red-500'}`}>
                              <i className="fa-solid fa-receipt text-sm"></i>
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-800">{b.type} Invoice</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-tighter">Due: {b.dueDate}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-lg font-black text-slate-900">Rs. {b.amount.toLocaleString()}</p>
                           <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${b.status === 'PAID' ? 'text-emerald-500' : 'text-red-500'}`}>{b.status}</p>
                        </div>
                     </div>
                  ))}
                  {myBills.length === 0 && resident.dues > 0 && (
                     <div className="p-12 text-center text-slate-400 italic text-sm">
                        No specific invoices generated yet. Total profile balance: Rs. {resident.dues.toLocaleString()}
                     </div>
                  )}
               </div>
            </div>
         </div>

         <div className="space-y-8">
            {/* Payment Summary */}
            <div className={`p-10 rounded-[48px] border shadow-2xl flex flex-col justify-between min-h-[300px] relative overflow-hidden transition-all ${totalDues > 0 ? 'bg-slate-900 border-slate-800 text-white shadow-slate-200' : 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-200'}`}>
               <div className="absolute top-0 right-0 p-6 opacity-5"><i className="fa-solid fa-wallet text-9xl"></i></div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Account Clearance Status</p>
                  <h4 className="text-5xl font-black tracking-tighter">Rs. {totalDues.toLocaleString()}</h4>
                  <p className="text-xs font-bold text-slate-400 mt-2">{totalDues > 0 ? 'Action Required: Settle outstanding dues.' : 'Cleared: No pending dues.'}</p>
               </div>
               <button disabled={totalDues <= 0} className={`w-full py-5 rounded-3xl font-black uppercase text-xs tracking-[0.2em] transition-all ${totalDues > 0 ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-xl' : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'}`}>
                  {totalDues > 0 ? 'Digital Payment' : 'Account Settled'}
               </button>
            </div>

            {/* Quick Support Log */}
            <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Maintenance Feed</h3>
                  <button className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">View All</button>
               </div>
               <div className="space-y-6">
                  {complaints.slice(0, 3).map(c => (
                     <div key={c.id} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs ${c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                           <i className={`fa-solid ${c.status === 'RESOLVED' ? 'fa-check' : 'fa-clock-rotate-left'}`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-xs font-black text-slate-900 truncate">{c.title}</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{c.status}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ResidentPortal;
