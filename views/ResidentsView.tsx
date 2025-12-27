
import React, { useState, useEffect, useRef } from 'react';
import { Resident, ResidentType, Room } from '../types.ts';
import { dataStore } from '../services/dataStore.ts';

const ResidentsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'RESIDENTS' | 'ROOMS'>('RESIDENTS');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<'ENROLL' | 'CREDENTIALS' | null>(null);
  const [modalTab, setModalTab] = useState<'PROFILE' | 'LOGIN'>('PROFILE');
  const [targetResident, setTargetResident] = useState<Resident | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profileForm, setProfileForm] = useState<any>({
    name: '', cnic: '', phone: '', parentName: '', parentPhone: '', 
    type: ResidentType.STUDENT, institutionOrOffice: '', roomNumber: '',
    status: 'ACTIVE', admissionDate: new Date().toISOString().split('T')[0], dues: 0,
    permanentAddress: '', currentAddress: '', emergencyContactName: '', emergencyContactPhone: '',
    profileImage: ''
  });

  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [resData, roomData] = await Promise.all([
      dataStore.getResidents(),
      dataStore.getRooms()
    ]);
    setResidents(resData);
    setRooms(roomData);
    setLoading(false);
  };

  const handleOpenEnroll = () => {
    setProfileForm({ 
      name: '', cnic: '', phone: '', parentName: '', parentPhone: '', 
      type: ResidentType.STUDENT, institutionOrOffice: '', roomNumber: '',
      status: 'ACTIVE', admissionDate: new Date().toISOString().split('T')[0], dues: 0,
      permanentAddress: '', currentAddress: '', emergencyContactName: '', emergencyContactPhone: '',
      profileImage: ''
    });
    setLoginForm({ identifier: '', password: '' });
    setModalTab('PROFILE');
    setActiveModal('ENROLL');
  };

  const handleOpenCredentials = (res: Resident) => {
    setTargetResident(res);
    setLoginForm({ identifier: res.cnic, password: res.phone });
    setActiveModal('CREDENTIALS');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileForm({ ...profileForm, profileImage: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const saveEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newId = `res_${Date.now()}`;
      const resData = { ...profileForm, id: newId } as Resident;
      await dataStore.addResident(resData, loginForm.identifier ? loginForm : undefined);
      setActiveModal(null);
      await fetchData();
    } catch (err) {
      alert("Error saving resident.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetResident) return;
    setIsSubmitting(true);
    try {
      await dataStore.updateCredentials(targetResident.id, loginForm);
      setActiveModal(null);
      alert("Login credentials updated successfully.");
    } catch (err) {
      alert("Error updating credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteResident = async (id: string) => {
    if (!window.confirm("Permanently remove resident profile and login?")) return;
    await dataStore.deleteResident(id);
    await fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Administrative Directory</h2>
          <p className="text-sm text-slate-500 font-medium">Manage student profiles and system access nodes.</p>
        </div>
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
          <button onClick={() => setViewMode('RESIDENTS')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'RESIDENTS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Resident Base</button>
          <button onClick={() => setViewMode('ROOMS')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'ROOMS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Room Base</button>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative group flex-1 max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" placeholder="Search by name, CNIC or Room..." 
            className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-50 rounded-2xl text-sm focus:outline-none focus:border-emerald-500 font-bold"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={handleOpenEnroll} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
          <i className="fa-solid fa-user-plus"></i> Detailed Enrollment
        </button>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Resident Profile</th>
              <th className="px-8 py-5">Quarters</th>
              <th className="px-8 py-5">ID Details</th>
              <th className="px-8 py-5">Outstanding</th>
              <th className="px-8 py-5 text-right">Access & Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {residents.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.cnic.includes(searchTerm) || r.roomNumber.includes(searchTerm)).map(r => (
              <tr key={r.id} className="hover:bg-slate-50 transition-all group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                      {r.profileImage ? <img src={r.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><i className="fa-solid fa-user"></i></div>}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 leading-none mb-1">{r.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{r.type} • {r.status}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm font-black text-slate-700">{r.roomNumber || 'UNASSIGNED'}</td>
                <td className="px-8 py-5">
                   <p className="text-[10px] font-mono text-slate-400">{r.cnic}</p>
                   <p className="text-[10px] font-bold text-slate-600 mt-0.5">{r.phone}</p>
                </td>
                <td className="px-8 py-5 text-sm font-black text-red-500">Rs. {r.dues.toLocaleString()}</td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => handleOpenCredentials(r)} title="Manage Login" className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center border border-blue-100">
                      <i className="fa-solid fa-key"></i>
                    </button>
                    <button onClick={() => deleteResident(r.id)} className="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeModal === 'ENROLL' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <form onSubmit={saveEnrollment} className="bg-white w-full max-w-4xl p-0 rounded-[48px] shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black tracking-tighter">New Resident Enrollment</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Hostel Management Core Sync</p>
                 </div>
                 <div className="flex bg-white/10 rounded-2xl p-1 border border-white/10">
                    <button type="button" onClick={() => setModalTab('PROFILE')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${modalTab === 'PROFILE' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}>1. Profile</button>
                    <button type="button" onClick={() => setModalTab('LOGIN')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${modalTab === 'LOGIN' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}>2. Login</button>
                 </div>
              </div>

              <div className="p-10 overflow-y-auto custom-scrollbar">
                 {modalTab === 'PROFILE' ? (
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-1 space-y-6">
                         <div className="aspect-square bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-emerald-500 group transition-all overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                            {profileForm.profileImage ? (
                               <img src={profileForm.profileImage} className="w-full h-full object-cover rounded-[32px]" />
                            ) : (
                               <>
                                 <i className="fa-solid fa-camera text-3xl text-slate-300 mb-4 group-hover:text-emerald-500"></i>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attach Resident Photo</p>
                               </>
                            )}
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
                         </div>
                         <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <p className="text-[10px] text-emerald-800 font-bold leading-relaxed">
                               <i className="fa-solid fa-shield-halved mr-2"></i>
                               Profile photos are stored securely for police verification logs.
                            </p>
                         </div>
                      </div>

                      <div className="md:col-span-2 space-y-8">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resident Full Name</label>
                               <input required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNIC (Identity)</label>
                               <input required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" value={profileForm.cnic} onChange={e => setProfileForm({...profileForm, cnic: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Phone</label>
                               <input required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Affiliation (Uni/Office)</label>
                               <input required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" value={profileForm.institutionOrOffice} onChange={e => setProfileForm({...profileForm, institutionOrOffice: e.target.value})} />
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent's Name</label>
                               <input required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" value={profileForm.parentName} onChange={e => setProfileForm({...profileForm, parentName: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Emergency Phone</label>
                               <input required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" value={profileForm.parentPhone} onChange={e => setProfileForm({...profileForm, parentPhone: e.target.value})} />
                            </div>
                         </div>

                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Permanent Residence (Village/Tehsil/City)</label>
                            <textarea className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-medium" rows={2} value={profileForm.permanentAddress} onChange={e => setProfileForm({...profileForm, permanentAddress: e.target.value})}></textarea>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Room</label>
                               <input className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" value={profileForm.roomNumber} onChange={e => setProfileForm({...profileForm, roomNumber: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Dues</label>
                               <input type="number" className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" value={profileForm.dues} onChange={e => setProfileForm({...profileForm, dues: e.target.value})} />
                            </div>
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="max-w-md mx-auto py-10 space-y-10">
                      <div className="text-center">
                         <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm border border-blue-100">
                            <i className="fa-solid fa-lock"></i>
                         </div>
                         <h4 className="text-xl font-black text-slate-900">Configure Student Portal</h4>
                         <p className="text-xs text-slate-500 mt-2 leading-relaxed">Define the credentials the student will use to access their dashboard. If left blank, defaults will be (CNIC / Phone).</p>
                      </div>

                      <div className="space-y-6">
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Portal Username</label>
                            <input placeholder="e.g. ahmad.khan" className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-3xl outline-none focus:border-emerald-500 text-sm font-black transition-all" value={loginForm.identifier} onChange={e => setLoginForm({...loginForm, identifier: e.target.value})} />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Portal Secret Key (Password)</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-3xl outline-none focus:border-emerald-500 text-sm font-black transition-all" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
                         </div>
                      </div>
                   </div>
                 )}
              </div>

              <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex gap-4">
                 <button type="button" onClick={() => setActiveModal(null)} className="flex-1 bg-white border-2 border-slate-100 text-slate-400 py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:text-slate-900 transition-all">Discard</button>
                 <button disabled={isSubmitting} type="submit" className="flex-[2] bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-slate-800 disabled:opacity-50">
                    {isSubmitting ? 'Syncing...' : 'Complete Enrollment & Create Portal'}
                 </button>
              </div>
           </form>
        </div>
      )}

      {activeModal === 'CREDENTIALS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <form onSubmit={updateCredentials} className="bg-white w-full max-w-lg p-12 rounded-[56px] shadow-2xl animate-in zoom-in duration-300 relative">
              <button type="button" onClick={() => setActiveModal(null)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900"><i className="fa-solid fa-xmark text-xl"></i></button>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Manage Portal Access</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-10">Access for: {targetResident?.name}</p>

              <div className="space-y-6 mb-10">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Updated Username</label>
                    <input className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-3xl outline-none focus:border-blue-500 text-sm font-black transition-all" value={loginForm.identifier} onChange={e => setLoginForm({...loginForm, identifier: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-3xl outline-none focus:border-blue-500 text-sm font-black transition-all" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
                 </div>
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[32px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all">
                 {isSubmitting ? 'Updating...' : 'Commit Credential Sync'}
              </button>
           </form>
        </div>
      )}
    </div>
  );
};

export default ResidentsView;
