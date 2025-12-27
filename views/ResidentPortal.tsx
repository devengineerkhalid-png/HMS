
import React, { useState, useRef, useEffect } from 'react';
import { MOCK_RESIDENTS, MOCK_BILLING, MOCK_COMPLAINTS } from '../constants';
import { Complaint, Resident } from '../types';

const ResidentPortal: React.FC<{ residentId: string }> = ({ residentId }) => {
  const [resident, setResident] = useState<Resident>(() => {
    const local = localStorage.getItem('pesh_hms_user');
    const baseResident = MOCK_RESIDENTS.find(r => r.id === residentId) || MOCK_RESIDENTS[0];
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.profileImage) return { ...baseResident, ...parsed };
    }
    return baseResident;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(
    MOCK_COMPLAINTS.filter(c => c.residentId === residentId)
  );
  const [myBills, setMyBills] = useState(MOCK_BILLING.filter(b => b.residentId === residentId));
  const [activeModal, setActiveModal] = useState<'PAY' | 'COMPLAINT' | 'PROFILE' | 'ROOM_CHANGE' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const totalDues = myBills.filter(b => b.status === 'UNPAID').reduce((acc, b) => acc + b.amount, 0);

  const updateStoredUser = (updates: Partial<Resident>) => {
    const local = localStorage.getItem('pesh_hms_user');
    if (local) {
      const parsed = JSON.parse(local);
      localStorage.setItem('pesh_hms_user', JSON.stringify({ ...parsed, ...updates }));
    }
  };

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updates = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      parentPhone: formData.get('parentPhone') as string,
      institutionOrOffice: formData.get('institution') as string,
    };
    setResident(prev => ({ ...prev, ...updates }));
    updateStoredUser(updates);
    setActiveModal(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be under 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setResident(prev => ({ ...prev, profileImage: base64 }));
        updateStoredUser({ profileImage: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLodgeComplaint = (e: React.FormEvent<HTMLFormElement>) => {
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
    setComplaints([newComplaint, ...complaints]);
    setActiveModal(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-32 bg-slate-900 relative">
          <div className="absolute inset-0 bg-emerald-500/10 blur-2xl"></div>
        </div>
        <div className="px-8 pb-8 -mt-12 flex flex-col md:flex-row gap-6 items-start md:items-end relative z-10">
          <div className="relative group">
            <img 
              src={resident.profileImage || `https://ui-avatars.com/api/?name=${resident.name}&background=10b981&color=fff&size=256`} 
              className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl object-cover bg-white cursor-pointer hover:brightness-90 transition-all" 
              alt="Profile" 
              onClick={() => fileInputRef.current?.click()}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 bg-slate-900 text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform"
            >
              <i className="fa-solid fa-camera text-xs"></i>
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{resident.name}</h2>
            <p className="text-slate-500 font-medium mt-1">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase mr-2 tracking-widest">{resident.type}</span>
              {resident.institutionOrOffice}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setActiveModal('PROFILE')} className="bg-slate-50 border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors">
              Update Profile
            </button>
            <button onClick={() => setActiveModal('ROOM_CHANGE')} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all">
              Request Room Change
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Summaries */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending Fees</p>
            <i className="fa-solid fa-receipt text-emerald-500"></i>
          </div>
          <h3 className={`text-3xl font-black mt-4 ${totalDues > 0 ? 'text-red-600' : 'text-emerald-600'}`}>Rs. {totalDues.toLocaleString()}</h3>
          <button disabled={totalDues <= 0} onClick={() => setActiveModal('PAY')} className={`w-full mt-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${totalDues > 0 ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
            {totalDues > 0 ? 'Clear All Dues' : 'Account Cleared'}
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">My Room</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 text-xl border border-slate-100">
               <i className="fa-solid fa-door-closed"></i>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{resident.roomNumber}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">A-Block • Standard</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden text-white">
          <div className="absolute -right-4 -bottom-4 text-white/5 text-8xl"><i className="fa-solid fa-bolt"></i></div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Smart Alerts</p>
          <div className="space-y-4 relative z-10">
            <div className="flex gap-3">
              <span className="w-1 h-8 bg-emerald-500 rounded-full"></span>
              <p className="text-xs font-bold leading-relaxed">Generator will be active from 2:00 PM for PESCO load shedding.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-black text-xs text-slate-900 uppercase tracking-widest">Maintenance History</h3>
            <button onClick={() => setActiveModal('COMPLAINT')} className="text-emerald-600 font-black text-[10px] uppercase border-b-2 border-emerald-500">Lodge New</button>
          </div>
          <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {complaints.map(c => (
              <div key={c.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                    <i className={`fa-solid ${c.status === 'RESOLVED' ? 'fa-check' : 'fa-wrench'}`}></i>
                  </div>
                  <p className="font-bold text-sm text-slate-700">{c.title}</p>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Billing */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
           <h3 className="font-black text-xs text-slate-900 uppercase tracking-widest mb-6">Payment Timeline</h3>
           <div className="space-y-4">
             {myBills.map(b => (
               <div key={b.id} className="flex items-center justify-between group">
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${b.status === 'PAID' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-red-50 border-red-100 text-red-500'}`}>
                       <i className="fa-solid fa-money-bill-transfer text-xs"></i>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{b.type}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{b.dueDate}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-black text-slate-900">Rs. {b.amount.toLocaleString()}</p>
                    <p className={`text-[10px] font-black ${b.status === 'PAID' ? 'text-emerald-500' : 'text-red-500'}`}>{b.status}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Profile Modal */}
      {activeModal === 'PROFILE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <form onSubmit={handleUpdateProfile} className="bg-white w-full max-w-lg p-10 rounded-[48px] shadow-2xl relative animate-in zoom-in duration-300">
             <button type="button" onClick={() => setActiveModal(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><i className="fa-solid fa-xmark text-xl"></i></button>
             <h3 className="text-2xl font-black text-slate-900 mb-2">Edit Information</h3>
             <p className="text-sm text-slate-500 mb-8">Maintain up-to-date records for official branch logs.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input name="name" defaultValue={resident.name} required type="text" className="w-full border-2 border-slate-50 bg-slate-50 p-3 rounded-2xl focus:border-emerald-500 outline-none text-sm font-bold" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personal Phone</label>
                    <input name="phone" defaultValue={resident.phone} required type="text" className="w-full border-2 border-slate-50 bg-slate-50 p-3 rounded-2xl focus:border-emerald-500 outline-none text-sm font-bold" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent Phone</label>
                    <input name="parentPhone" defaultValue={resident.parentPhone} required type="text" className="w-full border-2 border-slate-50 bg-slate-50 p-3 rounded-2xl focus:border-emerald-500 outline-none text-sm font-bold" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institution</label>
                    <input name="institution" defaultValue={resident.institutionOrOffice} required type="text" className="w-full border-2 border-slate-50 bg-slate-50 p-3 rounded-2xl focus:border-emerald-500 outline-none text-sm font-bold" />
                </div>
             </div>
             <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all">Save Changes</button>
           </form>
        </div>
      )}
    </div>
  );
};

export default ResidentPortal;
