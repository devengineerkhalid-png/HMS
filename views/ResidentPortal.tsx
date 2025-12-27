
import React, { useState, useRef, useEffect } from 'react';
import { Complaint, Resident, BillingRecord } from '../types.ts';
import { dataStore } from '../services/dataStore.ts';

const ResidentPortal: React.FC<{ residentId: string }> = ({ residentId }) => {
  const [resident, setResident] = useState<Resident | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [myBills, setMyBills] = useState<BillingRecord[]>([]);
  const [activeModal, setActiveModal] = useState<'PAY' | 'COMPLAINT' | 'PROFILE' | 'ROOM_CHANGE' | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const allResidents = await dataStore.getResidents();
      const currentRes = allResidents.find(r => r.id === residentId);
      setResident(currentRes || null);

      const allComplaints = await dataStore.getComplaints();
      setComplaints(allComplaints.filter(c => c.residentId === residentId));

      const allBills = await dataStore.getBilling();
      setMyBills(allBills.filter(b => b.residentId === residentId));
    };
    loadData();
  }, [residentId]);

  if (!resident) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const totalDues = myBills.filter(b => b.status === 'UNPAID').reduce((acc, b) => acc + b.amount, 0);

  const syncResidentUpdates = async (updates: Partial<Resident>) => {
    setIsSyncing(true);
    try {
      // 1. Update Turso SQL (Handles Blob Store inside service)
      await dataStore.updateResident(resident.id, updates);

      // 2. Fetch fresh data to ensure we have the new Blob URL if image changed
      const allResidents = await dataStore.getResidents();
      const freshRes = allResidents.find(r => r.id === resident.id);
      
      if (freshRes) {
        setResident(freshRes);
        // Update Session
        const local = localStorage.getItem('pesh_hms_user');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed.id === resident.id) {
            localStorage.setItem('pesh_hms_user', JSON.stringify({ ...parsed, ...updates }));
          }
        }
      }
    } catch (err) {
      alert("Cloud Sync Failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updates = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      parentPhone: formData.get('parentPhone') as string,
      institutionOrOffice: formData.get('institution') as string,
    };
    await syncResidentUpdates(updates);
    setActiveModal(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Verification standards require images under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await syncResidentUpdates({ profileImage: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLodgeComplaint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newComplaint: Complaint = {
      id: `c${Date.now()}`,
      residentId: resident.id,
      title: formData.get('title') as string,
      category: formData.get('category') as any,
      status: 'OPEN',
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    // Using simple client.execute for speed
    await dataStore.execute({
      sql: "INSERT INTO complaints (id, residentId, title, category, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      args: [newComplaint.id, newComplaint.residentId, newComplaint.title, newComplaint.category, newComplaint.status, newComplaint.createdAt]
    });
    
    setComplaints([newComplaint, ...complaints]);
    setActiveModal(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

      <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden relative">
        {isSyncing && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-50 flex items-center justify-center">
             <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-black uppercase text-emerald-600">Uploading to Blob Store...</span>
             </div>
          </div>
        )}
        <div className="h-40 bg-slate-900 relative">
          <div className="absolute inset-0 bg-emerald-500/10 blur-3xl"></div>
          <div className="absolute top-4 right-8 text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.5em]">Resident Identity Node</div>
        </div>
        <div className="px-12 pb-12 -mt-16 flex flex-col md:flex-row gap-8 items-start md:items-end relative z-10">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[40px] border-8 border-white shadow-2xl overflow-hidden bg-slate-50 flex items-center justify-center transition-all group-hover:shadow-emerald-500/10">
              {resident.profileImage ? (
                <img src={resident.profileImage} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                   <i className="fa-solid fa-user-tie text-4xl text-slate-200"></i>
                   <span className="text-[8px] font-black text-slate-300 uppercase">No Image</span>
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 bg-emerald-600 text-white w-10 h-10 rounded-2xl shadow-xl hover:scale-110 transition-transform flex items-center justify-center border-4 border-white"
              title="Update Resident Photo"
            >
              <i className="fa-solid fa-camera text-xs"></i>
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{resident.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="bg-slate-900 text-emerald-400 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-800">{resident.type}</span>
              <span className="text-slate-400 font-bold text-sm tracking-tight">{resident.institutionOrOffice}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setActiveModal('PROFILE')} className="bg-white border-2 border-slate-100 text-slate-700 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              Manage Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending Liabilities</p>
              <h3 className={`text-4xl font-black mt-4 ${totalDues > 0 ? 'text-red-500' : 'text-emerald-500'}`}>Rs. {totalDues.toLocaleString()}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${totalDues > 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
              <i className="fa-solid fa-receipt"></i>
            </div>
          </div>
          <button disabled={totalDues <= 0} onClick={() => setActiveModal('PAY')} className={`w-full mt-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl ${totalDues > 0 ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
            {totalDues > 0 ? 'Proceed to Settlement' : 'No Outstanding Dues'}
          </button>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Quarter</p>
                <h3 className="text-4xl font-black mt-4 text-slate-900">{resident.roomNumber || 'Unassigned'}</h3>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100">
                <i className="fa-solid fa-door-open"></i>
              </div>
           </div>
        </div>

        <div className="bg-emerald-600 p-10 rounded-[40px] shadow-2xl relative overflow-hidden text-white group">
          <div className="absolute -right-4 -bottom-4 text-emerald-500 text-9xl group-hover:scale-110 transition-transform duration-700">
             <i className="fa-solid fa-shield-halved"></i>
          </div>
          <p className="text-[10px] font-black text-emerald-200 uppercase tracking-[0.2em] mb-4">Security Notice</p>
          <div className="space-y-4 relative z-10">
            <div className="flex gap-4">
              <div className="w-1 h-12 bg-white/20 rounded-full"></div>
              <div>
                 <p className="text-xs font-black uppercase tracking-tight">Gate Protocol Active</p>
                 <p className="text-[11px] font-medium leading-relaxed mt-1 opacity-90">Verify your night-stay clearance 4 hours prior to departure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-[10px] text-slate-900 uppercase tracking-widest">Maintenance Tickets</h3>
            <button onClick={() => setActiveModal('COMPLAINT')} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Report Issue</button>
          </div>
          <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto custom-scrollbar">
            {complaints.length > 0 ? complaints.map(c => (
              <div key={c.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs ${c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                    <i className={`fa-solid ${c.status === 'RESOLVED' ? 'fa-check' : 'fa-wrench'}`}></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">{c.title}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{c.createdAt}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span>
              </div>
            )) : (
              <div className="p-20 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest">No Active Tickets</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
           <div className="flex justify-between items-center mb-10">
              <h3 className="font-black text-[10px] text-slate-900 uppercase tracking-widest">Billing Timeline</h3>
              <i className="fa-solid fa-history text-slate-200"></i>
           </div>
           <div className="space-y-6">
             {myBills.map(b => (
               <div key={b.id} className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-2xl transition-all">
                 <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${b.status === 'PAID' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-red-50 border-red-100 text-red-500'}`}>
                       <i className="fa-solid fa-money-bill-transfer text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{b.type}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-tighter">{b.dueDate}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-black text-slate-900">Rs. {b.amount.toLocaleString()}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${b.status === 'PAID' ? 'text-emerald-500' : 'text-red-500'}`}>{b.status}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {activeModal === 'PROFILE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
           <form onSubmit={handleUpdateProfile} className="bg-white w-full max-w-lg p-12 rounded-[56px] shadow-2xl relative animate-in zoom-in duration-300">
             <button type="button" onClick={() => setActiveModal(null)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900"><i className="fa-solid fa-xmark text-xl"></i></button>
             <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Update Identity</h3>
             <p className="text-sm text-slate-500 font-medium mb-10 leading-relaxed italic">Maintain precise information for district compliance and official records.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input name="name" defaultValue={resident.name} required type="text" className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none text-sm font-bold transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Contact</label>
                    <input name="phone" defaultValue={resident.phone} required type="text" className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none text-sm font-bold transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent/Guardian Mobile</label>
                    <input name="parentPhone" defaultValue={resident.parentPhone} required type="text" className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none text-sm font-bold transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Affiliated Institution</label>
                    <input name="institution" defaultValue={resident.institutionOrOffice} required type="text" className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none text-sm font-bold transition-all" />
                </div>
             </div>
             <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-300 hover:bg-slate-800 transition-all">
               Authorize Global Sync
             </button>
           </form>
        </div>
      )}
    </div>
  );
};

export default ResidentPortal;
